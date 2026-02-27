import json
from datetime import date, datetime
from typing import List

from pydantic import Field

from app.base.schemas.base_schema import Base, BaseResponse


class BookDTO(Base):
    id: int
    title: str
    isbn: str
    publisher_id: int
    publication_year: int
    page_count: int
    illustration_count: int
    price: int


class CreateBookDTO(Base):
    title: str
    isbn: str
    publisher_id: int
    publication_year: int
    page_count: int
    illustration_count: int
    price: int


class UpdateBookDTO(Base):
    title: str
    isbn: str
    publisher_id: int
    publication_year: int
    page_count: int
    illustration_count: int
    price: int


class UpdatePartlyBookDTO(Base):
    title: str
    isbn: str
    publisher_id: int | None = None
    publication_year: int | None = None
    page_count: int | None = None
    illustration_count: int | None = None
    price: int | None = None


class SelectBookInfo(Base):
    id: int
    title: str
    isbn: str
    publication_year: int
    page_count: int
    illustration_count: int
    price: float
    publisher_name: str
    authors: str | None = None
    locations_with_copies: str | None = None
    total_copies: int
    issued_count: int | None = None
    faculties: str | None = None


class NewAuthor(Base):
    first_name: str
    last_name: str
    middle_name: str | None = None

class CreateBook(Base):
    title: str = Field(..., max_length=255)
    isbn: str = Field(..., max_length=30)
    publisher_id: int
    publication_year: int
    page_count: int
    price: float
    illustration_count: int = 0
    author_ids: List[int] | None = None
    new_authors: List[NewAuthor] | None = None  # Вложенная модель!
    faculty_ids: List[int] | None = None
    location_id: int | None = None
    copies_count: int = 1


class BookResponse(BaseResponse):
    pass