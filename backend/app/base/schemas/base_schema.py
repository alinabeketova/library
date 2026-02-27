from typing import TypeVar

from pydantic import BaseModel, ConfigDict


class Base(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BaseResponse(BaseModel):
    message: str


CreateDTOType = TypeVar("CreateDTOType", bound=BaseModel)
UpdateDTOType = TypeVar("UpdateDTOType", bound=BaseModel)
ResponseDTOType = TypeVar("ResponseDTOType", bound=BaseResponse)
DTOType = TypeVar("DTOType", bound=BaseModel)
