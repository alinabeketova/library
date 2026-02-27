from app.base.repositories.base_repository import BaseRepository
from app.context.role.models.role_model import RoleModel
from app.context.role.schemas.role_schema import RoleDTO, CreateRoleDTO, UpdateRoleDTO



class RoleRepository(BaseRepository[CreateRoleDTO, UpdateRoleDTO, RoleDTO]):
    dto = RoleDTO
    model = RoleModel