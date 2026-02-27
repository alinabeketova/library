import os
import urllib.parse
from http import HTTPStatus
from typing import Any

import aiohttp
from fastapi import HTTPException, Request

from app.auth.oauth_google import generate_google_oauth_redirect_uri
from app.auth.utils import create_access_token
from app.base.utils.password_utils import get_hashed_password, verify_password
from app.context.login.dependencies.repositories import ILoginRepository
from app.context.login.schemas.login_schema import GoogleTokenResponse, LoginRequestDTO, LoginResponseDTO, LoginUriDTO
from settings.settings import get_settings


class LoginService:
    def __init__(self: "LoginService", repository: ILoginRepository) -> None:
        self.repository = repository

    async def login(self: "LoginService", data: LoginRequestDTO) -> LoginResponseDTO:
        user_data = await self.repository.get_user_data_by_email(data)
        hashed_password, role = user_data
        if not verify_password(data.password, hashed_password):
            raise HTTPException(status_code=404, detail="Неверный email или пароль")

        return LoginResponseDTO(token=create_access_token(data.email), role=role)

    async def get_google_oauth_redirect_uri(self: "LoginService") -> LoginUriDTO:
        uri = generate_google_oauth_redirect_uri()
        return LoginUriDTO(uri=uri)

    async def get_google_callback(self: "LoginService", request: Request) -> GoogleTokenResponse:
        code = request.query_params.get("code")
        error = request.query_params.get("error")

        if error:
            raise HTTPException(status_code=400, detail=f"Google error: {error}")

        if not code:
            raise HTTPException(status_code=400, detail="No authorization code")

        code = urllib.parse.unquote(code)

        token_data = await self.exchange_code_for_token(code)

        return GoogleTokenResponse(
            success=True,
            access_token=token_data.get("access_token"),
            refresh_token=token_data.get("refresh_token"),
            expires_in=token_data.get("expires_in"),
            id_token=token_data.get("id_token"),
        )

    async def exchange_code_for_token(self: "LoginService", code: str) -> dict[str, Any]:
        settings = get_settings()

        redirect_uri = settings.redirect_uri_local if os.name == "nt" else settings.redirect_uri_docker

        token_data = {
            "code": code,
            "client_id": settings.oauth_google_client_id,
            "client_secret": settings.oauth_google_client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }

        def raise_http_exception(status_code: int, detail: str) -> None:
            raise HTTPException(status_code=status_code, detail=detail)

        try:
            async with (
                aiohttp.ClientSession() as session,
                session.post(
                    url=settings.token_google_url,
                    data=token_data,
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                ) as response,
            ):
                if response.status != HTTPStatus.OK:
                    try:
                        error_data = await response.json()
                        error_msg = error_data.get("error_description", error_data.get("error", "Unknown"))
                        raise_http_exception(400, f"Google OAuth error: {error_msg}")
                    except aiohttp.ContentTypeError:
                        text = await response.text()
                        raise_http_exception(400, f"Invalid response format from Google: {text[:100]}")
                    except Exception as e:
                        raise_http_exception(400, f"Failed to exchange code: {e!s}")

                return await response.json()

        except aiohttp.ClientError as e:
            raise HTTPException(status_code=503, detail="Google OAuth service unavailable") from e
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Internal server error: {e!s}") from e