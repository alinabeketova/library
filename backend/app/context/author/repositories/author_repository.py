from app.base.repositories.base_repository import BaseRepository
from app.context.author.models.author_model import AuthorModel
from app.context.author.schemas.author_schema import AuthorDTO, CreateAuthorDTO, UpdateAuthorDTO, UpdatePartlyAuthorDTO


class AuthorRepository(BaseRepository[CreateAuthorDTO, UpdateAuthorDTO | UpdatePartlyAuthorDTO, AuthorDTO]):
    dto = AuthorDTO
    model = AuthorModel