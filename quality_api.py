from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Quality Classification", description="API for classifying quality", version="1.0.0")

# Define a request model
class QualityData(BaseModel):
    parameter1: float
    parameter2: float
    parameter3: float

# Define a response model
class QualityResponse(BaseModel):
    quality: str

# A sample endpoint for quality classification
@app.post("/classify", response_model=QualityResponse)
async def classify_quality(data: QualityData):
    # Example logic for classification
    if data.parameter1 > 50 and data.parameter2 < 20:
        quality = "High"
    elif data.parameter1 > 20 and data.parameter3 > 30:
        quality = "Medium"
    else:
        quality = "Low"

    return QualityResponse(quality=quality)

# Root endpoint for health check
@app.get("/")
async def root():
    return {"message": "Welcome to the Quality Classification API!"}

# Custom error handler
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"error": exc.detail}