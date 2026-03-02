from fastapi import FastAPI
from app.models.base import Base
from app.core.database import engine
from app.routers import auth_router, user_router

app = FastAPI(title="Hospital Platform")


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}


# DO NOT ADD PREFIX HERE
app.include_router(auth_router.router)
app.include_router(user_router.router)