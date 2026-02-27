from typing import Annotated

from fastapi import Depends

from app.context.author.services.author_service import AuthorService
from app.context.book.services.book_service import BookService

IBookService = Annotated[BookService, Depends()]