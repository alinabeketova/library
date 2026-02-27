from fastapi import APIRouter

from app.context.faculty.dependencies.services import IFacultyService
from app.context.faculty.schemas.faculty_schema import FacultyDTO
from app.exception_handler import error_handler

router_faculty = APIRouter(tags=["faculty"])

@router_faculty.get("/faculty", summary="Get location")
@error_handler
async def get_faculty(service: IFacultyService) -> list[FacultyDTO]:
    return await service.get_faculty()