from fastapi import APIRouter, Depends

from app.auth.auth import JWTBearer
from app.context.user.dependencies.services import IUserService
from app.context.user.schemas.user_schema import SelectUserData, UserBookLoanResponse, UserBookReturnedResponse, \
    CreateUserDTO, UserResponse, UpdatePartlyUserDTO
from app.exception_handler import error_handler

router_user = APIRouter(tags=["user"])

@router_user.get("/user_email/{user_email:str}", summary="Get user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_user_by_id(service: IUserService, user_email: str) -> SelectUserData:
    return await service.get_user_data_by_email(user_email=user_email)


@router_user.get("/user_loan/{user_email:str}", summary="Get user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_user_loan_book(service: IUserService, user_email: str) -> list[UserBookLoanResponse]:
    return await service.get_user_loan_book(user_email=user_email)


@router_user.get("/user_returned_books/{user_email:str}", summary="Get user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_user_returned_books(service: IUserService, user_email: str) -> list[UserBookReturnedResponse]:
    return await service.get_user_returned_books(user_email=user_email)


@router_user.get("/user_student/", summary="Get user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_user_student(service: IUserService) -> list[SelectUserData]:
    return await service.get_user_student()

@router_user.get("/user_librarian/", summary="Get user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def get_user_librarian(service: IUserService) -> list[SelectUserData]:
    return await service.get_user_librarian()

@router_user.post("/user", summary="Post user")
@error_handler
async def post_user(service: IUserService, data: CreateUserDTO = Depends()) -> UserResponse:
    return await service.post_user(data=data)

@router_user.delete("/user/{user_id:int}", summary="Delete user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def delete_user_by_id(service: IUserService, user_id: int) -> UserResponse:
    return await service.delete_user_by_id(user_id=user_id)

@router_user.patch("/user", summary="Patch user", dependencies=[Depends(JWTBearer())])
@error_handler
async def update_partly_user(service: IUserService, data: UpdatePartlyUserDTO = Depends()) -> UserResponse:
    return await service.update_partly_user(data=data)



