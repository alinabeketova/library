from typing import Annotated

from fastapi import Depends

from app.context.faculty.services.faculty_service import FacultyService
from app.context.location.services.location_service import LocationService

ILocationService = Annotated[LocationService, Depends()]