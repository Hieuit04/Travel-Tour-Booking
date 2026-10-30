from generate_blog import fill_images, pick_commons, slugify, strip_html, tour_images


def test_helpers():
    assert slugify("Đà Lạt: Thành phố ngàn hoa!") == "da-lat-thanh-pho-ngan-hoa"
    assert strip_html("<p>Biển &amp; núi</p>") == "Biển & núi"
    assert tour_images({"avatar": "a.jpg", "images": ["", "b.jpg"]}) == ["a.jpg", "b.jpg"]
    md = "![x](IMAGE_1) ![y](IMAGE_3)"
    assert fill_images(md, ["a.jpg"]) == "![x](a.jpg) "
    assert fill_images("![x](IMAGE_1)", ["a.jpg"], ["Tác giả"]) == "![x](a.jpg)\n\n*Ảnh: Tác giả*\n"


def test_pick_commons():
    def page(i, w, h, lic, artist="<a>An</a>"):
        meta = {"LicenseShortName": {"value": lic}, "Artist": {"value": artist}}
        return {"index": i, "imageinfo": [{"width": w, "height": h, "thumburl": f"t{i}", "descriptionurl": f"p{i}", "extmetadata": meta}]}
    pages = [page(5, 2000, 1000, "CC BY-SA 4.0"), page(1, 2000, 1000, "CC BY-NC 2.0"), page(2, 800, 500, "CC0"),
             page(3, 1000, 2000, "CC0"), page(4, 1600, 900, "Public domain", "[//x link]"), page(6, 1600, 900, "All rights reserved")]
    assert pick_commons(pages, 5) == [("t4", "Wikimedia Commons, [Public domain](p4)"), ("t5", "An, [CC BY-SA 4.0](p5)")]
    assert len(pick_commons(pages, 1)) == 1


if __name__ == "__main__":
    test_helpers()
    test_pick_commons()
    print("ok")
