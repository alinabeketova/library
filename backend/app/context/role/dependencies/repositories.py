from typing import Annotated

from fastapi import Depends

from app.context.role.repositories.role_repository import RoleRepository

IRoleRepository = Annotated[RoleRepository, Depends()]