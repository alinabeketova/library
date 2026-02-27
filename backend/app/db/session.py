import json
import os
from asyncio import Semaphore, Task, TaskGroup, current_task
from collections.abc import AsyncGenerator, Iterable
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Result, Select
from sqlalchemy.ext.asyncio import AsyncSession, async_scoped_session, async_sessionmaker, create_async_engine

from settings.settings import get_settings

SETTINGS = get_settings()


DB_URL_ASYNC = SETTINGS.db_url_async.format(
    db_login=SETTINGS.db_login,
    db_pass=SETTINGS.db_pass,
    db_name=SETTINGS.db_name,
    db_ip=SETTINGS.db_ip_local if os.name == "nt" else SETTINGS.db_ip_docker,
    db_port=SETTINGS.db_port_local if os.name == "nt" else SETTINGS.db_port_docker,
)
engine_async = create_async_engine(
    DB_URL_ASYNC,
    future=True,
    echo=True,
    pool_size=SETTINGS.workers - 1,
    max_overflow=SETTINGS.workers // 2,
    pool_recycle=3600,  # Переподключение соединений каждые 60 минут
    json_serializer=lambda x: json.dumps(x, ensure_ascii=False),
)
async_session = async_sessionmaker(engine_async, expire_on_commit=False, class_=AsyncSession)


class DBManager:
    def __init__(self, max_concurrent_tasks: int = 7) -> None:
        self.semaphore = Semaphore(max_concurrent_tasks)
        self.scoped_session_factory = async_scoped_session(async_session, scopefunc=_get_current_task_id)

    @asynccontextmanager
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        session = self.scoped_session_factory()
        try:
            yield session
        finally:
            await session.close()
            await self.scoped_session_factory.remove()

    async def execute_queries_in_parallel(self, queries: dict[str, Select]) -> dict[str, Task[Result]]:
        tasks = {}

        async with TaskGroup() as task_group:
            for query_name, query in queries.items():
                task = task_group.create_task(self._execute_with_semaphore(query))
                tasks[query_name] = task

        return tasks

    async def _execute_with_semaphore(self, query: Select) -> Result:
        async with self.semaphore:
            return await self.execute_query_semaphore(query)

    async def execute_query_semaphore(self, query: Select) -> Result:
        async with self.get_session() as db_session:
            return await db_session.execute(query)


async def get_db_manager() -> AsyncGenerator[DBManager, None]:
    db_manager = DBManager()
    try:
        yield db_manager
    finally:
        sessions = db_manager.scoped_session_factory.registry.registry.values()
        await _close_sessions(sessions)


async def _close_sessions(db_sessions: Iterable[AsyncSession]) -> None:
    async with TaskGroup() as task_group:
        for db_session in db_sessions:
            task_group.create_task(db_session.aclose())


def _get_current_task_id() -> int:
    return id(current_task())


async def get_db() -> AsyncGenerator:
    session: AsyncSession = async_session()
    try:
        yield session
    finally:
        await session.close()


ISession = Annotated[AsyncSession, Depends(get_db)]
