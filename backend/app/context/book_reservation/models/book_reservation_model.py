from datetime import date

from sqlalchemy import Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.base.models.base_model import Base
from app.context.book.models.book_model import BookModel
from app.context.book_copy.models.book_copy_model import BookCopyModel
from app.context.user.models.user_model import UserModel


class BookReservationModel(Base):
    __tablename__ = "book_reservation"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    book_id: Mapped[int] = mapped_column(ForeignKey(BookModel.id), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey(UserModel.id), nullable=False)
    reservation_date: Mapped[date] = mapped_column(Date, nullable=False)