from fastapi import APIRouter

from app.context.faculty.controllers import faculty_controller
from app.context.location.controllers import location_controller

location_router = APIRouter()
location_router.include_router(location_controller.router_location)