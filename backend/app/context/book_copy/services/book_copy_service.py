from app.context.book_copy.dependencies.repositories import IBookCopyRepository
from app.context.faculty.dependencies.repositories import IFacultyRepository


class BookCopyService:
    def __init__(self: "BookCopyService", repository: IBookCopyRepository) -> None:
        self.repository = repository
