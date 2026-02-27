from typing import Annotated

from fastapi import Depends
from app.context.user.services.user_service import UserService

IUserService = Annotated[UserService, Depends()]