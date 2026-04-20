"""
FastAPI 主应用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import router as api_router
from app.db.database import init_db
import os

# 创建应用
app = FastAPI(
    title="AIGC创意",
    description="AI创意视频收集平台",
    version="0.1.0"
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
    # 确保数据目录存在
    os.makedirs("data", exist_ok=True)
    init_db()


@app.get("/")
def root():
    return {
        "message": "AIGC创意 API",
        "version": "0.1.0",
        "docs": "/docs"
    }


@app.get("/health")
def health():
    return {"status": "ok"}