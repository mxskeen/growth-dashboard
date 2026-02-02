"""FastAPI main application for Growth Dashboard."""

import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.routes import progress, stats

app = FastAPI(
    title="Growth Dashboard API",
    description="API for tracking personal growth and learning progress",
    version="0.1.0",
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(progress.router, prefix="/api", tags=["progress"])
app.include_router(stats.router, prefix="/api", tags=["stats"])

# Serve static frontend files
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")


@app.get("/")
async def root():
    """Serve the frontend or return API info."""
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {
        "message": "Growth Dashboard API",
        "docs": "/docs",
        "version": "0.1.0",
    }


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
