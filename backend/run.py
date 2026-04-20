"""
启动脚本
"""
import uvicorn
import os
import sys

# 切换到 backend 目录
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# 启动服务
if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,  # 使用8001端口，避免和ai-design-platform冲突
        reload=True,
        reload_dirs=["app"]
    )