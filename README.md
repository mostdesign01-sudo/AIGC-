# AIGC创意 - AI创意视频收集平台

## 项目简介

自动抓取 B站、YouTube 等平台的热门创意视频，通过 AI 智能分析，生成标签和简介，存储到七牛云并推送到飞书多维表格。

## 技术栈

- **后端**: FastAPI + SQLite
- **存储**: 七牛云 (aigc-creative bucket)
- **AI分析**: 阿里云 DashScope (qwen-vl-plus)
- **推送**: 飞书多维表格 (Phase 3)

## 快速启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 启动服务
python run.py
```

服务将在 http://localhost:8001 启动

## API 文档

启动后访问 http://localhost:8001/docs 查看交互式 API 文档

## 核心功能

### 1. 视频抓取
- `POST /api/v1/crawlers/bilibili/run` - 手动触发 B站抓取
- `GET /api/v1/crawlers/status` - 查看抓取状态

### 2. 视频列表
- `GET /api/v1/videos` - 获取视频列表
- `GET /api/v1/videos/{id}` - 获取单个视频详情

## 筛选条件

- 播放量 > 50万
- 点赞数 > 5万
- 关键词: AI、创意、教程、黑科技、自动化

## Phase 规划

| Phase | 功能 |
|-------|------|
| Phase 1 | 项目骨架 + B站抓取 + 本地存储 ✅ |
| Phase 2 | 七牛云封面存储 + AI分析 |
| Phase 3 | 飞书多维表格推送 |
| Phase 4 | 前端管理界面 |
| Phase 5 | YouTube/抖音抓取 |