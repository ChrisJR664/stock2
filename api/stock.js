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

    // 一次打多檔（比你一檔一檔打快很多）
    const query = STOCK_LIST.map(
      ([id, market]) => `${market}_${id}.tw`
    ).join("|");

    const url = `https://mis.twse.com.tw/stock/api/getStockInfo.jsp?ex_ch=${query}&json=1&delay=0`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const data = await response.json();

    data.msgArray.forEach((s) => {
      results[s.c] = {
        price: s.z,
        volume: s.v,
        bid: s.b,
        ask: s.a,
      };
    });

    res.setHeader("Cache-Control", "no-store");
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
