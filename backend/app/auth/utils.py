import time
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import jwt
from passlib.context import CryptContext

from settings.settings import get_settings

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()

ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes
REFRESH_TOKEN_EXPIRE_MINUTES = settings.refresh_token_expire_minutes
JWT_SECRET_KEY = settings.jwt_secret_key
JWT_REFRESH_SECRET_KEY = settings.jwt_refresh_secret_key
ALGORITHM = "HS256"


def create_access_token(subject: str | type[Any], expires_delta: int | None = None) -> str:
    if expires_delta is not None:
        delta = datetime.now(tz=UTC) + timedelta(minutes=expires_delta)
    else:
        delta = datetime.now(tz=UTC) + timedelta(minutes=int(ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode = {"exp": delta, "sub": str(subject)}
    return jwt.encode(to_encode, JWT_SECRET_KEY, ALGORITHM)


def create_refresh_token(subject: str | type[Any], expires_delta: int | None = None) -> str:
    if expires_delta is not None:
        delta = datetime.now(tz=UTC) + timedelta(minutes=expires_delta)
    else:
        delta = datetime.now(tz=UTC) + timedelta(minutes=int(REFRESH_TOKEN_EXPIRE_MINUTES))

    to_encode = {"exp": delta, "sub": str(subject)}
    return jwt.encode(to_encode, JWT_REFRESH_SECRET_KEY, ALGORITHM)


def decode_jwt(token: str) -> dict | None:
    try:
        decoded_token = jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
        return decoded_token if decoded_token["exp"] >= time.time() else None
    except:  # noqa: E722
        return {}


def get_data_from_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[ALGORITHM])
    except:  # noqa: E722
        return {}
