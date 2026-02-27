from typing import Annotated

from fastapi import Depends

from app.context.login.services.login_service import LoginService

ILoginService = Annotated[LoginService, Depends()]