from fastapi import FastAPI

app = FastAPI(title="AI Assessment Engine Service")

@app.get("/")
def root():
    return {"message": "Hello World", "service": "AIAssessmentEngine-Service"}

@app.get("/health")
def health():
    return {"status": "ok"}
