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
  row("Đà Lạt - Thác Datanla 3N2Đ", 4000000, 3, 2, "TP. Hồ Chí Minh"),
  row("Đà Lạt ngàn hoa", 5000000, 3, 2),
  row("Đà Lạt Nha Trang 5 ngày", 9000000, 5, 4),
  row("Tour Mộc Châu 2 ngày 1 đêm từ Hà Nội", 2000000, 2, 1, "Hà Nội"),
  row("Hà Nội - Hạ Long", 3500000, 3, 2),
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
assert.strictEqual(dl.basisText, "thời lượng chênh tối đa 1 ngày, đã quy đổi theo số ngày");
assert.strictEqual(dl.stats.max, 7200000);        // 9tr/5 ngày -> 7,2tr/4 ngày
assert.strictEqual(suggest(rows, ["Đà Lạt"], "2 ngày 1 đêm").stats.max, 3333000);

// thời lượng phải làm đổi giá kể cả khi không có tour gần thời lượng đó
const longTrip = suggest(rows, ["Đà Lạt"], "10 ngày 9 đêm");
assert.strictEqual(longTrip.stats.count, 4);
assert.ok(longTrip.suggestedPrice > r.suggestedPrice);

// tour bay từ xa (gồm vé máy bay) không kéo giá lên, vẫn hiện trong bảng
const flight = (name, price, from) => row(name, price, 3, 2, from);
const north = [
  flight("Sapa bản Cát Cát", 2000000, "Hà Nội"),
  flight("Sapa Fansipan", 3000000),
  flight("Sapa mùa lúa", 2500000, "Hà Nội"),
  flight("Sapa bay khứ hồi", 9000000, "TP. Hồ Chí Minh"),
  flight("Sapa 3N2Đ từ TP.HCM", 8000000),
];
const sapa = suggest(north, ["Sapa"], "3 ngày 2 đêm");
assert.strictEqual(sapa.suggestedPrice, 2500000);
assert.strictEqual(sapa.flownCount, 2);
assert.strictEqual(sapa.tours.length, 5);
// chỉ có tour bay thì vẫn dùng, còn hơn không có gợi ý
const onlyFlights = suggest(north.slice(3), ["Sapa"], "3 ngày 2 đêm");
assert.strictEqual(onlyFlights.stats.count, 2);
assert.strictEqual(onlyFlights.allFlown, true);
assert.strictEqual(sapa.allFlown, false);
// khởi hành từ TP.HCM đi miền Nam là tour đường bộ
assert.strictEqual(suggest([flight("Cần Thơ chợ nổi", 2000000, "Hồ Chí Minh")], ["Cần Thơ"], "3N2Đ").flownCount, 0);

assert.strictEqual(suggest(rows, ["Côn Đảo"], "").stats, null);

const now = new Date("2026-11-06");
const dated = (scraped_at) => ({ ...row("Tour Đà Lạt", 1000000, 2, 1), scraped_at: new Date(scraped_at) });
assert.strictEqual(suggest([dated("2026-11-05"), dated("2026-10-30")], ["Đà Lạt"], "2 ngày 1 đêm", now).staleCount, 0);
assert.strictEqual(suggest([dated("2026-11-05"), dated("2026-10-29")], ["Đà Lạt"], "2 ngày 1 đêm", now).staleCount, 1);
console.log("ok");
