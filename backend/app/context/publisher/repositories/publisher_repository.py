from app.base.repositories.base_repository import BaseRepository
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.faculty.schemas.faculty_schema import FacultyDTO, CreateFacultyDTO, UpdateFacultyDTO
from app.context.publisher.models.publisher_model import PublisherModel
from app.context.publisher.schemas.publisher_schema import PublisherDTO, CreatePublisherDTO, UpdatePublisherDTO


class PublisherRepository(BaseRepository[CreatePublisherDTO, UpdatePublisherDTO, PublisherDTO]):
    dto = PublisherDTO
    model = PublisherModel