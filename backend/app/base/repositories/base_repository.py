from typing import Any, Generic, TypeVar

from fastapi import HTTPException
from sqlalchemy import ColumnElement, ScalarResult, delete, exc, select, update
from sqlalchemy.sql.elements import BooleanClauseList

from app.base.models.base_model import SqlModelType
from app.base.schemas.base_schema import BaseModel, CreateDTOType, DTOType, UpdateDTOType
from app.dependencies.session import ISession
from app.exceptions import NotFoundError

ParamsType = TypeVar("ParamsType")
SqlModel = type[SqlModelType]
Dto = type[DTOType]


class GenericRepository(Generic[CreateDTOType, UpdateDTOType, DTOType]):
    """Базовый репозиторий для работы с базой данных."""

    model: SqlModel
    dto: Dto

    def _get_multi_dto(self: "GenericRepository", row: ScalarResult) -> list[DTOType]:
        """Преобразование модели в список DTO."""
        return [self.dto.model_validate(model) for model in row]

    def _get_single_dto(self: "GenericRepository", row: SqlModelType) -> DTOType:
        """Преобразование модели в DTO."""
        return self.dto.model_validate(row)


class BaseRepository(GenericRepository[CreateDTOType, UpdateDTOType, DTOType]):
    """Базовый репозиторий для работы с базой данных."""

    model: SqlModel

    def __init__(self: "BaseRepository", db_session: ISession) -> None:
        self._session = db_session

    async def get_single(self: "BaseRepository", **filters: Any) -> DTOType:  # noqa: ANN401
        res = await self._session.execute(select(self.model).filter_by(**filters))
        try:
            return self._get_single_dto(res.scalar_one())
        except exc.NoResultFound as e:
            msg = f"Запись в таблице {self.model.__tablename__} не найдена"
            raise HTTPException(status_code=404, detail=msg) from e

    async def get_multi(self: "BaseRepository", **filters: Any) -> list[DTOType]:  # noqa: ANN401
        stmt = select(self.model).filter_by(**filters)
        res = await self._session.execute(stmt)
        return self._get_multi_dto(res.scalars())

    async def get_multi_pagination_filter_sort(
        self: "BaseRepository",
        filter_list: BooleanClauseList,
        order_list: list[ColumnElement[type[str]]],
        page: int | None = None,
        size: int | None = None,
    ) -> list[DTOType]:
        offset = None
        if page is not None and size is not None:
            offset = (page - 1) * size
        res = await self._session.execute(
            select(self.model).filter(filter_list).offset(offset).limit(size).order_by(*order_list)
        )
        return self._get_multi_dto(res.scalars())

    async def delete(self: "BaseRepository", **filters: int) -> None:
        stmt = select(self.model).filter_by(**filters)
        check_exists = await self._session.execute(stmt)
        if check_exists.scalar():
            await self._session.execute(delete(self.model).filter_by(**filters))
        else:
            msg = f"Запись в таблице {self.model.__tablename__} не найдена"
            raise NotFoundError(msg)
        await self._session.commit()

    async def check_exists(self: "BaseRepository", **filters: Any) -> bool:  # noqa: ANN401
        stmt = select(self.model).filter_by(**filters)
        res = await self._session.execute(stmt)
        return bool(res.scalar_one_or_none())

    async def check_exists_by_filter_list(self: "BaseRepository", filter_list: BooleanClauseList) -> bool:
        stmt = select(self.model).filter(filter_list)
        res = await self._session.execute(stmt)
        return bool(res.scalars().all())

    async def create(self: "BaseRepository", dto: CreateDTOType) -> None:
        instance = self.model(**dto.model_dump())
        self._session.add(instance)
        await self._session.commit()

    async def update(self: "BaseRepository", dto: UpdateDTOType | dict, **filters: Any) -> None:  # noqa: ANN401
        if isinstance(dto, BaseModel):
            _dto = dto.model_dump()
        elif isinstance(dto, dict):
            _dto = dto
        else:
            msg = f"Неправильный тип данных {type(dto)}"
            raise TypeError(msg)

        stmt = update(self.model).values(**_dto).filter_by(**filters).returning(self.model)
        await self._session.execute(stmt)
        await self._session.commit()

    async def create_partly(self: "BaseRepository", dto: CreateDTOType) -> None:
        instance = self.model(**dto.model_dump(exclude_none=True))
        self._session.add(instance)
        await self._session.commit()

    async def update_partly(self: "BaseRepository", dto: UpdateDTOType | dict, **filters: Any) -> None:  # noqa: ANN401
        if isinstance(dto, BaseModel):
            _dto = dto.model_dump(exclude_none=True)
        elif isinstance(dto, dict):
            _dto = dto
        else:
            msg = f"Неправильный тип данных {type(dto)}"
            raise TypeError(msg)

        stmt = update(self.model).values(**_dto).filter_by(**filters).returning(self.model)
        await self._session.execute(stmt)
        await self._session.commit()
