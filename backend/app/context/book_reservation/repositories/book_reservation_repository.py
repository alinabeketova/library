from sqlalchemy import select, func
from datetime import timedelta

from app.base.repositories.base_repository import BaseRepository
from app.context.author.models.author_model import AuthorModel
from app.context.book.models.book_model import BookModel
from app.context.book_author.models.book_author_model import BookAuthorModel
from app.context.book_copy.models.book_copy_model import BookCopyModel

from app.context.book_reservation.models.book_reservation_model import BookReservationModel
from app.context.book_reservation.schemas.book_reservation_schema import BookReservationDTO, CreateBookReservationDTO, \
    UpdateBookReservationDTO, SelectBookReservationByUser, SelectBookReservation
from app.context.user.models.user_model import UserModel
from settings.settings import get_settings

settings = get_settings()

class BookReservationRepository(BaseRepository[CreateBookReservationDTO, UpdateBookReservationDTO, BookReservationDTO]):
    dto = BookReservationDTO
    model = BookReservationModel
    book_copy_model = BookCopyModel
    book_model = BookModel
    user_model = UserModel
    book_author_model = BookAuthorModel
    author_model = AuthorModel

    async def post_book_reservation_by_user_id(self, user_id:id) -> list[SelectBookReservationByUser]:
        return [
            SelectBookReservationByUser(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            self.book_model.id.label("book_id"),
                            self.book_model.title.label("book_title"),
                            func.string_agg(
                                        func.distinct(
                                        func.concat_ws(' ', self.author_model.first_name, self.author_model.middle_name, self.author_model.last_name)
                                ),
                                ', '
                            ).label("book_author"),
                            self.model.reservation_date,
                            (self.model.reservation_date + timedelta(days=settings.loan_period_days)).label("expiry_date")
                        )
                        .select_from(self.model)
                        .join(self.book_model, self.book_model.id == self.model.book_id)
                        .join(self.book_author_model, self.book_author_model.book_id == self.book_model.id, isouter=True)
                        .join(self.author_model, self.author_model.id == self.book_author_model.author_id, isouter=True)
                        .where(self.model.user_id == user_id)
                        .group_by(
                            self.book_model.id,
                            self.book_model.title,
                            self.model.reservation_date,
                        )
                    )
                )
                .mappings()
                .all()
            )
        ]


    async def get_book_reservation(self) -> list[SelectBookReservation]:
        return [
            SelectBookReservation(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            self.book_model.id.label("book_id"),
                            self.book_model.title.label("book_title"),
                            self.book_model.isbn,
                            self.user_model.id.label("user_id"),
                            func.string_agg(
                                        func.distinct(
                                        func.concat_ws(' ', self.user_model.first_name, self.user_model.middle_name, self.user_model.last_name)
                                ),
                                ', '
                            ).label("user_full_name"),
                            self.user_model.email.label("user_email"),
                            self.model.reservation_date,
                            (self.model.reservation_date + timedelta(days=settings.loan_period_days)).label("expiry_date")
                        )
                        .select_from(self.model)
                        .join(self.book_model, self.book_model.id == self.model.book_id)
                        .join(self.book_author_model, self.book_author_model.book_id == self.book_model.id, isouter=True)
                        .join(self.author_model, self.author_model.id == self.book_author_model.author_id, isouter=True)
                        .join(self.user_model, self.user_model.id == self.model.user_id)
                        .group_by(
                            self.book_model.id,
                            self.book_model.title,
                            self.book_model.isbn,
                            self.model.reservation_date,
                            self.user_model.id,
                            self.user_model.first_name,
                            self.user_model.last_name,
                            self.user_model.middle_name,
                            self.user_model.email
                        )
                    )
                )
                .mappings()
                .all()
            )
        ]