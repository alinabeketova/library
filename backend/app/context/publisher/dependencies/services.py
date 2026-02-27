from typing import Annotated

from fastapi import Depends

from app.context.faculty.services.faculty_service import FacultyService
from app.context.publisher.services.publisher_service import PublisherService

IPublisherService = Annotated[PublisherService, Depends()]