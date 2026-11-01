"""Tự động viết bài blog du lịch cho từng tour bằng AI (LLM) và lưu vào MongoDB (collection `blogs`).

Chạy:  python blog_automation/generate_blog.py            # viết cho mọi tour chưa có bài
       python blog_automation/generate_blog.py --slug ten-tour --dry-run
"""
import argparse
import html
import os
import re
import unicodedata
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import markdown
from bson import ObjectId
from dotenv import load_dotenv
from pydantic import BaseModel
from pymongo import MongoClient

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

MODEL = os.getenv("BLOG_MODEL", "claude-opus-5")

SYSTEM = """Bạn là biên tập viên du lịch giàu kinh nghiệm, viết blog tiếng Việt cho một website đặt tour.
Mục tiêu: bài viết mang tính THÔNG TIN, hữu ích cho người đọc lên kế hoạch chuyến đi, không phải bài quảng cáo.

Yêu cầu nội dung (Markdown):
- 1500-2500 từ, dùng tiêu đề ## và ###, không lặp lại tiêu đề bài ở đầu.
- Bao gồm: giới thiệu điểm đến (lịch sử, văn hoá), thời điểm đẹp nhất và thời tiết theo mùa,
  phân tích lịch trình từng ngày, món ăn đặc sản, chi phí tham khảo, kinh nghiệm thực tế
  (đồ cần mang, lưu ý an toàn, phong tục), và mục Câu hỏi thường gặp.
- Ít nhất 2 bảng Markdown (ví dụ: bảng thời tiết theo tháng, bảng chi phí dự kiến, bảng so sánh).
- Chỉ nhắc đến tour ở một đoạn ngắn cuối bài, giọng khách quan.
- Chỉ dùng thông tin phổ biến, đã được kiểm chứng; với giá cả ngoài tour, ghi rõ là "tham khảo".
  Không bịa số liệu cụ thể về tour ngoài dữ liệu được cung cấp.
- Chèn ảnh bằng cú pháp ![mô tả ảnh](IMAGE_n) với n từ 1 đến số ảnh được cung cấp, rải đều trong bài,
  mỗi ảnh dùng tối đa một lần. Không dùng URL ảnh nào khác."""


class BlogPost(BaseModel):
    title: str
    excerpt: str  # 1-2 câu tóm tắt cho trang danh sách
    tags: list[str]
    content_markdown: str


def slugify(text: str) -> str:
    text = text.replace("đ", "d").replace("Đ", "D")
    text = unicodedata.normalize("NFD", text).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")


def strip_html(text: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", " ", text or "")).strip()


def tour_images(tour: dict) -> list[str]:
    return [img for img in [tour.get("avatar"), *(tour.get("images") or [])] if img and img.strip()]


def fill_images(md: str, images: list[str]) -> str:
    """Thay IMAGE_n bằng URL ảnh thật; xoá ảnh có chỉ số không hợp lệ."""
    def repl(m: re.Match) -> str:
        i = int(m.group(2)) - 1
        return f"![{m.group(1)}]({images[i]})" if 0 <= i < len(images) else ""
    return re.sub(r"!\[([^\]]*)\]\(IMAGE_(\d+)\)", repl, md)


def tour_brief(tour: dict, cities: list[str], images: list[str]) -> str:
    schedule = "\n".join(
        f"- {d.get('title', '')}: {strip_html(d.get('content', ''))}" for d in tour.get("schedule") or []
    )
    price = tour.get("newPriceAdult") or tour.get("priceAdult")
    departure = tour.get("departureDate")
    return f"""Dữ liệu tour:
- Tên tour: {tour.get('tourName')}
- Điểm khởi hành / điểm đến: {', '.join(cities) or 'không rõ'}
- Thời gian: {tour.get('time') or 'không rõ'}
- Phương tiện: {tour.get('vihicle') or 'không rõ'}
- Ngày khởi hành: {departure.strftime('%d/%m/%Y') if departure else 'không rõ'}
- Giá người lớn: {f'{price:,.0f} VNĐ' if price else 'không rõ'}
- Giới thiệu: {strip_html(tour.get('information', ''))}
- Lịch trình:
{schedule or '(không có)'}

Số ảnh có thể chèn: {len(images)} (IMAGE_1 .. IMAGE_{len(images)})."""


def write_post(client: anthropic.Anthropic, brief: str) -> BlogPost:
    msg = client.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=SYSTEM,
        messages=[{"role": "user", "content": f"{brief}\n\nHãy viết bài blog cho điểm đến của tour này."}],
        output_format=BlogPost,
    )
    if msg.stop_reason != "end_turn":
        raise RuntimeError(f"LLM dừng bất thường: {msg.stop_reason}")
    return msg.parsed_output


def main():
    ap = argparse.ArgumentParser(description="Tạo bài blog tự động cho tour")
    ap.add_argument("--slug", help="chỉ viết cho tour có slug này (viết lại kể cả khi đã có bài)")
    ap.add_argument("--limit", type=int, default=5, help="số bài tối đa mỗi lần chạy")
    ap.add_argument("--dry-run", action="store_true", help="in ra Markdown, không lưu DB")
    args = ap.parse_args()

    db = MongoClient(os.environ["DATABASE"]).get_default_database()
    client = anthropic.Anthropic()

    query = {"deleted": False, "status": "active"}
    if args.slug:
        query["slug"] = args.slug
    else:
        done = {b["tourId"] for b in db.blogs.find({"deleted": False}, {"tourId": 1}) if b.get("tourId")}
        query["_id"] = {"$nin": [ObjectId(t) for t in done]}

    for tour in db.tours.find(query).limit(args.limit):
        city_ids = [ObjectId(c) for c in tour.get("location") or [] if ObjectId.is_valid(c)]
        cities = [c["name"] for c in db.cities.find({"_id": {"$in": city_ids}})]
        images = tour_images(tour)
        print(f"→ {tour['tourName']}")
        try:
            post = write_post(client, tour_brief(tour, cities, images))
        except (anthropic.APIError, RuntimeError) as e:
            print(f"  lỗi, bỏ qua: {e}")
            continue

        body_md = fill_images(post.content_markdown, images)
        if args.dry_run:
            print(f"# {post.title}\n\n{body_md}\n")
            continue

        now = datetime.now(timezone.utc)
        slug = slugify(post.title)
        if db.blogs.find_one({"slug": slug, "tourId": {"$ne": str(tour["_id"])}}):
            slug = f"{slug}-{str(tour['_id'])[-6:]}"
        db.blogs.update_one(
            {"tourId": str(tour["_id"])},
            {
                "$set": {
                    "title": post.title,
                    "slug": slug,
                    "excerpt": post.excerpt,
                    "tags": post.tags,
                    "avatar": images[0] if images else "",
                    "content": markdown.markdown(body_md, extensions=["tables"]),
                    "status": "pending",  # chờ nhân viên duyệt trước khi đăng
                    "deleted": False,
                    "createdBy": "ai",
                    "updatedAt": now,
                },
                "$setOnInsert": {"createdAt": now},
                "$unset": {"publishedAt": "", "publishedBy": ""},
            },
            upsert=True,
        )
        print(f"  đã lưu (chờ duyệt): {slug}")


if __name__ == "__main__":
    main()
