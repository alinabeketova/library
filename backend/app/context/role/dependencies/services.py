from typing import Annotated

from fastapi import Depends

from app.context.role.services.role_service import RoleService

IRoleService = Annotated[RoleService, Depends()]