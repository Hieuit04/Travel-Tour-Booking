// Gợi ý giá người lớn từ giá tour đối thủ (collection competitor_prices)

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

const percentile = (sorted, p) => {
  const i = (sorted.length - 1) * p;
  const lo = Math.floor(i);
  return Math.round((sorted[lo] + (sorted[Math.ceil(i)] - sorted[lo]) * (i - lo)) / 1000) * 1000;  // làm tròn 1.000đ
};

const sameDuration = (row, want) => want.days !== null && row.duration_days === want.days
  && (want.nights === null || row.duration_nights == null || row.duration_nights === want.nights);

// rows: tour đối thủ; cities: tên thành phố của tour mình; time: chuỗi thời lượng
module.exports = (rows, cities, time) => {
  const want = parseDuration(time);
  const cityKeys = cities.map(normalize).filter(Boolean);

  const matches = [];
  for (const row of rows) {
    const text = ` ${normalize(`${row.tour_name} ${row.destination || ""}`)} `;
    // "từ Hà Nội" là nơi khởi hành, không phải điểm đến
    const matched = cityKeys.filter(c => text.split(` ${c} `).length - text.split(` tu ${c} `).length > 0);
    if (matched.length) {
      matches.push({ ...row, matchedCities: matched.length, sameDuration: sameDuration(row, want) });
    }
  }
  matches.sort((a, b) => (b.matchedCities - a.matchedCities) || (b.sameDuration - a.sameDuration) || (a.price_adult - b.price_adult));

  // thời lượng ảnh hưởng giá nhiều nhất: lấy nhóm đầu tiên có đủ 3 tour, không có thì nhóm đầu tiên khác rỗng
  const best = matches.filter(m => m.matchedCities === (matches[0] || {}).matchedCities);
  const near = (m) => want.days !== null && m.duration_days != null && Math.abs(m.duration_days - want.days) <= 1;
  const tiers = [
    ["cùng địa điểm và cùng thời lượng", best.filter(m => m.sameDuration)],
    ["cùng thời lượng, khớp một phần địa điểm", matches.filter(m => m.sameDuration)],
    ["thời lượng chênh tối đa 1 ngày", best.filter(near)],
    ["thời lượng chênh tối đa 1 ngày, khớp một phần địa điểm", matches.filter(near)],
    ["cùng địa điểm, mọi thời lượng", best],
  ];
  const [basisText, basis] = tiers.find(([, t]) => t.length >= 3) || tiers.find(([, t]) => t.length) || tiers[4];
  const prices = basis.map(m => m.price_adult).sort((a, b) => a - b);
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
    suggestedPrice: stats ? Math.round(stats.median / 10000) * 10000 : null,  // làm tròn 10.000đ
    tours: matches.slice(0, 30),
  };
};

module.exports.normalize = normalize;
module.exports.parseDuration = parseDuration;
