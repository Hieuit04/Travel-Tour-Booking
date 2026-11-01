"""Thu thập giá tour của đối thủ để gợi ý giá, lưu vào MongoDB (collection `competitor_prices`).

Chạy:  python price_scraper/scrape_prices.py                         # mọi nguồn
       python price_scraper/scrape_prices.py --sources pys,tugo --max-pages 2 --dry-run
"""
import argparse
import json
import os
import re
import time
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
DELAY = 2.5  # giây giữa 2 request cùng site
session = requests.Session()
session.headers.update({"User-Agent": UA, "Accept-Language": "vi-VN,vi;q=0.9"})


def get(url: str) -> str:
    time.sleep(DELAY)
    r = session.get(url, timeout=30)
    r.raise_for_status()
    return r.text


def soup(url: str) -> BeautifulSoup:
    return BeautifulSoup(get(url), "html.parser")


def parse_price(text) -> int | None:
    digits = re.sub(r"\D", "", str(text or ""))
    return int(digits) if digits and int(digits) >= 10000 else None  # < 10.000đ là rác


def parse_duration(text: str) -> tuple[int | None, int | None]:
    m = re.search(r"(\d+)\s*(?:ngày|n)\s*(\d+)\s*(?:đêm|đ)", text or "", re.I)
    if m:
        return int(m[1]), int(m[2])
    m = re.search(r"(\d+)\s*ngày", text or "", re.I)
    return (int(m[1]), None) if m else (None, None)


def clean(text) -> str:
    return re.sub(r"\s+", " ", str(text or "")).strip()


def tour(source, url, name, price, *, duration_text=None, destination=None, departure_city=None,
         departure_date=None, original_price=None, seats_left=None) -> dict:
    name = clean(name)
    days, nights = parse_duration(duration_text or name)
    return {
        "source": source, "url": url, "tour_name": name, "destination": clean(destination) or None,
        "departure_city": clean(departure_city) or None, "duration_days": days, "duration_nights": nights,
        "departure_date": departure_date, "price_adult": parse_price(price),
        "original_price": parse_price(original_price), "seats_left": seats_left,
    }


def ld_items(page: BeautifulSoup) -> list[dict]:
    """Các Product trong ItemList JSON-LD (ở gốc hoặc trong mainEntity)."""
    for s in page.find_all("script", type="application/ld+json"):
        try:
            d = json.loads(s.string or "")
        except json.JSONDecodeError:
            continue
        lst = d if d.get("@type") == "ItemList" else d.get("mainEntity") or {}
        if lst.get("itemListElement"):
            return [e["item"] for e in lst["itemListElement"] if "item" in e]
    return []


# ---------- một parser cho mỗi site ----------

def vietravel(max_pages):
    # Trang danh sách chỉ render 10 tour, không phân trang được -> quét các trang điểm đến trong sitemap.
    tree = ET.fromstring(get("https://travel.com.vn/sitemap.xml"))
    locs = [e.text for e in tree.iter("{http://www.sitemaps.org/schemas/sitemap/0.9}loc")]
    pages = [u for u in locs if re.search(r"travel\.com\.vn/du-lich-[^/]+\.aspx$", u)][:max_pages]
    for url in pages:
        for it in ld_items(soup(url)):
            props = {p["name"]: p["value"] for p in it.get("additionalProperty", [])}
            yield tour("vietravel", it["url"], it["name"], it.get("offers", {}).get("price"),
                       duration_text=props.get("duration"), departure_city=props.get("departureFrom"))


def pys(max_pages):
    for n in range(1, max_pages + 1):
        items = ld_items(soup(f"https://pystravel.vn/danh-muc-tour/2-tour.html?page={n}"))
        if not items:
            break
        for it in items:
            yield tour("pys", it["url"], it["name"], it.get("offers", {}).get("price"))


def vietnambooking(max_pages):
    for n in range(1, max_pages + 1):
        page = soup(f"https://www.vietnambooking.com/du-lich-trong-nuoc.html?list-page={n}")
        cards = page.select(".category-list-tour li.item-tour")
        if not cards:
            break
        for c in cards:
            a = c.select_one("h3 a")
            price = c.select_one(".box-price-promotion-tour")
            depart = c.find(string=re.compile("Khởi Hành", re.I))
            yield tour("vietnambooking", a["href"], a.get_text(), price.span.get_text() if price and price.span else None,
                       duration_text=c.select_one(".tlb-time-and-traffic-tour").get_text(),
                       departure_city=depart.split(":", 1)[1].split(",")[0] if depart and ":" in depart else None,
                       original_price=price.find("del").get_text() if price and price.find("del") else None)


def benthanh(max_pages):
    for kind in ("tour-trong-nuoc", "tour-nuoc-ngoai"):
        for n in range(1, max_pages + 1):
            cards = soup(f"https://benthanhtourist.com/diem-den/{kind}?page={n}").select(".panel-tour")
            if not cards:
                break
            for c in cards:
                info = [clean(s.get_text()) for s in c.select(".list-options span")]
                seats = next((i for i in info if i.startswith("Số chỗ")), "")
                date = next((i for i in info if re.fullmatch(r"\d{2}/\d{2}/\d{4}", i)), None)
                city = next((i for i in info if i and not i.startswith(("Mã", "Số chỗ", "Xem")) and i != date), None)
                url = c.a["href"].split("?")[0]
                # trang danh sách không có thời lượng -> lấy "Thời gian x ngày y đêm" ở trang chi tiết
                duration = re.search(r"Thời gian\s*(\d+\s*ngày(?:\s*\d+\s*đêm)?)", soup(url).get_text(" ", strip=True))
                yield tour("benthanh", url, c.select_one(".elem-name").get_text(),
                           c.select_one(".input-price").get_text(), duration_text=duration[1] if duration else None,
                           destination=c.select_one(".elem-place").get_text(),
                           departure_city=city, departure_date=date,
                           seats_left=int(re.sub(r"\D", "", seats)) if re.search(r"\d", seats) else None)


