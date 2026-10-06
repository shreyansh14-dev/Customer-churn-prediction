"""
MLVerse Enterprise AI/ML Platform - Main FastAPI Application
"""

import time
import uuid
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from backend.api.routes import router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("mlverse")

app = FastAPI(
    title="MLVerse AI/ML Intelligence Platform",
    description="Production-grade predictive analytics platform for ChurnIQ, CommerceIQ, RetailIQ, and CreditRiskIQ.",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID & Logging Middleware
@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    response = await call_next(request)
    
    latency = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{latency}ms"
    
    logger.info(f"[{request_id}] {request.method} {request.url.path} - {response.status_code} ({latency}ms)")
    return response

# Structured Error Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred while processing the request.",
            "path": request.url.path,
            "timestamp": time.time()
        }
    )

# Mount Routes
app.include_router(router, prefix="/api")

# Mount Frontend Static Files if built
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join("frontend/dist", full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("frontend/dist/index.html")
else:
    @app.get("/")
    def root():
        return {
            "platform": "MLVerse",
            "flagship": "ChurnIQ",
            "tagline": "Predict. Explain. Retain.",
            "version": "1.0.0",
            "status": "Operational",
            "api_documentation": "/docs"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
