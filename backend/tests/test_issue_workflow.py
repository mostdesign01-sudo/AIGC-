"""主路径：当期窗口、9 类覆盖、最多入选 3、2x GIF。"""
from datetime import date
from pathlib import Path

import pytest

from app.services.gif_service import FFmpegNotFoundError, ffmpeg_bin, generate_2x_gif
from app.services.issue_service import issue_calendar, vol_for_date, window_for_vol


def test_current_window_is_vol10_on_aug17():
    cal = issue_calendar(date(2026, 8, 17))
    assert cal["vol_number"] == 10
    assert cal["start_date"] == "2026-08-03"
    assert cal["end_date"] == "2026-08-17"


def test_anchor_vol09_on_aug3():
    cal = issue_calendar(date(2026, 8, 3))
    assert cal["vol_number"] == 9
    start, end = window_for_vol(9, 9, date(2026, 8, 3), 14)
    assert start == date(2026, 7, 20)
    assert end == date(2026, 8, 3)


def test_next_vol_after_window():
    assert vol_for_date(date(2026, 8, 18), 9, date(2026, 8, 3), 14) == 11


def test_ensure_current_and_category_seed(client):
    res = client.post("/api/v1/issues/current")
    assert res.status_code == 200
    body = res.json()
    assert body["issue"]["vol_number"] == issue_calendar(date.today())["vol_number"]
    assert body["required_count"] == 9
    assert body["filled_count"] == 0
    assert body["selected_count"] == 0
    assert len(body["missing_categories"]) == 9

    cats = client.get("/api/v1/categories").json()["data"]
    names = [c["name"] for c in cats]
    assert "AI创意短片" in names
    assert "IP/角色" in names
    assert len(cats) == 9


def test_select_three_and_reject_fourth(client):
    issue = client.post("/api/v1/issues/current").json()
    issue_id = issue["issue"]["id"]
    cats = client.get("/api/v1/categories").json()["data"]

    ids = []
    for i, cat in enumerate(cats):
        res = client.post("/api/v1/videos/from-link", json={
            "url": f"https://example.com/demo-{i}",
            "title": f"示例 {cat['name']}",
            "intro": f"介绍{i}：怎么做 / 创意点 / 能用在哪。",
            "category_id": cat["id"],
            "issue_id": issue_id,
            "item_kind": cat.get("item_kind_hint") or "video",
            "assign_current": False,
        })
        assert res.status_code == 200, res.text
        ids.append(res.json()["id"])

    cov = client.get(f"/api/v1/issues/{issue_id}/coverage").json()
    assert cov["filled_count"] == 9
    assert cov["category_gap"] == 0
    assert cov["selected_count"] == 0

    for vid in ids[:3]:
        res = client.post(f"/api/v1/issues/{issue_id}/items/{vid}/select")
        assert res.status_code == 200, res.text
        assert res.json()["selected"] is True

    fourth = client.post(f"/api/v1/issues/{issue_id}/items/{ids[3]}/select")
    assert fourth.status_code == 400
    assert "最多入选" in fourth.json()["detail"]

    cov = client.get(f"/api/v1/issues/{issue_id}/preview").json()
    assert cov["selected_count"] == 3
    assert cov["ready_for_brief"] is True
    assert len(cov["export"]["picks"]) == 3

    md = client.get(f"/api/v1/issues/{issue_id}/export?format=markdown")
    assert md.status_code == 200
    assert issue["issue"]["vol_label"] in md.text
    assert "创意灵感" in md.text


def _make_clip(path: Path, portrait: bool = True):
    import subprocess
    size = "360x640" if portrait else "640x360"
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"color=c=cyan:s={size}:d=2",
            "-pix_fmt", "yuv420p",
            str(path),
        ],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def test_gif_2x_from_upload(client, tmp_path):
    try:
        ffmpeg_bin()
    except FFmpegNotFoundError:
        pytest.skip("环境未安装 ffmpeg")

    clip = tmp_path / "clip.mp4"
    _make_clip(clip, portrait=True)

    with clip.open("rb") as f:
        res = client.post(
            "/api/v1/videos/upload",
            files={"file": ("clip.mp4", f, "video/mp4")},
            data={"title": "竖版测试", "intro": "2 倍速 GIF 测试", "item_kind": "video"},
        )
    assert res.status_code == 200, res.text
    video = res.json()
    assert video["platform"] == "manual"
    assert video["local_media_path"]
    assert video["duration_seconds"] >= 1
    assert video["orientation"] == "portrait"

    gif = client.post(f"/api/v1/videos/{video['id']}/gif")
    assert gif.status_code == 200, gif.text
    body = gif.json()
    assert body["gif_status"] == "ready"
    assert body["gif_url"]

    download = client.get(f"/api/v1/videos/{video['id']}/gif")
    assert download.status_code == 200
    assert download.headers["content-type"].startswith("image/gif")
    assert len(download.content) > 100
    assert len(download.content) < 2_500_000


def test_deconstruct_fills_intro_and_summary(client):
    res = client.post("/api/v1/videos/from-link", json={
        "url": "https://example.com/kling-demo",
        "title": "可灵锁角色夜店走秀",
        "item_kind": "video",
        "download": False,
    })
    assert res.status_code == 200
    vid = res.json()["id"]
    out = client.post(f"/api/v1/videos/{vid}/deconstruct")
    assert out.status_code == 200, out.text
    body = out.json()
    assert "怎么做" in (body.get("ai_summary") or "")
    assert "创意点" in (body.get("ai_summary") or "")
    assert body["intro"]
    assert body["deconstruct"]["how"]


def test_fetch_media_attaches_local_file(client, tmp_path, monkeypatch):
    try:
        ffmpeg_bin()
    except FFmpegNotFoundError:
        pytest.skip("环境未安装 ffmpeg")

    clip = tmp_path / "src.mp4"
    _make_clip(clip, portrait=True)

    def fake_download(url, dest_dir, stem, max_seconds=60):
        dest = Path(dest_dir) / f"{stem}.mp4"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(clip.read_bytes())
        return {
            "video_path": str(dest),
            "thumb_path": None,
            "title": "下载标题",
            "description": "desc",
            "duration": 2,
            "author": "作者",
            "webpage_url": url,
        }

    monkeypatch.setattr("app.services.media_service.download_from_url", fake_download)
    created = client.post("/api/v1/videos/from-link", json={
        "url": "https://www.bilibili.com/video/BV1xxx",
        "title": "待下载",
        "item_kind": "video",
        "download": False,
    })
    vid = created.json()["id"]
    got = client.post(f"/api/v1/videos/{vid}/fetch-media")
    assert got.status_code == 200, got.text
    body = got.json()
    assert body["local_media_path"]
    assert body["duration_seconds"] >= 1


def test_parse_deconstruct_json():
    from app.services.deconstruct_service import parse_deconstruct_json
    raw = '```json\n{"how":"可灵锁人","idea":"夜店光","use":"时尚片","brief":"一段话"}\n```'
    parsed = parse_deconstruct_json(raw)
    assert parsed and parsed["how"] == "可灵锁人"


def test_gif_service_speeds_up(tmp_path):
    try:
        ffmpeg_bin()
    except FFmpegNotFoundError:
        pytest.skip("环境未安装 ffmpeg")

    src = tmp_path / "src.mp4"
    out = tmp_path / "out.gif"
    _make_clip(src, portrait=True)
    result = generate_2x_gif(str(src), str(out), orientation="portrait")
    assert Path(result["path"]).is_file()
    assert result["size_bytes"] > 0
    assert result["orientation"] == "portrait"
