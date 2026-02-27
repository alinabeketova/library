from app.context.author.dependencies.repositories import IAuthorRepository
from app.context.author.schemas.author_schema import AuthorDTO


class AuthorService:
    def __init__(self: "AuthorService", repository: IAuthorRepository) -> None:
        self.repository = repository

    async def get_author(self: "AuthorService") -> list[AuthorDTO]:
        return await self.repository.get_multi()