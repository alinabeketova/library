from typing import Annotated

from fastapi import Depends

from app.context.faculty.services.faculty_service import FacultyService

IFacultyService = Annotated[FacultyService, Depends()]