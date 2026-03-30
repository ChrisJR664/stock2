export default async function handler(req, res) {
  const STOCK_LIST = [
    ["0050", "tse"],
    ["00713", "tse"],
    ["00915", "tse"],
    ["1609", "tse"],
    ["2312", "tse"],
    ["2408", "tse"],
    ["3290", "otc"],
    ["3481", "tse"],
    ["5371", "otc"],
    ["6462", "tse"],
    ["6770", "tse"],
  ];

  try {
    const results = {};

    // 把股票列表組成一次 API 請求的字串
    const query = STOCK_LIST.map(([id, market]) => `${market}_${id}.tw`).join("|");
    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${query}&json=1&delay=0`;

    const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const data = await response.json();

    // 處理每檔股票
    data.msgArray.forEach(s => {
      const lastPrice = s.z !== "-" ? parseFloat(s.z) : null;
      const yesterday = s.y !== "-" ? parseFloat(s.y) : null;
      const changePercent = lastPrice && yesterday ? (((lastPrice - yesterday) / yesterday) * 100).toFixed(2) : null;

      results[s.c] = {
        price: lastPrice,
        change: lastPrice && yesterday ? (lastPrice - yesterday).toFixed(2) : null,
        change_percent: changePercent,
        open: s.o !== "-" ? parseFloat(s.o) : null,
        high: s.h !== "-" ? parseFloat(s.h) : null,
        low: s.l !== "-" ? parseFloat(s.l) : null,
        volume: s.v !== "-" ? parseInt(s.v.replace(/,/g, "")) : null,
        bid: s.b !== "-" ? parseFloat(s.b) : null,
        ask: s.a !== "-" ? parseFloat(s.a) : null
      };
    });

    // 不快取，確保每次刷新都是即時
    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(results);

  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
