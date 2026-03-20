from datetime import date

from app.base.schemas.base_schema import Base, BaseResponse


class BookReservationDTO(Base):
    id: int
    book_id: int
    user_id: int
    reservation_date: date

class CreateBookReservationDTO(Base):
    book_id: int
    user_id: int
    reservation_date: date


class UpdateBookReservationDTO(Base):
    book_id: int
    user_id: int
    reservation_date: date


class SelectBookReservationByUser(Base):
    book_id: int
    book_title: str
    book_author: str
    reservation_date: date
    expiry_date: date


class SelectBookReservation(Base):
    book_reservation_id:int
    book_id: int
    book_title: str
    isbn: str
    user_full_name: str
    user_email: str
    reservation_date: date
    expiry_date: date


class BookReservationResponse(BaseResponse):
    pass