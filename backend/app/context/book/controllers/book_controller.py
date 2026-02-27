from fastapi import APIRouter, Depends

from app.auth.auth import JWTBearer
from app.context.book.dependencies.services import IBookService
from app.context.book.schemas.book_schema import SelectBookInfo, CreateBookDTO, BookResponse, CreateBook, \
    UpdatePartlyBookDTO, BookDTO
from app.exception_handler import error_handler

router_book = APIRouter(tags=["book"])


@router_book.get("/book_full_info/", summary="Get book info")
@error_handler
async def get_all_books_info(service: IBookService) -> list[SelectBookInfo]:
    return await service.get_all_books_info()

@router_book.post("/book", summary="Post book", dependencies=[Depends(JWTBearer())])
@error_handler
async def post_book(service: IBookService, data: CreateBook = Depends()) -> BookResponse:
    return await service.post_book(data=data)


@router_book.delete("/book/{book_id:int}", summary="Delete book by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def delete_book_by_id(service: IBookService, book_id: int) -> BookResponse:
    return await service.delete_book_by_id(book_id=book_id)

@router_book.patch("/book", summary="Patch user", dependencies=[Depends(JWTBearer())])
@error_handler
async def update_partly_book(service: IBookService, data: UpdatePartlyBookDTO = Depends()) -> BookResponse:
    return await service.update_partly_book(data=data)

@router_book.get("/book_by_title/{title:str}", summary="Get book by title")
@error_handler
async def get_book_by_title(service: IBookService, title: str) -> list[SelectBookInfo]:
    return await service.get_book_by_title(title=title)

@router_book.get("/book_by_author/{book_author:str}", summary="Get book by author")
@error_handler
async def get_book_by_author(service: IBookService, book_author: str) -> list[SelectBookInfo]:
    return await service.get_book_by_author(book_author=book_author)

