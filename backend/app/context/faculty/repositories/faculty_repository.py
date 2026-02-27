from app.base.repositories.base_repository import BaseRepository
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.faculty.schemas.faculty_schema import FacultyDTO, CreateFacultyDTO, UpdateFacultyDTO

class FacultyRepository(BaseRepository[CreateFacultyDTO, UpdateFacultyDTO, FacultyDTO]):
    dto = FacultyDTO
    model = FacultyModel