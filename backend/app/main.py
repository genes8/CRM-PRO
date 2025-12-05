from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.database import engine, Base, get_db
from app.config import get_settings
from app.routers import (
    auth_router,
    contacts_router,
    deals_router,
    tasks_router,
    analytics_router,
    users_router
)
from app.auth import get_current_user
from app.models.user import User
from app.seed_data import seed_example_data

# Create database tables
Base.metadata.create_all(bind=engine)

settings = get_settings()

app = FastAPI(
    title="CRM Dashboard API",
    description="A professional CRM application API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(contacts_router, prefix="/api")
app.include_router(deals_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(users_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "CRM Dashboard API", "version": "1.0.0"}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/seed")
async def seed_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Seed example data for the current user"""
    seed_example_data(db, current_user.id)
    return {"message": "Example data seeded successfully"}
