from typing import Annotated

from fastapi import Depends

from app.context.faculty.repositories.faculty_repository import FacultyRepository
from app.context.publisher.repositories.publisher_repository import PublisherRepository

IPublisherRepository = Annotated[PublisherRepository, Depends()]