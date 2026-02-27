from json import loads
from typing import Any

from aiohttp import ClientResponse
from fastapi import HTTPException

from app.dependencies.session import IAiohttpSession
from app.exceptions import UnauthorizedError

HTTP_STATUS_OK_MIN = 200
HTTP_STATUS_OK_MAX = 299
HTTP_STATUS_FORBIDDEN = 403


class AiohttpBaseRepository:
    def __init__(self: "AiohttpBaseRepository", aiohttp_session: IAiohttpSession) -> None:
        self._session = aiohttp_session

    async def aiohttp_get(self: "AiohttpBaseRepository", **kwargs: Any) -> ClientResponse:  # noqa: ANN401
        response = await self._session.get(**kwargs)
        return await self._check_status(response)

    async def aiohttp_post(self: "AiohttpBaseRepository", **kwargs: Any) -> ClientResponse:  # noqa: ANN401
        response = await self._session.post(**kwargs)
        return await self._check_status(response)

    async def aiohttp_put(self: "AiohttpBaseRepository") -> None:
        # sonarqube comment
        pass

    async def aiohttp_delete(self: "AiohttpBaseRepository") -> None:
        # sonarqube comment
        pass

    async def aiohttp_patch(self: "AiohttpBaseRepository", **kwargs: Any) -> ClientResponse:  # noqa: ANN401
        response = await self._session.patch(**kwargs)
        return await self._check_status(response)

    async def _check_status(self: "AiohttpBaseRepository", response: ClientResponse) -> ClientResponse:
        if HTTP_STATUS_OK_MIN <= response.status <= HTTP_STATUS_OK_MAX:
            return response
        if response.status == HTTP_STATUS_FORBIDDEN:
            raise UnauthorizedError
        content = await response.content.read()
        try:
            content_json: dict = loads(content)
        except ValueError:
            content_json = {}

        detail = content_json.get("detail", response.reason)

        raise HTTPException(status_code=response.status, detail=detail)
