from fastapi import APIRouter, Depends

from app.auth.auth import JWTBearer
from app.context.book.dependencies.services import IBookService
from app.context.book_loan.dependencies.services import IBookLoanService
from app.context.book_loan.schemas.book_loan_schema import SelectBookLoanByUser, CreateBookLoanDTO, BookLoanResponse
from app.context.book_reservation.dependencies.services import IBookReservationService
from app.context.book_reservation.schemas.book_reservation_schema import CreateBookReservationDTO, \
    BookReservationResponse, SelectBookReservationByUser, SelectBookReservation
from app.exception_handler import error_handler

router_book_reservation = APIRouter(tags=["book_reservation"])



@router_book_reservation.post("/book_reservation", summary="Post book_reservation", dependencies=[Depends(JWTBearer())])
@error_handler
async def post_book_reservation(service: IBookReservationService, data: CreateBookReservationDTO) -> BookReservationResponse:
    return await service.post_book_reservation(data=data)

@router_book_reservation.get("/book_reservation_by_user_id/{user_id:int}", summary="Post book_reservation", dependencies=[Depends(JWTBearer())])
@error_handler
async def post_book_reservation_by_user_id(service: IBookReservationService, user_id:int) -> list[SelectBookReservationByUser]:
    return await service.post_book_reservation_by_user_id(user_id=user_id)


@router_book_reservation.delete("/book_reservation/", summary="Post book_reservation", dependencies=[Depends(JWTBearer())])
@error_handler
async def delete_book_reservation(service: IBookReservationService, user_id:int, book_id: int) -> BookReservationResponse:
    return await service.delete_book_reservation(user_id=user_id, book_id=book_id)


@router_book_reservation.get("/book_reservation/", summary="get book_reservation", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_book_reservation(service: IBookReservationService) -> list[SelectBookReservation]:
    return await service.get_book_reservation()
