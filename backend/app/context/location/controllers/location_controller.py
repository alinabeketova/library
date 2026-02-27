from fastapi import APIRouter, Depends

from app.auth.auth import JWTBearer
from app.context.location.dependencies.services import ILocationService
from app.context.location.schemas.location_schema import LocationDTO, LocationResponse, CreateLocationDTO
from app.exception_handler import error_handler

router_location = APIRouter(tags=["location"])



@router_location.get("/location", summary="Get location")
@error_handler
async def get_location(service: ILocationService) -> list[LocationDTO]:
    return await service.get_location()

@router_location.delete("/location/{location_id:int}", summary="Delete user by id", dependencies=[Depends(JWTBearer())])
@error_handler
async def delete_location_by_id(service: ILocationService, location_id: int) -> LocationResponse:
    return await service.delete_location_by_id(location_id=location_id)

@router_location.post("/location", summary="Post user", dependencies=[Depends(JWTBearer())])
@error_handler
async def post_location(service: ILocationService, data: CreateLocationDTO = Depends()) -> LocationResponse:
    return await service.post_location(data=data)

