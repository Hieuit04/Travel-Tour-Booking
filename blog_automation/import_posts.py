"""Nhập bài viết soạn sẵn (JSON) vào collection blogs ở trạng thái chờ duyệt.

python blog_automation/import_posts.py blog_automation/posts/2026-10-30.json
"""
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

import markdown
from dotenv import load_dotenv
from pymongo import MongoClient

from generate_blog import slugify

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


def main():
    posts = json.load(open(sys.argv[1], encoding="utf-8"))
    db = MongoClient(os.environ["DATABASE"]).get_default_database()
    now = datetime.now(timezone.utc)
    for p in posts:
        slug = slugify(p["title"])
        body = p["content_markdown"]
        if p.get("avatarCredit"):
            body += f"\n\n*Ảnh bìa: {p['avatarCredit']}*"
        res = db.blogs.update_one(
            {"slug": slug},
            {
                "$set": {
                    "title": p["title"],
                    "excerpt": p["excerpt"],
                    "tags": p["tags"],
                    "avatar": p.get("avatar", ""),
                    "content": markdown.markdown(body, extensions=["tables"]),
                    "updatedAt": now,
                },
                # chạy lại không làm mất trạng thái đã duyệt
                "$setOnInsert": {"status": "pending", "deleted": False, "createdBy": "ai", "tourId": "", "createdAt": now},
            },
            upsert=True,
        )
        print(f"{'thêm mới' if res.upserted_id else 'cập nhật'} (chờ duyệt): {slug}")


if __name__ == "__main__":
    main()
