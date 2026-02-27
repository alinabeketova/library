from typing import Annotated

from fastapi import Depends

from app.context.login.repositories.login_repository import LoginRepository

ILoginRepository = Annotated[LoginRepository, Depends()]