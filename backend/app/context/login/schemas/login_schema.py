from app.base.schemas.base_schema import Base, BaseResponse


class LoginDTO(Base):
    pass


class CreateLoginDTO(Base):
    user: str
    password: str


class UpdateLoginDTO(Base):
    pass


class LoginResponse(BaseResponse):
    pass


class LoginRequestDTO(Base):
    email: str
    password: str


class LoginResponseDTO(Base):
    token: str
    role: str


class LoginUriDTO(Base):
    uri: str


class GoogleTokenResponse(Base):
    success: bool
    access_token: str | None = None
    refresh_token: str | None = None
    expires_in: int | None = None
    id_token: str | None = None