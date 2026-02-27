from fastapi import APIRouter

from app.context.author.controllers import author_controller

author_router = APIRouter()
author_router.include_router(author_controller.router_author)