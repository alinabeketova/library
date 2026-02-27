from app.base.repositories.base_repository import BaseRepository
from app.context.book_copy.models.book_copy_model import BookCopyModel
from app.context.book_copy.schemas.book_copy_schema import BookCopyDTO, CreateBookCopyDTO, UpdateBookCopyDTO
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.faculty.schemas.faculty_schema import FacultyDTO, CreateFacultyDTO, UpdateFacultyDTO

class BookCopyRepository(BaseRepository[CreateBookCopyDTO, UpdateBookCopyDTO, BookCopyDTO]):
    dto = BookCopyDTO
    model = BookCopyModel