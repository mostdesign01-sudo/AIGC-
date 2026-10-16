"""
七牛云存储服务 - 处理B站图片防盗链
"""
from qiniu import Auth, put_data
from app.core.config import get_settings
import requests
import uuid
import time

settings = get_settings()


class QiniuService:
    def __init__(self):
        self._auth = None
        self.bucket = settings.qiniu_bucket_name
        self.domain = settings.qiniu_domain

    @property
    def configured(self) -> bool:
        return bool(settings.qiniu_access_key and settings.qiniu_secret_key)

    @property
    def auth(self) -> Auth:
        # 延迟创建：没有配置七牛密钥时（例如只跑创意站接口）服务也能正常启动。
        if self._auth is None:
            if not self.configured:
                raise RuntimeError("未配置 QINIU_ACCESS_KEY / QINIU_SECRET_KEY，无法上传到七牛云")
            self._auth = Auth(settings.qiniu_access_key, settings.qiniu_secret_key)
        return self._auth
    
    def upload_from_url(self, url: str, key: str = None) -> str:
        """从URL下载并上传到七牛云 - 处理B站防盗链"""
        if not key:
            key = f"covers/{uuid.uuid4().hex}.jpg"
        
        # B站图片需要特殊headers才能下载
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.bilibili.com",
            "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
        }
        
        # 处理B站URL格式
        if url.startswith("//"):
            url = "https:" + url
        
        print(f"  下载图片: {url}")
        
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            
            if resp.status_code != 200:
                raise Exception(f"下载失败，状态码: {resp.status_code}")
            
            if len(resp.content) < 1000:
                raise Exception(f"图片太小，可能是防盗链拦截: {len(resp.content)} bytes")
            
            # 上传到七牛
            print(f"  上传到七牛: {key}")
            token = self.auth.upload_token(self.bucket, key, 3600)
            ret, info = put_data(token, key, resp.content)
            
            if info.status_code != 200:
                raise Exception(f"上传失败: {info}")
            
            result_url = f"http://{self.domain}/{key}"
            print(f"  上传成功: {result_url}")
            return result_url
            
        except Exception as e:
            print(f"  上传失败: {e}")
            raise
    
    def upload_bytes(self, data: bytes, key: str = None) -> str:
        """上传二进制数据"""
        if not key:
            key = f"covers/{uuid.uuid4().hex}.jpg"
        
        token = self.auth.upload_token(self.bucket, key)
        ret, info = put_data(token, key, data)
        
        if info.status_code != 200:
            raise Exception(f"上传失败: {info}")
        
        return f"http://{self.domain}/{key}"

    def get_file_url(self, key: str) -> str:
        """获取文件URL"""
        return f"http://{self.domain}/{key}"


# 全局实例
qiniu_service = QiniuService()