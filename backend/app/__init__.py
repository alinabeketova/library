from fastapi import APIRouter

from app.context.author.route import author_router
from app.context.book.route import book_router
from app.context.book_loan.route import book_loan_router
from app.context.book_reservation.route import book_reservation_router
from app.context.faculty.route import faculty_router
from app.context.location.route import location_router
from app.context.login.route import login_router
from app.context.publisher.route import publisher_router
from app.context.role.route import role_router
from app.context.user.route import user_router

router = APIRouter()

router.include_router(login_router)
router.include_router(author_router)
router.include_router(user_router)
router.include_router(role_router)
router.include_router(book_router)
router.include_router(location_router)
router.include_router(faculty_router)
router.include_router(publisher_router)
router.include_router(book_loan_router)
router.include_router(book_reservation_router)