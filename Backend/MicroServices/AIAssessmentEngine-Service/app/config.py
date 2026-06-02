from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GROQ_API_KEY: str
    DATABASE_URL: str
    USER_MANAGEMENT_URL: str
    STARTUP_SERVICE_URL: str
    EVALUATION_SERVICE_URL: str = "https://evaluation-decision-service.onrender.com"
    KAFKA_BOOTSTRAP_SERVERS: str
    KAFKA_USERNAME: str = "slasher"        
    KAFKA_PASSWORD: str = ""              
    KAFKA_SASL_MECHANISM: str = "SCRAM-SHA-256" 

    class Config:
        env_file = ".env"

settings = Settings()