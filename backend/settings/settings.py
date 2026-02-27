import os
import pathlib
from functools import lru_cache

from dotenv import load_dotenv
from pydantic import Field, ValidationError
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    port_local: int = Field(int(os.getenv("PORT_LOCAL")), validate_default=False)
    port_docker: int = Field(int(os.getenv("PORT_DOCKER")), validate_default=False)
    db_name: str = Field(os.getenv("DB_NAME"), validate_default=False)
    db_login: str = Field(os.getenv("DB_LOGIN"), validate_default=False)
    db_pass: str = Field(os.getenv("DB_PASS"), validate_default=False)
    db_ip_local: str = Field(os.getenv("DB_IP_LOCAL"), validate_default=False)
    db_ip_docker: str = Field(os.getenv("DB_IP_DOCKER"), validate_default=False)
    db_port_local: int = Field(int(os.getenv("DB_PORT_LOCAL")), validate_default=False)
    db_port_docker: int = Field(int(os.getenv("DB_PORT_DOCKER")), validate_default=False)
    db_url: str = Field(os.getenv("DB_URL"), validate_default=False)
    db_url_async: str = Field(os.getenv("DB_URL_ASYNC"), validate_default=False)
    access_token_expire_minutes: int =  Field(int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")), validate_default=False)
    refresh_token_expire_minutes: int =  Field(int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES")), validate_default=False)
    jwt_secret_key: str = Field(os.getenv("JWT_SECRET_KEY"), validate_default=False)
    jwt_refresh_secret_key: str = Field(os.getenv("JWT_REFRESH_SECRET_KEY"), validate_default=False)
    workers: int = Field(int(os.getenv("WORKERS")), validate_default=False)
    oauth_google_client_secret: str = Field(os.getenv("OAUTH_GOOGLE_CLIENT_SECRET"), validate_default=False)
    oauth_google_client_id: str = Field(os.getenv("OAUTH_GOOGLE_CLIENT_ID"), validate_default=False)
    redirect_uri_local: str = Field(os.getenv("REDIRECT_URI_LOCAL"), validate_default=False)
    redirect_uri_docker: str = Field(os.getenv("REDIRECT_URI_DOCKER"), validate_default=False)
    base_url_google: str = Field(os.getenv("BASE_URL_GOOGLE"), validate_default=False)
    token_info_url: str = Field(os.getenv("TOKEN_INFO_URL"), validate_default=False)
    user_info_url: str = Field(os.getenv("USER_INFO_URL"), validate_default=False)
    token_google_url: str = Field(os.getenv("TOKEN_GOOGLE_URL"), validate_default=False)
    loan_period_days: int = Field(int(os.getenv("LOAN_PERIOD_DAYS")), validate_default=False)

@lru_cache
def get_settings() -> Settings:
    try:
        return Settings(f"{pathlib.Path(__file__).resolve().parent}.env")
    except ValidationError:
        # print(f"path: {pathlib.Path(__file__).resolve().parent}")
        return Settings(f"{pathlib.Path(__file__).resolve().parent}/.env")