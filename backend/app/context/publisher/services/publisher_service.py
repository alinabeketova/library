from app.context.faculty.dependencies.repositories import IFacultyRepository
from app.context.publisher.dependencies.repositories import IPublisherRepository
from app.context.publisher.schemas.publisher_schema import PublisherDTO


class PublisherService:
    def __init__(self: "PublisherService", repository: IPublisherRepository) -> None:
        self.repository = repository

    async def get_publisher(self: "PublisherService") -> list[PublisherDTO]:
        return await self.repository.get_multi()