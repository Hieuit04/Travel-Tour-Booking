from generate_blog import fill_images, slugify, strip_html, tour_images


def test_helpers():
    assert slugify("Đà Lạt: Thành phố ngàn hoa!") == "da-lat-thanh-pho-ngan-hoa"
    assert strip_html("<p>Biển &amp; núi</p>") == "Biển & núi"
    assert tour_images({"avatar": "a.jpg", "images": ["", "b.jpg"]}) == ["a.jpg", "b.jpg"]
    md = "![x](IMAGE_1) ![y](IMAGE_3)"
    assert fill_images(md, ["a.jpg"]) == "![x](a.jpg) "


if __name__ == "__main__":
    test_helpers()
    print("ok")
