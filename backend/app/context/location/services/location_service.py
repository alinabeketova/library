from fastapi import HTTPException

from app.context.faculty.dependencies.repositories import IFacultyRepository
from app.context.location.dependencies.repositories import ILocationRepository
from app.context.location.schemas.location_schema import LocationDTO, LocationResponse, CreateLocationDTO


class LocationService:
    def __init__(self: "LocationService", repository: ILocationRepository) -> None:
        self.repository = repository


    async def get_location(self: "LocationService") -> list[LocationDTO]:
        return await self.repository.get_multi()

    async def delete_location_by_id(self: "LocationService", location_id: int) -> LocationResponse:
        await self.repository.delete(id=location_id)
        return LocationResponse(message="Филиал удален")

    async def post_location(self: "LocationService", data: CreateLocationDTO) -> LocationResponse:
        location_exist = await self.repository.check_exists(name=data.name)
        if location_exist:
            raise HTTPException(409, "Филиал уже существует")
        await self.repository.create(data)
        return LocationResponse(message="Филиал создан")

