from app.context.book.dependencies.repositories import IBookRepository
from app.context.book.schemas.book_schema import SelectBookInfo, CreateBookDTO, BookResponse, CreateBook, \
    UpdatePartlyBookDTO, BookDTO
from fastapi import HTTPException


class BookService:
    def __init__(self: "BookService", repository: IBookRepository) -> None:
        self.repository = repository


    async def get_all_books_info(self: "BookService") -> list[SelectBookInfo]:
        return await self.repository.get_all_books_info()


    async def post_book(self: "BookService", data: CreateBook) -> BookResponse:
        book_exist = await self.repository.check_exists(title=data.title)
        if book_exist:
            raise HTTPException(409, "Книга с таким названием уже существует")
        await self.repository.post_book(data)
        return BookResponse(message="Книга создана")

    async def delete_book_by_id(self: "BookService", book_id: int) -> BookResponse:
        await self.repository.delete(id=book_id)
        return BookResponse(message="Книга удалена")

    async def update_partly_book(self: "BookService", data: UpdatePartlyBookDTO) -> BookResponse:
        book_exist = await self.repository.check_exists(title=data.title)
        if not book_exist:
            raise HTTPException(404, "Книги с таким названием не существует")

        await self.repository.update_partly(data, title=data.title)

        return BookResponse(message="Книга обновлен частично")


    async def get_book_by_title(self: "BookService", title: str) -> list[SelectBookInfo]:
        return await self.repository.get_book_by_title(book_title = title)

    async def get_book_by_author(self: "BookService", book_author: str) -> list[SelectBookInfo]:
        return await self.repository.get_book_by_author(book_author=book_author)
