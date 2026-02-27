from app.base.repositories.base_repository import BaseRepository
from app.context.author.models.author_model import AuthorModel
from app.context.book.models.book_model import BookModel
from app.context.book_author.models.book_author_model import BookAuthorModel
from app.context.book_copy.models.book_copy_model import BookCopyModel
from app.context.book_loan.models.book_loan_model import BookLoanModel
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.location.models.location_model import LocationModel
from app.context.role.models.role_model import RoleModel
from sqlalchemy import func, select, case, Integer
from datetime import date, timedelta

from app.context.user.models.user_model import UserModel
from app.context.user.schemas.user_schema import UserDTO, CreateUserDTO, UpdateUserDTO, UpdatePartlyUserDTO, \
    SelectUserData, UserBookLoanResponse, UserBookReturnedResponse
from settings.settings import get_settings

settings = get_settings()

class UserRepository(BaseRepository[CreateUserDTO, UpdateUserDTO | UpdatePartlyUserDTO, UserDTO]):
    dto = UserDTO
    model = UserModel
    role_model = RoleModel
    book_loan_model = BookLoanModel
    book_copy_model = BookCopyModel
    book_model = BookModel
    location_model = LocationModel
    author_model = AuthorModel
    book_author_model = BookAuthorModel

    async def get_user_data_by_email(self, user_email: str) -> SelectUserData:
        return (
            await self._session.execute(
                select(
                    self.model.id,
                    self.model.first_name,
                    self.model.middle_name,
                    self.model.last_name,
                    self.model.date_of_birth,
                    self.model.address,
                    self.model.email,
                    self.model.passport_number,
                    self.role_model.name.label("role_name"),
                    func.count(func.distinct(self.book_loan_model.id)).label("total_loans"),
                    func.sum(
                        case(
                            (self.book_loan_model.return_date.is_(None), 1),
                            else_=0
                        )
                    ).label("active_loans")
                )
                .join(self.role_model, self.role_model.id == self.model.role_id, isouter=True)
                .join(self.book_loan_model, self.book_loan_model.user_id == self.model.id, isouter=True)
                .join(self.book_copy_model, self.book_copy_model.id == self.book_loan_model.book_copy_id, isouter=True)
                .join(self.book_model, self.book_model.id == self.book_copy_model.book_id, isouter=True)
                .join(self.location_model, self.location_model.id == self.book_copy_model.location_id, isouter=True)
                .where(self.model.email == user_email)
                .group_by(
                    self.model.id,
                    self.model.first_name,
                    self.model.middle_name,
                    self.model.last_name,
                    self.model.date_of_birth,
                    self.model.address,
                    self.model.email,
                    self.model.passport_number,
                    self.role_model.id,
                    self.role_model.name
                )
            )
        ).first()


    async def get_user_loan_book(self, user_email: str) -> list[UserBookLoanResponse]:
        return [
            UserBookLoanResponse(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            self.book_model.title.label("book_title"),
                            func.string_agg(
                                func.concat_ws(
                                    ' ',
                                    self.author_model.last_name,
                                    self.author_model.first_name,
                                    self.author_model.middle_name
                                ),
                                ', '
                            ).label("authors"),
                            self.book_loan_model.issue_date.label("issued_date"),
                            (self.book_loan_model.issue_date + timedelta(days=settings.loan_period_days)).label("due_date"),
                            (self.book_loan_model.issue_date + settings.loan_period_days - date.today()).label("days_remaining")
                        )
                        .select_from(self.model)
                        .join(self.book_loan_model, self.book_loan_model.user_id == self.model.id)
                        .join(self.book_copy_model, self.book_copy_model.id == self.book_loan_model.book_copy_id)
                        .join(self.book_model, self.book_model.id == self.book_copy_model.book_id)
                        .join(self.book_author_model, self.book_author_model.book_id == self.book_model.id)
                        .join(self.author_model, self.author_model.id == self.book_author_model.author_id)
                        .where(self.model.email == user_email)
                        .where(self.book_loan_model.return_date.is_(None))
                        .group_by(
                            self.book_model.id,
                            self.book_model.title,
                            self.book_loan_model.issue_date
                        )
                        .order_by(self.book_loan_model.issue_date.desc())
                    )
                )
                .mappings()
                .all()
            )
        ]


    async def get_user_returned_books(self, user_email: str) -> list[UserBookReturnedResponse]:
        return [
            UserBookReturnedResponse(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            self.book_model.title.label("book_title"),
                            func.string_agg(
                                func.concat_ws(
                                    ' ',
                                    self.author_model.last_name,
                                    self.author_model.first_name,
                                    self.author_model.middle_name
                                ),
                                ', '
                            ).label("authors"),
                            self.book_loan_model.issue_date.label("issued_date"),
                            self.book_loan_model.return_date.label("return_date"),
                            (self.book_loan_model.issue_date + settings.loan_period_days).label("due_date"),
                            case(
                                (self.book_loan_model.return_date <= (
                                            self.book_loan_model.issue_date + settings.loan_period_days),
                                 "возвращена вовремя"),
                                else_="возвращена с опозданием"
                            ).label("return_status"),
                            case(
                                (
                                self.book_loan_model.return_date > (self.book_loan_model.issue_date + settings.loan_period_days),
                                (self.book_loan_model.return_date - (
                                            self.book_loan_model.issue_date + settings.loan_period_days)).cast(Integer)),
                                else_=0
                            ).label("days_overdue")
                        )
                        .select_from(self.model)
                        .join(self.book_loan_model, self.book_loan_model.user_id == self.model.id)
                        .join(self.book_copy_model, self.book_copy_model.id == self.book_loan_model.book_copy_id)
                        .join(self.book_model, self.book_model.id == self.book_copy_model.book_id)
                        .join(self.book_author_model, self.book_author_model.book_id == self.book_model.id)
                        .join(self.author_model, self.author_model.id == self.book_author_model.author_id)
                        .where(self.model.email == user_email)
                        .where(self.book_loan_model.return_date.is_not(None))
                        .group_by(
                            self.book_model.id,
                            self.book_model.title,
                            self.book_loan_model.issue_date,
                            self.book_loan_model.return_date
                        )
                        .order_by(self.book_loan_model.return_date.desc())
                    )
                )
                .mappings()
                .all()
            )
        ]


    async def get_user_student(self) -> list[SelectUserData]:
        return [
            SelectUserData(**book)
            for book in (
                (
                        await self._session.execute(
                            select(
                                self.model.id,
                                self.model.first_name,
                                self.model.middle_name,
                                self.model.last_name,
                                self.model.date_of_birth,
                                self.model.address,
                                self.model.email,
                                self.model.passport_number,
                                self.role_model.name.label("role_name"),
                                func.count(func.distinct(self.book_loan_model.id)).label("total_loans"),
                                func.sum(
                                    case(
                                        (self.book_loan_model.return_date.is_(None), 1),
                                        else_=0
                                    )
                                ).label("active_loans")
                            )
                            .join(self.role_model, self.role_model.id == self.model.role_id, isouter=True)
                            .join(self.book_loan_model, self.book_loan_model.user_id == self.model.id, isouter=True)
                            .join(self.book_copy_model, self.book_copy_model.id == self.book_loan_model.book_copy_id, isouter=True)
                            .join(self.book_model, self.book_model.id == self.book_copy_model.book_id, isouter=True)
                            .join(self.location_model, self.location_model.id == self.book_copy_model.location_id, isouter=True)
                            .where(self.role_model.name.not_in(['админ', 'библиотекарь']))
                            .group_by(
                                self.model.id,
                                self.model.first_name,
                                self.model.middle_name,
                                self.model.last_name,
                                self.model.date_of_birth,
                                self.model.address,
                                self.model.email,
                                self.model.passport_number,
                                self.role_model.id,
                                self.role_model.name
                            )
                        )
                )
                .mappings()
                .all()
            )
        ]

    async def get_user_librarian(self) -> list[SelectUserData]:
        return [
            SelectUserData(**book)
            for book in (
                (
                        await self._session.execute(
                            select(
                                self.model.id,
                                self.model.first_name,
                                self.model.middle_name,
                                self.model.last_name,
                                self.model.date_of_birth,
                                self.model.address,
                                self.model.email,
                                self.model.passport_number,
                                self.role_model.name.label("role_name"),
                                func.count(func.distinct(self.book_loan_model.id)).label("total_loans"),
                                func.sum(
                                    case(
                                        (self.book_loan_model.return_date.is_(None), 1),
                                        else_=0
                                    )
                                ).label("active_loans")
                            )
                            .join(self.role_model, self.role_model.id == self.model.role_id, isouter=True)
                            .join(self.book_loan_model, self.book_loan_model.user_id == self.model.id, isouter=True)
                            .join(self.book_copy_model, self.book_copy_model.id == self.book_loan_model.book_copy_id, isouter=True)
                            .join(self.book_model, self.book_model.id == self.book_copy_model.book_id, isouter=True)
                            .join(self.location_model, self.location_model.id == self.book_copy_model.location_id, isouter=True)
                            .where(self.role_model.name.not_in(['админ', 'студент']))
                            .group_by(
                                self.model.id,
                                self.model.first_name,
                                self.model.middle_name,
                                self.model.last_name,
                                self.model.date_of_birth,
                                self.model.address,
                                self.model.email,
                                self.model.passport_number,
                                self.role_model.id,
                                self.role_model.name
                            )
                        )
                )
                .mappings()
                .all()
            )
        ]


    async def get_user_id_by_email_and_password(self, data: UpdatePartlyUserDTO) -> str | None:
        return (
            await self._session.execute(
                select(self.model.password)
                .where(self.model.email == data.email)
            )
        ).scalar_one_or_none()