// Gợi ý giá người lớn từ giá tour đối thủ (collection competitor_prices)

const STALE_MS = 7 * 24 * 60 * 60 * 1000;  // giá cũ hơn 7 ngày vẫn hiện nhưng kèm cảnh báo

// shortcut: chỉ liệt kê điểm đến có trong DB và điểm phổ biến, thêm vào đây khi có địa điểm mới ở miền Trung/Nam
const SOUTH = ["ho chi minh", "can tho", "vung tau", "da lat", "lam dong", "phu quoc", "an giang", "nha trang"];
const CENTRAL = ["hue", "da nang", "hoi an", "quang binh", "quang tri"];
const EXTRA_STOP = 0.1;  // mỗi địa điểm thêm +10%: giá/ngày tour nội địa tăng khoảng 7-9% mỗi điểm dừng trên dữ liệu cào được

const normalize = (text) => (text || "")
  .replace(/đ/g, "d").replace(/Đ/g, "D")
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// "3 ngày 2 đêm", "3N2Đ", "3 ngày" -> { days, nights }
const parseDuration = (text) => {
  const t = normalize(text);
  const m = t.match(/(\d+)\s*(?:ngay|n)\s*(\d+)\s*(?:dem|d)\b/) || t.match(/(\d+)\s*ngay/);
  return m ? { days: +m[1], nights: m[2] !== undefined ? +m[2] : null } : { days: null, nights: null };
};

// Khởi hành xa điểm đến -> giá thường gồm vé máy bay, đắt gấp 2-3 lần giá tour đường bộ
const isFlown = (row, text, cityKeys) => {
  const from = normalize(row.departure_city) || (text.match(/ tu (tp hcm|ho chi minh|ha noi) /) || [])[1] || "";
  if (/ho chi minh|hcm/.test(from)) return cityKeys.every(c => !SOUTH.includes(c));
  if (/ha noi/.test(from)) return cityKeys.every(c => SOUTH.includes(c) || CENTRAL.includes(c));
  return false;
};

const percentile = (sorted, p) => {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  return Math.round((sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo)) / 1000) * 1000;  // làm tròn 1.000đ
};

const sameDuration = (row, want) => want.days !== null && row.duration_days === want.days
  && (want.nights === null || row.duration_nights == null || row.duration_nights === want.nights);

// rows: tour đối thủ; cities: tên thành phố của tour mình; time: chuỗi thời lượng
const suggestFor = (rows, cities, time, now) => {
  const want = parseDuration(time);
  const cityKeys = cities.map(normalize).filter(Boolean);

  const matches = [];
  for (const row of rows) {
    const text = ` ${normalize(`${row.tour_name} ${row.destination || ""}`)} `;
    // "từ Hà Nội" là nơi khởi hành, không phải điểm đến
    const matched = cityKeys.filter(c => text.split(` ${c} `).length - text.split(` tu ${c} `).length > 0);
    if (matched.length) {
      matches.push({ ...row, matchedCities: matched.length, sameDuration: sameDuration(row, want), flown: isFlown(row, text, cityKeys) });
    }
  }
  matches.sort((a, b) => (b.matchedCities - a.matchedCities) || (b.sameDuration - a.sameDuration) || (a.price_adult - b.price_adult));

  // thời lượng ảnh hưởng giá nhiều nhất: lấy nhóm đầu tiên có đủ 3 tour, không có thì nhóm đầu tiên khác rỗng
  const land = matches.filter(m => !m.flown);
  const pool = land.length ? land : matches;
  const best = pool.filter(m => m.matchedCities === pool[0].matchedCities);
  const near = (m) => want.days !== null && m.duration_days != null && Math.abs(m.duration_days - want.days) <= 1;
  const tiers = [
    ["cùng địa điểm và cùng thời lượng", best.filter(m => m.sameDuration)],
    ["cùng thời lượng, khớp một phần địa điểm", pool.filter(m => m.sameDuration)],
    ["thời lượng chênh tối đa 1 ngày, đã quy đổi theo số ngày", best.filter(near)],
    ["thời lượng chênh tối đa 1 ngày, khớp một phần địa điểm, đã quy đổi theo số ngày", pool.filter(near)],
    want.days !== null
      ? ["cùng địa điểm, thời lượng khác, đã quy đổi theo số ngày", best.filter(m => m.duration_days)]
      : ["cùng địa điểm, mọi thời lượng", best],
  ];
  const [basisText, basis] = tiers.find(([, t]) => t.length >= 3) || tiers.find(([, t]) => t.length) || tiers[4];
  // quy về đúng số ngày cần tính để tour dài/ngắn hơn không làm lệch giá
  const prices = basis
    .map(m => (want.days !== null && m.duration_days ? Math.round(m.price_adult * want.days / m.duration_days / 1000) * 1000 : m.price_adult))
    .sort((a, b) => a - b);
  const stats = prices.length ? {
    count: prices.length,
    min: prices[0],
    p25: percentile(prices, 0.25),
    median: percentile(prices, 0.5),
    p75: percentile(prices, 0.75),
    max: prices[prices.length - 1],
  } : null;

  return {
    duration: want,
    basisText,
    stats,
    staleCount: basis.filter(m => now - new Date(m.scraped_at) > STALE_MS).length,
    flownCount: matches.length - land.length,
    allFlown: matches.length > 0 && !land.length,
    suggestedPrice: stats ? Math.round(stats.median / 10000) * 10000 : null,  // làm tròn 10.000đ
    tours: matches.slice(0, 30),
  };
};

// Nhiều địa điểm: lấy nơi giá cao nhất rồi cộng phí điểm thêm, nên tick thêm địa điểm thì giá luôn tăng
module.exports = (rows, cities, time, now = new Date()) => {
  const all = suggestFor(rows, cities, time, now);
  if (cities.length < 2) return all;
  const top = cities.map(city => ({ city, ...suggestFor(rows, [city], time, now) }))
    .filter(r => r.stats)
    .sort((a, b) => b.suggestedPrice - a.suggestedPrice)[0];
  if (!top) return all;

  const extra = cities.length - 1;
  const scale = (n) => Math.round(n * (1 + EXTRA_STOP * extra) / 1000) * 1000;
  const { count, min, p25, median, p75, max } = top.stats;
  return {
    ...all,
    basisText: `${top.basisText}, theo ${top.city} (giá cao nhất), cộng ${Math.round(EXTRA_STOP * extra * 100)}% cho ${extra} điểm thêm`,
    stats: { count, min: scale(min), p25: scale(p25), median: scale(median), p75: scale(p75), max: scale(max) },
    suggestedPrice: Math.round(scale(median) / 10000) * 10000,
    staleCount: top.staleCount,
    flownCount: top.flownCount,
    allFlown: top.allFlown,
  };
};

module.exports.normalize = normalize;
module.exports.parseDuration = parseDuration;
