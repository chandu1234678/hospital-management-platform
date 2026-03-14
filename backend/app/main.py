from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from contextlib import asynccontextmanager
from loguru import logger

from app.core.database import engine
from app.core.config import settings
from app.models import Base
from app.middleware.error_handler import global_exception_handler
from app.utils.logger import setup_logger

from app.routers import (
    auth_router, user_router, patient_router, doctor_router,
    appointment_router, prescription_router, lab_router,
    billing_router, bed_router, inventory_router, admin_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logger()
    logger.info(f"Starting {settings.APP_NAME} [{settings.ENVIRONMENT}]")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created/verified")
    yield
    logger.info("Shutting down...")
    await engine.dispose()


# Hide docs in production
_docs = "/docs" if settings.DEBUG else None
_redoc = "/redoc" if settings.DEBUG else None

app = FastAPI(
    title="Deepthi Hospitals API",
    description="Production-grade Hospital Management System API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=_docs,
    redoc_url=_redoc,
    redirect_slashes=False,
)

# GZip compression for all responses > 1KB
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS — read allowed origins from env
_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Razorpay-Signature"],
)

# Global error handler
app.add_exception_handler(Exception, global_exception_handler)

# Routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(patient_router.router)
app.include_router(doctor_router.router)
app.include_router(appointment_router.router)
app.include_router(prescription_router.router)
app.include_router(lab_router.router)
app.include_router(billing_router.router)
app.include_router(bed_router.router)
app.include_router(inventory_router.router)
app.include_router(admin_router.router)


@app.get("/health", tags=["Health"], include_in_schema=False)
async def health():
    return {"status": "ok", "app": settings.APP_NAME, "env": settings.ENVIRONMENT}
