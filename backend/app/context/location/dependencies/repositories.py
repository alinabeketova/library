from typing import Annotated

from fastapi import Depends

from app.context.faculty.repositories.faculty_repository import FacultyRepository
from app.context.location.repositories.location_repository import LocationRepository

ILocationRepository = Annotated[LocationRepository, Depends()]