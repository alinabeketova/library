from datetime import date, datetime

from app.base.schemas.base_schema import Base, BaseResponse


class UserDTO(Base):
    id: int
    first_name: str
    middle_name: str | None = None
    last_name: str
    date_of_birth: date
    address: str | None = None
    email: str
    passport_number: str
    password: str
    role_id: int

class CreateUserDTO(Base):
    first_name: str
    middle_name: str | None = None
    last_name: str
    date_of_birth: date
    address: str | None = None
    email: str
    passport_number: str
    password: str
    role_id: int


class UpdateUserDTO(Base):
    first_name: str
    middle_name: str | None = None
    last_name: str
    date_of_birth: date
    address: str | None = None
    email: str
    passport_number: str
    password: str
    role_id: int


class UpdatePartlyUserDTO(Base):
    first_name: str | None = None
    middle_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    address: str | None = None
    email: str
    passport_number: str | None = None
    password: str
    role_id: int | None = None


class SelectUserData(Base):
    id: int
    first_name: str
    middle_name: str | None = None
    last_name: str
    date_of_birth: date
    address: str | None = None
    email: str
    passport_number: str
    role_name: str
    total_loans: int
    active_loans: int


class UserBookLoanResponse(Base):
    book_title: str
    authors: str
    issued_date: date
    due_date: date
    days_remaining: int | None = None


class UserBookReturnedResponse(Base):
    book_title: str
    authors: str
    issued_date: date
    return_date: date
    return_status: str
    days_overdue: int



class UserResponse(BaseResponse):
    pass