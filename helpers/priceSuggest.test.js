// Chạy: node helpers/priceSuggest.test.js
const assert = require('assert');
const suggest = require('./priceSuggest.helper');
const { parseDuration, normalize } = suggest;

assert.deepStrictEqual(parseDuration("3 ngày 2 đêm"), { days: 3, nights: 2 });
assert.deepStrictEqual(parseDuration("3N2Đ"), { days: 3, nights: 2 });
assert.deepStrictEqual(parseDuration("1 ngày"), { days: 1, nights: null });
assert.strictEqual(normalize("Đà Lạt!"), "da lat");

const row = (tour_name, price_adult, d, n, departure_city) =>
  ({ tour_name, price_adult, duration_days: d, duration_nights: n, departure_city });
const rows = [
  row("Tour Đà Lạt 3 ngày 2 đêm", 3000000, 3, 2, "TP. Hồ Chí Minh"),
  row("Đà Lạt - Thác Datanla 3N2Đ", 4000000, 3, 2, "Hà Nội"),
  row("Đà Lạt ngàn hoa", 5000000, 3, 2),
  row("Đà Lạt Nha Trang 5 ngày", 9000000, 5, 4),
  row("Tour Mộc Châu 2 ngày 1 đêm từ Hà Nội", 2000000, 2, 1, "Hà Nội"),
  row("Hà Nội - Hạ Long", 3500000, 3, 2, "TP. Hồ Chí Minh"),
  row("Tour Hạ Long 3N2Đ từ Hà Nội - Tết 2027", 3900000, 3, 2, "Hà Nội"),
];

const r = suggest(rows, ["Đà Lạt"], "3 ngày 2 đêm");
assert.strictEqual(r.basisText, "cùng địa điểm và cùng thời lượng");
assert.strictEqual(r.tours.length, 4);            // gồm cả tour 5 ngày, xếp cuối
assert.strictEqual(r.stats.count, 3);             // gợi ý chỉ tính 3 tour cùng thời lượng
assert.strictEqual(r.suggestedPrice, 4000000);

// "từ Hà Nội" không được tính là điểm đến
const hn = suggest(rows, ["Hà Nội"], "3N2Đ");
assert.deepStrictEqual(hn.tours.map(t => t.tour_name), ["Hà Nội - Hạ Long"]);
assert.strictEqual(hn.stats.count, 1);

// tour khớp đủ 2 địa điểm được xếp trước và là cơ sở tính giá
const hl = suggest(rows, ["Hà Nội", "Hạ Long"], "3N2Đ");
assert.strictEqual(hl.tours[0].tour_name, "Hà Nội - Hạ Long");
assert.strictEqual(hl.stats.count, 1);

// thiếu tour cùng thời lượng -> lấy tour chênh 1 ngày, không lấy tour 5 ngày
const dl = suggest(rows, ["Đà Lạt"], "4 ngày 3 đêm");
assert.strictEqual(dl.basisText, "thời lượng chênh tối đa 1 ngày");
assert.strictEqual(dl.stats.max, 9000000);
assert.strictEqual(suggest(rows, ["Đà Lạt"], "2 ngày 1 đêm").stats.max, 5000000);

assert.strictEqual(suggest(rows, ["Côn Đảo"], "").stats, null);
console.log("ok");
