import os
import urllib.parse
from http import HTTPStatus
from typing import Any

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.utils import settings
from settings.settings import get_settings

security = HTTPBearer()


def generate_google_oauth_redirect_uri() -> str:
    settings = get_settings()

    redirect_uri = settings.redirect_uri_local if os.name == "nt" else settings.redirect_uri_docker

    query_params = {
        "client_id": settings.oauth_google_client_id,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": "profile",
    }

    query_string = urllib.parse.urlencode(query_params)
    base_url = settings.base_url_google

    return f"{base_url}?{query_string}"


async def verify_google_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials

    def raise_invalid_token() -> None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    def raise_token_error(error_description: str) -> None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error_description)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.token_info_url, params={"access_token": token})

            if response.status_code != HTTPStatus.OK:
                raise_invalid_token()

            token_info = response.json()

            if "error" in token_info:
                raise_token_error(token_info["error_description"])

            return token_info

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token verification failed") from e


async def get_current_google_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict[str, Any]:
    token = credentials.credentials

    def raise_invalid_token_error() -> None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(settings.user_info_url, headers={"Authorization": f"Bearer {token}"})

            if response.status_code != HTTPStatus.OK:
                raise_invalid_token_error()

            return response.json()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed") from e
