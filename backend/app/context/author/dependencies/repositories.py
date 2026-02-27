from typing import Annotated

from fastapi import Depends

from app.context.author.repositories.author_repository import AuthorRepository

IAuthorRepository = Annotated[AuthorRepository, Depends()]