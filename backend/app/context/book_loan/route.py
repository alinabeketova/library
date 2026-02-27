from fastapi import APIRouter

from app.context.book_copy.controllers import book_copy_controller
from app.context.book_loan.controllers import book_loan_controller
from app.context.faculty.controllers import faculty_controller

book_loan_router = APIRouter()
book_loan_router.include_router(book_loan_controller.router_book_loan)