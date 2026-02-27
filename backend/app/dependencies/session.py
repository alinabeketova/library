from typing import Annotated

from aiohttp import ClientSession
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import session
from app.db.aiohttp_session import aiohttp_session

ISession = Annotated[AsyncSession, Depends(session.get_db)]
IAiohttpSession = Annotated[ClientSession, Depends(aiohttp_session.get_session)]