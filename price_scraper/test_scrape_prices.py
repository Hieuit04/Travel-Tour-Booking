from bs4 import BeautifulSoup

from scrape_prices import ld_items, parse_duration, parse_price, tour


def test_helpers():
    assert parse_price("2,350,000 đ") == 2350000
    assert parse_price("17.179.000 ₫") == 17179000
    assert parse_price("Liên hệ") is None and parse_price("0") is None
    assert parse_duration("Tour Đà Lạt 3 ngày 2 đêm") == (3, 2)
    assert parse_duration("NARITA – TOKYO 5N4Đ | BAY VN") == (5, 4)
    assert parse_duration("1 ngày") == (1, None)
    t = tour("x", "u", "  Hà Giang  3N2Đ ", "3.990.000")
    assert (t["tour_name"], t["duration_days"], t["price_adult"]) == ("Hà Giang 3N2Đ", 3, 3990000)
    page = BeautifulSoup('<script type="application/ld+json">{"@type":"CollectionPage","mainEntity":'
                         '{"@type":"ItemList","itemListElement":[{"item":{"name":"A"}}]}}</script>', "html.parser")
    assert ld_items(page) == [{"name": "A"}]


if __name__ == "__main__":
    test_helpers()
    print("ok")
