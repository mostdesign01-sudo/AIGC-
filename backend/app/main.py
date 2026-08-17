"""
FastAPI 主应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import router as api_router
from app.db.database import DATA_DIR, init_db
from app.services.media_service import ensure_media_dirs
import os

# 创建应用
app = FastAPI(
    title="AIGC创意双周报",
    description="AIGC 创意灵感出报工作台：周收集、双周汇总、9 类覆盖、入选 3 条、2x GIF",
    version="0.2.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def startup():
    """启动时初始化数据库"""
    os.makedirs(DATA_DIR, exist_ok=True)
    ensure_media_dirs()
    init_db()


ensure_media_dirs()
app.mount("/media", StaticFiles(directory=DATA_DIR), name="media")


@app.get("/")
def root():
    return {
        "message": "AIGC创意双周报 API",
        "version": "0.2.0",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}