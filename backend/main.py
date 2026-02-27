import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import router as app_router
from settings.settings import get_settings

settings = get_settings()


def get_application() -> FastAPI:
    project_name = "library"
    version = "0.0.1"
    application = FastAPI(title=project_name, version=version)
    application.include_router(app_router)
    return application


app = get_application()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    port = settings.port_local if os.name == "nt" else settings.port_docker
    uvicorn.run("main:app", port=port, host="0.0.0.0", reload=True)