from datetime import date, datetime

from app.base.schemas.base_schema import Base, BaseResponse


class RoleDTO(Base):
    id: int
    name: str
    description: str | None = None

class CreateRoleDTO(Base):
    name: str
    description: str | None = None


class UpdateRoleDTO(Base):
    name: str
    description: str | None = None


class UserResponse(BaseResponse):
    pass