from app.context.faculty.dependencies.repositories import IFacultyRepository
from app.context.faculty.schemas.faculty_schema import FacultyDTO


class FacultyService:
    def __init__(self: "FacultyService", repository: IFacultyRepository) -> None:
        self.repository = repository

    async def get_faculty(self: "FacultyService") -> list[FacultyDTO]:
        return await self.repository.get_multi()