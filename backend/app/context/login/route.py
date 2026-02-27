from fastapi import APIRouter

from app.context.login.controllers import login_controller

login_router = APIRouter()
login_router.include_router(login_controller.router_login)