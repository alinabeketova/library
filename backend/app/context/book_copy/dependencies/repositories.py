from typing import Annotated

from fastapi import Depends

from app.context.book_copy.repositories.book_copy_repository import BookCopyRepository
from app.context.faculty.repositories.faculty_repository import FacultyRepository

IBookCopyRepository = Annotated[BookCopyRepository, Depends()]