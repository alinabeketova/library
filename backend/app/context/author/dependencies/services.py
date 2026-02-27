from typing import Annotated

from fastapi import Depends

from app.context.author.services.author_service import AuthorService

IAuthorService = Annotated[AuthorService, Depends()]