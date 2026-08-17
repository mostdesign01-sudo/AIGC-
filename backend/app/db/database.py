"""
数据库配置与轻量迁移
"""
import json
import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

DEFAULT_SQLITE = f"sqlite:///{os.path.join(DATA_DIR, 'videos.db')}"

engine = None
SessionLocal = None
Base = declarative_base()


def _resolve_url(url: str | None) -> str:
    if not url:
        try:
            from app.core.config import get_settings
            url = get_settings().database_url
        except Exception:
            url = DEFAULT_SQLITE
    if url.startswith("sqlite:///./"):
        rel = url.replace("sqlite:///./", "", 1)
        url = f"sqlite:///{os.path.join(BASE_DIR, rel)}"
    return url


def configure_database(url: str | None = None):
    """创建/切换引擎。测试可传入临时 sqlite。"""
    global engine, SessionLocal
    url = _resolve_url(url)
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    engine = create_engine(url, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine


configure_database()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """建表、补列、写入默认 9 类。"""
    from app.models.category import Category  # noqa: F401
    from app.models.issue import Issue  # noqa: F401
    from app.models.video import Video  # noqa: F401

    if engine is None:
        configure_database()
    Base.metadata.create_all(bind=engine)
    _migrate_video_columns()
    _seed_categories()


def _migrate_video_columns():
    """已有 videos 表只 create_all 不会加列，这里按需 ALTER。"""
    inspector = inspect(engine)
    if "videos" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("videos")}
    additions = {
        "category_id": "INTEGER",
        "issue_id": "INTEGER",
        "intro": "TEXT",
        "duration_seconds": "INTEGER DEFAULT 0",
        "media_type": "VARCHAR(20) DEFAULT 'video'",
        "item_kind": "VARCHAR(20) DEFAULT 'video'",
        "local_media_path": "VARCHAR(500)",
        "local_cover_path": "VARCHAR(500)",
        "gif_path": "VARCHAR(500)",
        "gif_status": "VARCHAR(20) DEFAULT 'none'",
        "gif_error": "TEXT",
        "selected": "BOOLEAN DEFAULT 0",
        "selected_rank": "INTEGER",
        "orientation": "VARCHAR(20) DEFAULT 'unknown'",
    }
    with engine.begin() as conn:
        for name, coltype in additions.items():
            if name not in existing:
                conn.execute(text(f"ALTER TABLE videos ADD COLUMN {name} {coltype}"))


def _seed_categories():
    from app.models.category import Category

    db = SessionLocal()
    try:
        if db.query(Category).count() > 0:
            return
        defaults_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "data",
            "default_categories.json",
        )
        with open(defaults_path, "r", encoding="utf-8") as f:
            rows = json.load(f)
        for row in rows:
            db.add(Category(
                slug=row["slug"],
                name=row["name"],
                sort_order=row.get("sort_order", 0),
                is_active=True,
                item_kind_hint=row.get("item_kind_hint", "video"),
            ))
        db.commit()
    finally:
        db.close()
