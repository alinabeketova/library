from fastapi import APIRouter

from app.context.faculty.controllers import faculty_controller
from app.context.location.controllers import location_controller
from app.context.publisher.controllers import publisher_controller

publisher_router = APIRouter()
publisher_router.include_router(publisher_controller.router_publisher)