def tugo(max_pages):
    for n in range(1, max_pages + 1):
        products = json.loads(get(f"https://tugo.vn/collections/all/products.json?page={n}"))["products"]
        if not products:
            break
        for p in products:
            if "tour" not in (p.get("product_type") or "").lower():
                continue  # bỏ sim, dịch vụ sân bay...
            variants = [v for v in p["variants"] if v.get("available") and parse_price(v["price"])]
            if not variants:
                continue
            v = min(variants, key=lambda v: int(v["price"]))
            yield tour("tugo", f"https://tugo.vn/products/{p['handle']}", p["title"], v["price"],
                       departure_date=v["option1"] if re.fullmatch(r"\d{2}/\d{2}/\d{4}", v.get("option1") or "") else None,
                       original_price=v["compare_at_price"] if parse_price(v["compare_at_price"]) else None)


def hanoitourist(max_pages):
    # Trang /tour-trong-nuoc có sẵn giá trong HTML tĩnh (Drupal, page bắt đầu từ 0).
    for n in range(max_pages):
        cards = soup(f"https://hanoitourist.vn/tour-trong-nuoc?page={n}").select(".tour-card")
        if not cards:
            break
        for c in cards:
            a = c.select_one(".tour-title a")
            text = c.get_text(" | ", strip=True)
            route = re.search(r"Hành trình: \| ([^|]+)", text)
            city = re.search(r"Từ: \| ([^|]+)", text)
            seats = re.search(r"Số chỗ còn nhận: \| (\d+)", text)
            price = re.search(r"([\d.,]{7,})\s*đ", text)
            yield tour("hanoitourist", urljoin("https://hanoitourist.vn", a["href"]), a.get_text(),
                       price[1] if price else None, duration_text=route[1] if route else None,
                       destination=route[1].split(" - ")[0] if route else None,
                       departure_city=city[1] if city else None, seats_left=int(seats[1]) if seats else None)


def saigontourist(max_pages):
    # Giá chỉ hiện sau khi chạy JS -> Selenium (Chrome tự tải qua selenium-manager).
    from selenium import webdriver

    opts = webdriver.ChromeOptions()
    for arg in ("--headless=new", "--no-sandbox", "--disable-dev-shm-usage", f"--user-agent={UA}"):
        opts.add_argument(arg)
    driver = webdriver.Chrome(options=opts)
    try:
        driver.get("https://saigontourist.net/")
        time.sleep(6)
        home = BeautifulSoup(driver.page_source, "html.parser")
        cats = {urljoin("https://saigontourist.net", a["href"]) for a in home.select('a[href*="/the-loai/"]')}
        for url in ["https://saigontourist.net/", *sorted(cats)][:max_pages]:
            if url != "https://saigontourist.net/":
                driver.get(url)
                time.sleep(6)
            page = BeautifulSoup(driver.page_source, "html.parser")
            for a in page.select('a[href^="/tour/"]'):
                card = a.find_parent("div", class_=re.compile(r"rounded-\[16px\]"))
                if not card or not a.img:
                    continue
                parts = card.get_text(" | ", strip=True).split(" | ")
                price = next((p for p in parts if "₫" in p), None)
                city = parts[parts.index("Khởi hành từ") + 1] if "Khởi hành từ" in parts else None
                name = a.img.get("alt", "")
                dest = parts[parts.index(name) - 1] if name in parts and parts.index(name) > 0 else None
                yield tour("saigontourist", urljoin("https://saigontourist.net", a["href"]), name, price,
                           duration_text=" ".join(parts), destination=dest, departure_city=city)
    finally:
        driver.quit()


# Du Lịch Việt bỏ qua: từ 10/2026 trả về trang chặn Cloudflare (403).
SOURCES = {f.__name__: f for f in (vietravel, pys, vietnambooking, benthanh, tugo, hanoitourist, saigontourist)}


def main():
    ap = argparse.ArgumentParser(description="Thu thập giá tour đối thủ")
    ap.add_argument("--sources", default=",".join(SOURCES), help=f"danh sách, mặc định: {','.join(SOURCES)}")
    ap.add_argument("--max-pages", type=int, default=200, help="số trang tối đa mỗi nguồn")
    ap.add_argument("--dry-run", action="store_true", help="ghi ra competitor_prices.json, không lưu DB")
    args = ap.parse_args()

    now = datetime.now(timezone.utc)
    rows = []
    for name in args.sources.split(","):
        found = {}
        try:
            for t in SOURCES[name](args.max_pages):
                if t["price_adult"]:
                    found[t["url"]] = {**t, "scraped_at": now}
        except Exception as e:  # một site lỗi/đổi giao diện không làm hỏng các site khác
            print(f"  {name}: lỗi, dừng nguồn này: {e!r}")
        print(f"{name}: {len(found)} tour")
        rows += found.values()

    if args.dry_run:
        Path("competitor_prices.json").write_text(json.dumps(rows, ensure_ascii=False, indent=1, default=str))
        print(f"→ competitor_prices.json ({len(rows)} tour)")
        return

    from pymongo import MongoClient, UpdateOne

    db = MongoClient(os.environ["DATABASE"]).get_default_database()
    if rows:
        db.competitor_prices.bulk_write([UpdateOne({"source": r["source"], "url": r["url"]}, {"$set": r}, upsert=True)
                                         for r in rows])
    db.competitor_prices.create_index([("source", 1), ("url", 1)], unique=True)
    print(f"→ đã lưu {len(rows)} tour vào competitor_prices")


if __name__ == "__main__":
    main()
