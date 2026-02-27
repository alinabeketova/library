
from sqlalchemy import Date, ForeignKey, String, Text, Numeric, Integer
from sqlalchemy.dialects.mysql import DECIMAL
from sqlalchemy.orm import Mapped, mapped_column

from app.base.models.base_model import Base
from app.context.publisher.models.publisher_model import PublisherModel


class BookModel(Base):
    __tablename__ = "book"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    isbn: Mapped[str] = mapped_column(String(30), nullable=False)
    publisher_id: Mapped[int] = mapped_column(ForeignKey(PublisherModel.id), nullable=False)
    publication_year: Mapped[int] = mapped_column(Integer, nullable=False)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    illustration_count: Mapped[int] = mapped_column(Integer, nullable=False)
    price: Mapped[int] = mapped_column(Numeric(10, 2), nullable=False)