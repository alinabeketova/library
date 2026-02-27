import logging

from fastapi import APIRouter, Depends, Request

from app.context.login.dependencies.services import ILoginService
from app.context.login.schemas.login_schema import GoogleTokenResponse, LoginRequestDTO, LoginResponseDTO, LoginUriDTO
from app.exception_handler import error_handler

router_login = APIRouter(tags=["login"])
logger = logging.getLogger(__name__)


@router_login.post("/login", summary="Post login")
@error_handler
async def post_login(service: ILoginService, data: LoginRequestDTO = Depends()) -> LoginResponseDTO:
    return await service.login(data=data)


@router_login.get("/google/url")
@error_handler
async def get_google_oauth_redirect_uri(service: ILoginService) -> LoginUriDTO:
    return await service.get_google_oauth_redirect_uri()


@router_login.get("/login/google")
@error_handler
async def get_google_callback(service: ILoginService, request: Request) -> GoogleTokenResponse:  # -> LoginUriDTO
    return await service.get_google_callback(request=request)