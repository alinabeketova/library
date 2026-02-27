from fastapi import APIRouter, Depends

from app.auth.auth import JWTBearer
from app.context.book.dependencies.services import IBookService
from app.context.book_loan.dependencies.services import IBookLoanService
from app.context.book_loan.schemas.book_loan_schema import SelectBookLoanByUser, CreateBookLoanDTO, BookLoanResponse
from app.exception_handler import error_handler

router_book_loan = APIRouter(tags=["book_loan"])

@router_book_loan.get("/book_loan_by_user/", summary="Get book loan by user email", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_book_loan_by_user(service: IBookLoanService) -> list[SelectBookLoanByUser]:
    return await service.get_book_loan_by_user()

@router_book_loan.post("/book_loan", summary="Post book_loan", dependencies=[Depends(JWTBearer())])
@error_handler
async def post_book_loan(service: IBookLoanService, book_id: int, user_id: int) -> BookLoanResponse:
    return await service.post_book_loan(book_id=book_id, user_id=user_id)

@router_book_loan.patch("/book_loan", summary="Patch book_loan")
@error_handler
async def patch_book_loan(service: IBookLoanService, book_id: int, user_id: int) -> BookLoanResponse:
    return await service.patch_book_loan(book_id=book_id, user_id=user_id)

@router_book_loan.post("/book_loan_by_book_reservation/{book_reservation_id:int}", summary="Post book_loan")
@error_handler
async def post_book_loan_by_book_reservation(service: IBookLoanService, book_reservation_id: int) -> BookLoanResponse:
    return await service.post_book_loan_by_book_reservation(book_reservation_id=book_reservation_id)