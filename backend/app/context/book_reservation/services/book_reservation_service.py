from fastapi import HTTPException


from app.context.book_reservation.dependencies.repositories import IBookReservationRepository
from app.context.book_reservation.schemas.book_reservation_schema import CreateBookReservationDTO, \
    BookReservationResponse, SelectBookReservation
from app.context.faculty.dependencies.repositories import IFacultyRepository


class BookReservationService:
    def __init__(self: "BookReservationService", repository: IBookReservationRepository) -> None:
        self.repository = repository



    async def post_book_reservation(self: "BookReservationService", data: CreateBookReservationDTO) -> BookReservationResponse:
        book_reservation_exist = await self.repository.check_exists(user_id=data.user_id, book_id=data.book_id)
        if book_reservation_exist:
            raise HTTPException(409, "Пользователь уже забронировал эту книгу")
        await self.repository.create(data)
        return BookReservationResponse(message="Пользователь создан")


    async def post_book_reservation_by_user_id(self: "BookReservationService", user_id:int) -> BookReservationResponse:
        return await self.repository.post_book_reservation_by_user_id(user_id=user_id)

    async def delete_book_reservation(self: "BookReservationService", user_id:int, book_id: int) -> BookReservationResponse:
        await self.repository.delete(user_id=user_id, book_id=book_id)
        return BookReservationResponse(message="Бронирование удалено")

    async def get_book_reservation(self: "BookReservationService") -> list[SelectBookReservation]:
        return await self.repository.get_book_reservation()

