from typing import Annotated

from fastapi import Depends

from app.context.book_copy.services.book_copy_service import BookCopyService
from app.context.faculty.services.faculty_service import FacultyService



IBookCopyService = Annotated[BookCopyService, Depends()]