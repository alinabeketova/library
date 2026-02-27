from typing import Annotated

from fastapi import Depends
from app.context.user.repositories.user_repository import UserRepository

IUserRepository = Annotated[UserRepository, Depends()]