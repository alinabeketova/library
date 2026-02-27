from typing import Annotated

from fastapi import Depends

from app.context.book_copy.repositories.book_copy_repository import BookCopyRepository
from app.context.book_loan.repositories.book_loan_repository import BookLoanRepository
from app.context.book_reservation.repositories.book_reservation_repository import BookReservationRepository
from app.context.faculty.repositories.faculty_repository import FacultyRepository

IBookReservationRepository = Annotated[BookReservationRepository, Depends()]