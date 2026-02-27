from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.base.models.base_model import Base
from app.context.author.models.author_model import AuthorModel
from app.context.book.models.book_model import BookModel
from app.context.faculty.models.faculty_model import FacultyModel


class BookFacultyrModel(Base):
    __tablename__ = "book_faculty"

    book_id: Mapped[int] = mapped_column(ForeignKey(BookModel.id), nullable=False)
    faculty_id: Mapped[int] = mapped_column(ForeignKey(FacultyModel.id), nullable=False)