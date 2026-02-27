from fastapi import APIRouter
from app.context.user.controllers import user_controller

user_router = APIRouter()
user_router.include_router(user_controller.router_user)