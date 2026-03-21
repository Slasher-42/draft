from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import conversation, assessment

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Annick AI — Assessment Engine",
    description="AI-powered investment readiness assessment service for RG Partners",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(conversation.router, prefix="/api")
app.include_router(assessment.router, prefix="/api")

@app.get("/")
def root():
    return {
        "service": "Annick AI — Assessment Engine",
        "powered_by": "RG Partners",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "ok"}