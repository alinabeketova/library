from fastapi import HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.security.utils import get_authorization_scheme_param

from .utils import decode_jwt


class JWTBearer(HTTPBearer):
    def __init__(self, *, auto_error: bool = True) -> None:
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials | None:
        credentials: HTTPAuthorizationCredentials | None = await self.__call(request)
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Недействительная схема аутентификации")
            if not self.verify_jwt(credentials.credentials):
                raise HTTPException(
                    status_code=403, detail="Недействительный токен или токен с истекшим сроком действия"
                )
            return credentials

        raise HTTPException(status_code=403, detail="Недействительный код авторизации")  # Invalid authorization code

    def verify_jwt(self, jwtoken: str) -> bool:
        is_token_valid: bool = False
        try:
            payload = decode_jwt(jwtoken)
        except:  # noqa: E722
            payload = None
        if payload:
            is_token_valid = True
        return is_token_valid

    async def __call(self, request: Request) -> HTTPAuthorizationCredentials | None:
        authorization = request.headers.get("Authorization")
        scheme, credentials = get_authorization_scheme_param(authorization)
        if not (authorization and scheme and credentials):
            if self.auto_error:
                raise HTTPException(status_code=403, detail="Не аутентифицирован")  # Not authenticated
            return None
        if scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(
                    status_code=403, detail="Недопустимые учетные данные для проверки подлинности"
                )  # Invalid authentication credentials
            return None
        return HTTPAuthorizationCredentials(scheme=scheme, credentials=credentials)
