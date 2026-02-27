from collections.abc import AsyncGenerator
from typing import Any

from aiohttp import ClientSession


class AiohttpSession:
    async def get_session(self: "AiohttpSession") -> AsyncGenerator[Any, Any]:
        session = ClientSession()

        try:
            yield session
        finally:
            await session.close()


aiohttp_session = AiohttpSession()
