from typing import Any, Generic

from app.base.repositories.base_repository import BaseRepository
from app.base.schemas.base_schema import CreateDTOType, DTOType, ResponseDTOType, UpdateDTOType

ResponseModel = type[ResponseDTOType]


class BaseService(Generic[CreateDTOType, UpdateDTOType, ResponseDTOType, DTOType]):
    """Базовый класс для сервисов."""

    response: ResponseModel

    def __init__(self: "BaseService", repository: BaseRepository[CreateDTOType, UpdateDTOType, DTOType]) -> None:
        self.repository = repository

    async def get(self: "BaseService", pk: int | None = None) -> DTOType | list[DTOType]:
        if pk:
            return await self.repository.get_single(id=pk)
        return await self.repository.get_multi()

    async def get_single(self: "BaseService", **filters: Any) -> DTOType:  # noqa: ANN401
        return await self.repository.get_single(**filters)

    async def delete(self: "BaseService", pk: int) -> ResponseDTOType:
        await self.repository.delete(id=pk)
        return self.response(message="Запись успешно удалена.")

    async def create(self: "BaseService", dto: CreateDTOType) -> ResponseDTOType:
        await self.repository.create(dto)
        return self.response(message="Запись успешно создана.")

    async def update(self: "BaseService", dto: UpdateDTOType, pk: int) -> ResponseDTOType:
        await self.repository.update(dto, id=pk)
        return self.response(message="Запись успешно обновлена.")
