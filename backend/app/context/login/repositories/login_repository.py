from sqlalchemy import select

from app.base.repositories.base_repository import BaseRepository
from app.context.login.schemas.login_schema import CreateLoginDTO, LoginDTO, LoginRequestDTO, UpdateLoginDTO, \
    LoginResponseDTO
from app.context.role.models.role_model import RoleModel
from app.context.user.models.user_model import UserModel


class LoginRepository(BaseRepository[CreateLoginDTO, UpdateLoginDTO, LoginDTO]):
    dto = LoginDTO
    user_model = UserModel
    role_model = RoleModel

    async def get_user_data_by_email(self, data: LoginRequestDTO) -> tuple[str, str] | None:
        return (
            await self._session.execute(
                select(self.user_model.password, self.role_model.name)
                .join(self.role_model, self.role_model.id == self.user_model.role_id)
                .where(self.user_model.email == data.email)
            )
        ).first()