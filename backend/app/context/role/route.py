from fastapi import APIRouter

from app.context.role.controllers import role_controller

role_router = APIRouter()
role_router.include_router(role_controller.router_role)