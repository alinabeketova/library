from fastapi import APIRouter

from app.context.author.controllers import author_controller
from app.context.book.controllers import book_controller

book_router = APIRouter()
book_router.include_router(book_controller.router_book)