from app.base.schemas.base_schema import Base, BaseResponse


class FacultyDTO(Base):
    id: int
    name: str
    description: str | None = None

class CreateFacultyDTO(Base):
    name: str
    description: str | None = None


class UpdateFacultyDTO(Base):
    name: str
    description: str | None = None


class UserResponse(BaseResponse):
    pass