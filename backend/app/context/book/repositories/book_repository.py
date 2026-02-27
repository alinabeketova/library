from app.base.repositories.base_repository import BaseRepository
from app.context.author.models.author_model import AuthorModel
from app.context.book.models.book_model import BookModel
from app.context.book.schemas.book_schema import BookDTO, CreateBookDTO, UpdateBookDTO, UpdatePartlyBookDTO, \
    SelectBookInfo, CreateBook
from sqlalchemy import func, select, case, Integer, String, text
from datetime import date, timedelta

from app.context.book_author.models.book_author_model import BookAuthorModel
from app.context.book_copy.models.book_copy_model import BookCopyModel
from app.context.book_faculty.models.book_faculty_model import BookFacultyrModel
from app.context.faculty.models.faculty_model import FacultyModel
from app.context.location.models.location_model import LocationModel
from app.context.publisher.models.publisher_model import PublisherModel

import json


class BookRepository(BaseRepository[CreateBookDTO, UpdateBookDTO | UpdatePartlyBookDTO, BookDTO]):
    dto = BookDTO
    model = BookModel
    publisher_model = PublisherModel
    author_model = AuthorModel
    location_model = LocationModel
    book_copy_model = BookCopyModel
    faculty_model = FacultyModel
    book_author_model = BookAuthorModel
    book_faculty_model = BookFacultyrModel


    async def get_all_books_info(self) -> list[SelectBookInfo]:
        copies_subq = (
            select(
                self.book_copy_model.book_id,
                func.coalesce(func.sum(self.book_copy_model.total_copies), 0).label("total_copies"),
                func.coalesce(func.sum(self.book_copy_model.issued_count), 0).label("issued_count"),
                func.coalesce(
                    func.string_agg(
                        func.distinct(
                            func.concat(
                                self.location_model.name,
                                ' (',
                                self.book_copy_model.total_copies.cast(String),
                                ' экз.)'
                            )
                        ),
                        ', '
                    ),
                    'Нет в наличии'  # или просто пустая строка ''
                ).label("locations_with_copies")
            )
            .join(self.location_model, self.location_model.id == self.book_copy_model.location_id)
            .group_by(self.book_copy_model.book_id)
            .subquery()
        )
        # Подзапрос для авторов
        authors_subq = (
            select(
                self.book_author_model.book_id,
                func.string_agg(
                    func.distinct(
                        func.concat_ws(
                            ' ',
                            self.author_model.first_name,
                            self.author_model.middle_name,
                            self.author_model.last_name
                        )
                    ),
                    ', '
                ).label("authors")
            )
            .join(self.author_model, self.author_model.id == self.book_author_model.author_id)
            .group_by(self.book_author_model.book_id)
            .subquery()
        )
        # Подзапрос для факультетов
        faculties_subq = (
            select(
                self.book_faculty_model.book_id,
                func.string_agg(
                    func.distinct(self.faculty_model.name),
                    ', '
                ).label("faculties")
            )
            .join(self.faculty_model, self.faculty_model.id == self.book_faculty_model.faculty_id)
            .group_by(self.book_faculty_model.book_id)
            .subquery()
        )
        # Основной запрос
        result = await self._session.execute(
            select(
                self.model.id,
                self.model.title,
                self.model.isbn,
                self.model.publication_year,
                self.model.page_count,
                self.model.illustration_count,
                self.model.price,
                self.publisher_model.name.label("publisher_name"),
                authors_subq.c.authors,
                copies_subq.c.locations_with_copies,
                func.coalesce(copies_subq.c.total_copies, 0).label("total_copies"),
                func.coalesce(copies_subq.c.issued_count, 0).label("issued_count"),
                faculties_subq.c.faculties
            )
            .select_from(self.model)
            .join(self.publisher_model, self.publisher_model.id == self.model.publisher_id, isouter=True)
            .join(authors_subq, authors_subq.c.book_id == self.model.id, isouter=True)
            .join(copies_subq, copies_subq.c.book_id == self.model.id, isouter=True)
            .join(faculties_subq, faculties_subq.c.book_id == self.model.id, isouter=True)
            .order_by(self.model.title)
        )

        return [SelectBookInfo(**row) for row in result.mappings().all()]


    async def post_book(self, data: CreateBook) -> dict:
            author_ids_str = ','.join(map(str, data.author_ids)) if data.author_ids else None
            faculty_ids_str = ','.join(map(str, data.faculty_ids)) if data.faculty_ids else None
            new_authors_str = None
            if data.new_authors:
                authors_list = [author.model_dump() for author in data.new_authors]
                new_authors_str = json.dumps(authors_list, ensure_ascii=False)

            query = text("""
                SELECT public.add_book_with_relations(
                    :title,
                    :isbn,
                    :publisher_id,
                    :publication_year,
                    :page_count,
                    :price,
                    :illustration_count,
                    :author_ids,
                    :new_authors,
                    :faculty_ids,
                    :location_id,
                    :copies_count
                )
            """)

            params = {
                "title": data.title,
                "isbn": data.isbn,
                "publisher_id": data.publisher_id,
                "publication_year": data.publication_year,
                "page_count": data.page_count,
                "price": float(data.price),  # явно float
                "illustration_count": data.illustration_count,
                "author_ids": author_ids_str,  # "1,2,3"
                "new_authors": new_authors_str,  # JSON строка
                "faculty_ids": faculty_ids_str,  # "1,2"
                "location_id": data.location_id,
                "copies_count": data.copies_count
            }

            result = await self._session.scalar(query, params)
            await self._session.commit()

            # Парсим JSON из строки
            if isinstance(result, str):
                return json.loads(result)
            return result


    async def get_book_by_title(self, book_title: str) -> list[SelectBookInfo]:
        return [
            SelectBookInfo(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            self.model.id,
                            self.model.title,
                            self.model.isbn,
                            self.model.publication_year,
                            self.model.page_count,
                            self.model.illustration_count,
                            self.model.price,
                            self.publisher_model.name.label("publisher_name"),
                            func.string_agg(
                                func.distinct(
                                    func.concat_ws(
                                        ' ',
                                        self.author_model.first_name,
                                        self.author_model.middle_name,
                                        self.author_model.last_name
                                    )
                                ),
                                ', '
                            ).label("authors"),
                            func.string_agg(
                                func.distinct(
                                    func.concat(
                                        self.location_model.name,
                                        ' (',
                                        self.book_copy_model.total_copies.cast(String),
                                        ' экз.)'
                                    )
                                ),
                                ', '
                            ).label("locations_with_copies"),
                            func.coalesce(func.sum(self.book_copy_model.total_copies), 0).label("total_copies"),
                            func.string_agg(
                                func.distinct(self.faculty_model.name),
                                ', '
                            ).label("faculties")
                        )
                        .select_from(self.model)
                        .join(self.publisher_model, self.publisher_model.id == self.model.publisher_id,
                              isouter=True)
                        .join(self.book_copy_model, self.book_copy_model.book_id == self.model.id, isouter=True)
                        .join(self.location_model, self.location_model.id == self.book_copy_model.location_id,
                              isouter=True)
                        .join(self.book_author_model, self.book_author_model.book_id == self.model.id,
                              isouter=True)
                        .join(self.author_model, self.author_model.id == self.book_author_model.author_id, isouter=True)
                        .join(self.book_faculty_model, self.book_faculty_model.book_id == self.model.id,
                              isouter=True)
                        .join(self.faculty_model, self.faculty_model.id == self.book_faculty_model.faculty_id,
                              isouter=True)
                        .where(self.model.title == book_title)
                        .group_by(
                            self.model.id,
                            self.model.title,
                            self.model.publication_year,
                            self.model.page_count,
                            self.model.illustration_count,
                            self.model.price,
                            self.publisher_model.name
                        )
                        .order_by(self.model.title)
                    )
                )
                .mappings()
                .all()
            )
        ]


    async def get_book_by_author(self, book_author: str) -> list[SelectBookInfo]:
        return [
            SelectBookInfo(**book)
            for book in (
                (
                    await self._session.execute(
                        select(
                            self.model.id,
                            self.model.title,
                            self.model.isbn,
                            self.model.publication_year,
                            self.model.page_count,
                            self.model.illustration_count,
                            self.model.price,
                            self.publisher_model.name.label("publisher_name"),
                            func.string_agg(
                                func.distinct(
                                    func.concat_ws(
                                        ' ',
                                        self.author_model.first_name,
                                        self.author_model.middle_name,
                                        self.author_model.last_name
                                    )
                                ),
                                ', '
                            ).label("authors"),
                            func.string_agg(
                                func.distinct(
                                    func.concat(
                                        self.location_model.name,
                                        ' (',
                                        self.book_copy_model.total_copies.cast(String),
                                        ' экз.)'
                                    )
                                ),
                                ', '
                            ).label("locations_with_copies"),
                            func.coalesce(func.sum(self.book_copy_model.total_copies), 0).label("total_copies"),
                            func.string_agg(
                                func.distinct(self.faculty_model.name),
                                ', '
                            ).label("faculties")
                        )
                        .select_from(self.model)
                        .join(self.publisher_model, self.publisher_model.id == self.model.publisher_id,
                              isouter=True)
                        .join(self.book_copy_model, self.book_copy_model.book_id == self.model.id, isouter=True)
                        .join(self.location_model, self.location_model.id == self.book_copy_model.location_id,
                              isouter=True)
                        .join(self.book_author_model, self.book_author_model.book_id == self.model.id,
                              isouter=True)
                        .join(self.author_model, self.author_model.id == self.book_author_model.author_id, isouter=True)
                        .join(self.book_faculty_model, self.book_faculty_model.book_id == self.model.id,
                              isouter=True)
                        .join(self.faculty_model, self.faculty_model.id == self.book_faculty_model.faculty_id,
                              isouter=True)
                        .where(
                            func.concat_ws(
                                ' ',
                                self.author_model.first_name,
                                self.author_model.middle_name,
                                self.author_model.last_name
                            ) == book_author
                        )
                        .group_by(
                            self.model.id,
                            self.model.title,
                            self.model.publication_year,
                            self.model.page_count,
                            self.model.illustration_count,
                            self.model.price,
                            self.publisher_model.name
                        )
                        .order_by(self.model.title)
                    )
                )
                .mappings()
                .all()
            )
        ]