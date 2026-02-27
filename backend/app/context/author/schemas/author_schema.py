from datetime import date, datetime

from app.base.schemas.base_schema import Base, BaseResponse


class AuthorDTO(Base):
    id: int
    first_name: str
    middle_name: str | None = None
    last_name: str


class CreateAuthorDTO(Base):
    first_name: str
    middle_name: str | None = None
    last_name: str


class UpdateAuthorDTO(Base):
    first_name: str
    middle_name: str | None = None
    last_name: str


class UpdatePartlyAuthorDTO(Base):
    first_name: str
    middle_name: str | None = None
    last_name: str


class AuthorResponse(BaseResponse):
    pass