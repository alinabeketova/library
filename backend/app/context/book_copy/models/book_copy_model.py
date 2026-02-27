from sqlalchemy import Date, ForeignKey, String, Text, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.base.models.base_model import Base
from app.context.book.models.book_model import BookModel
from app.context.location.models.location_model import LocationModel


class BookCopyModel(Base):
    __tablename__ = "book_copy"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey(BookModel.id), nullable=False)
    location_id: Mapped[int] = mapped_column(ForeignKey(LocationModel.id), nullable=False)
    total_copies: Mapped[int] = mapped_column(Integer, nullable=False)
    issued_count: Mapped[int] = mapped_column(Integer, nullable=False)