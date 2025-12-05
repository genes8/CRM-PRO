from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    
    # App Settings
    secret_key: str = "dev-secret-key-change-in-production"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    
    # Database
    database_url: str = "sqlite:///./crm.db"
    
    # Cookie settings
    cookie_name: str = "crm_session"
    cookie_max_age: int = 60 * 60 * 24 * 7  # 7 days
    
    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
