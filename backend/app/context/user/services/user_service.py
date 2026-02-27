from fastapi import HTTPException

from app.base.utils.password_utils import get_hashed_password, verify_password
from app.context.user.dependencies.repositories import IUserRepository
from app.context.user.schemas.user_schema import SelectUserData, UserBookLoanResponse, UserBookReturnedResponse, \
    CreateUserDTO, UserResponse, UpdatePartlyUserDTO


class UserService:
    def __init__(self: "UserService", repository: IUserRepository) -> None:
        self.repository = repository


    async def get_user_data_by_email(self: "UserService", user_email: str) -> SelectUserData:
        return await self.repository.get_user_data_by_email(user_email=user_email)

    async def get_user_loan_book(self: "UserService", user_email: str) -> list[UserBookLoanResponse]:
        return await self.repository.get_user_loan_book(user_email=user_email)

    async def get_user_returned_books(self: "UserService", user_email: str) -> list[UserBookReturnedResponse]:
        return await self.repository.get_user_returned_books(user_email=user_email)

    async def get_user_student(self: "UserService") -> list[SelectUserData]:
        return await self.repository.get_user_student()

    async def get_user_librarian(self: "UserService") -> list[SelectUserData]:
        return await self.repository.get_user_librarian()

    async def post_user(self: "UserService", data: CreateUserDTO) -> UserResponse:
        user_exist = await self.repository.check_exists(email=data.email)
        if user_exist:
            raise HTTPException(409, "Пользователем с таким email уже существует")

        hashed_password = get_hashed_password(data.password)
        new_user = CreateUserDTO(**data.model_dump(exclude={"password"}), password=hashed_password)
        await self.repository.create(new_user)

        return UserResponse(message="Пользователь создан")


    async def delete_user_by_id(self: "UserService", user_id: int) -> UserResponse:
        await self.repository.delete(id=user_id)
        return UserResponse(message="Пользователь удален")

    async def update_partly_user(self: "UserService", data: UpdatePartlyUserDTO) -> UserResponse:
        user_exist = await self.repository.check_exists(email=data.email)
        if not user_exist:
            raise HTTPException(404, "Пользователя с таким email не существует")

        hashed_password = get_hashed_password(data.password)
        user = UpdatePartlyUserDTO(**data.model_dump(exclude={"password"}), password=hashed_password)
        await self.repository.update_partly(user, email=user.email)

        return UserResponse(message="Пользователь обновлен частично")