# API v1
from fastapi import APIRouter
from app.api.v1.videos import router as videos_router
from app.api.v1.crawlers import router as crawlers_router
from app.api.v1.admin import router as admin_router

router = APIRouter()
router.include_router(videos_router, prefix="/videos", tags=["videos"])
router.include_router(crawlers_router, prefix="/crawlers", tags=["crawlers"])
router.include_router(admin_router, prefix="/admin", tags=["admin"])