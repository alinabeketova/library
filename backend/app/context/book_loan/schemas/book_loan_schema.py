from datetime import date

from app.base.schemas.base_schema import Base, BaseResponse


class BookLoanDTO(Base):
    id: int
    book_copy_id: int
    user_id: int
    issue_date: date
    return_date: date | None = None

class CreateBookLoanDTO(Base):
    book_copy_id: int
    user_id: int
    issue_date: date
    return_date: date | None = None


class UpdateBookLoanDTO(Base):
    book_copy_id: int
    user_id: int
    issue_date: date
    return_date: date | None = None


class SelectBookLoanByUser(Base):
    full_name: str
    email: str
    title: str
    issue_date: date
    return_date: date | None = None


class BookLoanResponse(BaseResponse):
    pass