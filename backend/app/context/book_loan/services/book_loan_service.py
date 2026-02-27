from fastapi import HTTPException

from app.context.book_copy.dependencies.repositories import IBookCopyRepository
from app.context.book_loan.dependencies.repositories import IBookLoanRepository
from app.context.book_loan.schemas.book_loan_schema import SelectBookLoanByUser, BookLoanResponse, CreateBookLoanDTO
from app.context.faculty.dependencies.repositories import IFacultyRepository


class BookLoanService:
    def __init__(self: "BookLoanService", repository: IBookLoanRepository) -> None:
        self.repository = repository


    async def get_book_loan_by_user(self: "BookLoanService") -> list[SelectBookLoanByUser]:
        return await self.repository.get_book_loan_by_user()

    async def post_book_loan(self: "BookLoanService", book_id: int, user_id: int) -> BookLoanResponse:
        result = await self.repository.create_book_loan(book_id=book_id, user_id=user_id)
        if result is None:
            raise HTTPException(404, "Такой книги нету")
        return BookLoanResponse(message="Выдача создана")


    async def patch_book_loan(self: "BookLoanService", book_id: int, user_id: int) -> BookLoanResponse:
        result = await self.repository.patch_book_loan(book_id=book_id, user_id=user_id)
        if result is None:
            raise HTTPException(404, "Ошибка")
        return BookLoanResponse(message="Выдача создана")




    async def post_book_loan_by_book_reservation(self: "BookLoanService", book_reservation_id: int) -> BookLoanResponse:
        result = await self.repository.create_book_reservation_id(book_reservation_id=book_reservation_id)
        if result is None:
            raise HTTPException(404, "Такого бронирования нету")
        return BookLoanResponse(message="Выдача создана")
