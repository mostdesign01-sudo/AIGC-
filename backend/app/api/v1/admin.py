"""
批量上传视频封面到七牛云
"""
from fastapi import APIRouter, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.video import Video
from app.services.qiniu_service import qiniu_service
import json

router = APIRouter()


def upload_covers_task():
    """后台任务：批量上传封面"""
    db = SessionLocal()
    try:
        # 获取所有未上传封面的视频
        videos = db.query(Video).filter(
            (Video.qiniu_cover_url == None) | (Video.qiniu_cover_url == "")
        ).all()
        
        print(f"找到 {len(videos)} 个需要上传封面的视频")
        
        success = 0
        failed = 0
        
        for v in videos:
            if not v.cover_url:
                continue
            
            try:
                print(f"上传: {v.title[:30]}...")
                qiniu_url = qiniu_service.upload_from_url(v.cover_url)
                v.qiniu_cover_url = qiniu_url
                db.add(v)
                success += 1
                print(f"  成功: {qiniu_url}")
            except Exception as e:
                failed += 1
                print(f"  失败: {e}")
        
        db.commit()
        print(f"\n完成: 成功 {success}, 失败 {failed}")
        
    except Exception as e:
        print(f"批量上传失败: {e}")
    finally:
        db.close()


@router.post("/upload-covers")
def trigger_upload_covers(background_tasks: BackgroundTasks):
    """触发批量上传封面"""
    background_tasks.add_task(upload_covers_task)
    return {"message": "批量上传已启动"}