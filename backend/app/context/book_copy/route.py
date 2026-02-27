from fastapi import APIRouter

from app.context.book_copy.controllers import book_copy_controller
from app.context.faculty.controllers import faculty_controller

book_copy_router = APIRouter()
book_copy_router.include_router(book_copy_controller.router_book_copy)