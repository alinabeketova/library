from fastapi import APIRouter

from app.context.faculty.controllers import faculty_controller

faculty_router = APIRouter()
faculty_router.include_router(faculty_controller.router_faculty)