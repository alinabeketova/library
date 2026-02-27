from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.base.models.base_model import Base
from app.context.author.models.author_model import AuthorModel
from app.context.book.models.book_model import BookModel


class BookAuthorModel(Base):
    __tablename__ = "book_author"

    book_id: Mapped[int] = mapped_column(ForeignKey(BookModel.id), nullable=False)
    author_id: Mapped[int] = mapped_column(ForeignKey(AuthorModel.id), nullable=False)