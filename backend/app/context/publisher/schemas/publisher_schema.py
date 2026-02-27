from app.base.schemas.base_schema import Base, BaseResponse


class PublisherDTO(Base):
    id: int
    name: str
    address: str | None = None

class CreatePublisherDTO(Base):
    name: str
    address: str | None = None


class UpdatePublisherDTO(Base):
    name: str
    address: str | None = None


class UserResponse(BaseResponse):
    pass