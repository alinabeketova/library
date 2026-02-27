from typing import Annotated

from fastapi import Depends

from app.context.faculty.repositories.faculty_repository import FacultyRepository

IFacultyRepository = Annotated[FacultyRepository, Depends()]