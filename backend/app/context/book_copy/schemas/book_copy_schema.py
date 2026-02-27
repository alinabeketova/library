from app.base.schemas.base_schema import Base, BaseResponse


class BookCopyDTO(Base):
    id: int
    name: str
    description: str | None = None

class CreateBookCopyDTO(Base):
    name: str
    description: str | None = None


class UpdateBookCopyDTO(Base):
    name: str
    description: str | None = None


class UserResponse(BaseResponse):
    pass