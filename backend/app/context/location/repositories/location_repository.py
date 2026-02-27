from app.base.repositories.base_repository import BaseRepository
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.faculty.schemas.faculty_schema import FacultyDTO, CreateFacultyDTO, UpdateFacultyDTO
from app.context.location.models.location_model import LocationModel
from app.context.location.schemas.location_schema import LocationDTO, CreateLocationDTO, UpdateLocationDTO


class LocationRepository(BaseRepository[CreateLocationDTO, UpdateLocationDTO, LocationDTO]):
    dto = LocationDTO
    model = LocationModel