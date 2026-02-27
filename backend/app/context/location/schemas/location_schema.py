from app.base.schemas.base_schema import Base, BaseResponse


class LocationDTO(Base):
    id: int
    name: str
    address: str | None = None

class CreateLocationDTO(Base):
    name: str
    address: str | None = None


class UpdateLocationDTO(Base):
    name: str
    address: str | None = None


class LocationResponse(BaseResponse):
    pass