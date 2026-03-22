from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    DATABASE_URL: str
    USER_MANAGEMENT_URL: str
    STARTUP_SERVICE_URL: str
    KAFKA_BOOTSTRAP_SERVERS: str
    PORT: int = 8083

    class Config:
        env_file = ".env"

settings = Settings()