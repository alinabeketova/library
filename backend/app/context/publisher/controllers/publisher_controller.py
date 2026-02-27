from fastapi import APIRouter

from app.context.publisher.dependencies.services import IPublisherService
from app.context.publisher.schemas.publisher_schema import PublisherDTO
from app.exception_handler import error_handler

router_publisher = APIRouter(tags=["publisher"])

@router_publisher.get("/publisher", summary="Get publisher")
@error_handler
async def get_publisher(service: IPublisherService) -> list[PublisherDTO]:
    return await service.get_publisher()