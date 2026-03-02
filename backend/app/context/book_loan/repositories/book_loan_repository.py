from sqlalchemy import select, func, update, insert, and_, text
from sqlalchemy.orm import joinedload

from app.base.repositories.base_repository import BaseRepository
from app.context.book.models.book_model import BookModel
from app.context.book_copy.models.book_copy_model import BookCopyModel
from app.context.book_copy.schemas.book_copy_schema import BookCopyDTO, CreateBookCopyDTO, UpdateBookCopyDTO
from app.context.book_loan.models.book_loan_model import BookLoanModel
from app.context.book_loan.schemas.book_loan_schema import BookLoanDTO, CreateBookLoanDTO, UpdateBookLoanDTO, \
    SelectBookLoanByUser
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.faculty.schemas.faculty_schema import FacultyDTO, CreateFacultyDTO, UpdateFacultyDTO
from app.context.user.models.user_model import UserModel
from sqlalchemy import literal_column


class BookLoanRepository(BaseRepository[CreateBookLoanDTO, UpdateBookLoanDTO, BookLoanDTO]):
    dto = BookLoanDTO
    model = BookLoanModel
    book_copy_model = BookCopyModel
    book_model = BookModel
    user_model = UserModel

    async def get_book_loan_by_user(self) -> list[SelectBookLoanByUser]:
        return [
            SelectBookLoanByUser(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            (self.user_model.last_name + ' ' + self.user_model.first_name +
                             func.coalesce(' ' + self.user_model.middle_name, '')).label('full_name'),
                            self.user_model.email,
                            self.book_model.title,
                            self.model.issue_date,
                            self.model.return_date
                        )
                        .select_from(self.model)
                        .join(self.user_model, self.user_model.id == self.model.user_id,
                              isouter=True)
                        .join(self.book_copy_model, self.book_copy_model.id == self.model.book_copy_id, isouter=True)
                        .join(self.book_model, self.book_model.id == self.book_copy_model.book_id,
                              isouter=True)
                    )
                )
                .mappings()
                .all()
            )
        ]

    async def create_book_loan(self, book_id: int, user_id: int) -> int | None:
        query = text("""
            WITH selected_copy AS (
                SELECT bc.id
                FROM public.book_copy bc
                WHERE bc.book_id = :book_id
                  AND bc.total_copies > bc.issued_count
                ORDER BY bc.id
                LIMIT 1
                FOR UPDATE
            ),
            update_copy AS (
                UPDATE public.book_copy
                SET issued_count = issued_count + 1
                WHERE id IN (SELECT id FROM selected_copy)
                  AND total_copies > issued_count
                RETURNING id
            )
            INSERT INTO public.book_loan (book_copy_id, user_id, issue_date, return_date)
            SELECT id, :user_id, CURRENT_DATE, NULL 
            FROM update_copy
            RETURNING id;
        """)
        async with self._session.begin():
            result = await self._session.execute(
                query,
                {"book_id": book_id, "user_id": user_id}
            )
            await self._session.commit()

            return result.scalar_one_or_none()

    async def patch_book_loan(self, book_id: int, user_id: int) -> int | None:
        query = text("""
            WITH updated_loan AS (
                UPDATE public.book_loan bl
                SET return_date = CURRENT_DATE
                FROM public.book_copy bc
                WHERE bl.book_copy_id = bc.id
                  AND bc.book_id = :book_id
                  AND bl.user_id = :user_id
                  AND bl.return_date IS NULL
                RETURNING bl.book_copy_id
            )
            UPDATE public.book_copy
            SET issued_count = issued_count - 1
            WHERE id = (SELECT book_copy_id FROM updated_loan)
            RETURNING id;
        """)

        async with self._session.begin():
            result = await self._session.execute(
                query,
                {"book_id": book_id, "user_id": user_id}
            )
            # Получаем ID обновлённого book_copy или None
            book_copy_id = result.scalar_one_or_none()
            return book_copy_id

    async def create_book_reservation_id(self, book_reservation_id: int) -> int | None:
        query = text("""
            WITH reservation_data AS (
                -- Получаем данные бронирования
                SELECT 
                    br.user_id,
                    br.book_id
                FROM public.book_reservation br
                WHERE br.id = :reservation_id
            ),
            selected_copy AS (
                -- Находим доступный экземпляр книги
                SELECT bc.id
                FROM public.book_copy bc
                WHERE bc.book_id = (SELECT book_id FROM reservation_data)
                    AND bc.total_copies > bc.issued_count
                ORDER BY bc.id
                LIMIT 1
                FOR UPDATE
            ),
            update_copy AS (
                -- Увеличиваем счетчик выданных экземпляров
                UPDATE public.book_copy
                SET issued_count = issued_count + 1
                WHERE id IN (SELECT id FROM selected_copy)
                    AND total_copies > issued_count
                RETURNING id
            ),
            insert_loan AS (
                -- Создаем запись о выдаче
                INSERT INTO public.book_loan (book_copy_id, user_id, issue_date, return_date)
                SELECT 
                    uc.id, 
                    (SELECT user_id FROM reservation_data), 
                    CURRENT_DATE, 
                    NULL 
                FROM update_copy uc
                RETURNING id
            ),
            delete_reservation AS (
                -- Удаляем обработанное бронирование
                DELETE FROM public.book_reservation
                WHERE id = :reservation_id
                    AND EXISTS (SELECT 1 FROM insert_loan)
                RETURNING id
            )
            SELECT id FROM insert_loan;
        """)

        async with self._session.begin():
            result = await self._session.execute(
                query,
                {"reservation_id": book_reservation_id}
            )
            await self._session.commit()

            loan_id = result.scalar_one_or_none()
            return loan_id