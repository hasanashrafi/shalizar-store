const mongoose = require("mongoose");

const COMMODITIES = [
  { title: "نبات زرد", slug: "nabat-zard", price: 90000, caliber: "درجه یک" },
  { title: "نبات سفید", slug: "nabat-sefid", price: 95000, caliber: "درجه یک" },
  { title: "قند", slug: "ghand", price: 45000, caliber: "معمولی" },
  { title: "کشمش", slug: "keshmesh", price: 180000, caliber: "بیدانه" },
  { title: "جو", slug: "jav", price: 25000, caliber: "درجه یک" },
  { title: "ذرت", slug: "zarat", price: 22000, caliber: "درجه یک" },
  { title: "چای", slug: "chai", price: 650000, caliber: "ممتاز" },
  { title: "برنج", slug: "berenj", price: 120000, caliber: "طارم هاشمی" },
];

function tiers(base) {
  return [
    { minKg: 1, maxKg: 999, pricePerKg: base },
    { minKg: 1000, maxKg: 2999, pricePerKg: Math.round(base * 0.96) },
    { minKg: 3000, maxKg: null, pricePerKg: Math.round(base * 0.91) },
  ];
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    let created = 0;
    for (const c of COMMODITIES) {
      const doc = {
        title: c.title,
        slug: c.slug,
        origin: "مرند",
        caliber: c.caliber,
        wastePercent: null,
        moisturePercent: null,
        packaging: "کیسه ۳۰ کیلویی",
        packageWeightKg: 30,
        moqKg: 100,
        stockKg: 5000,
        purchasePricePerKg: Math.round(c.price * 0.9),
        views: 0,
        tiers: tiers(c.price),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const res = await db.collection("products").updateOne(
        { slug: c.slug },
        { $setOnInsert: doc },
        { upsert: true },
      );
      if (res.upsertedCount > 0) created++;
      console.log(`${c.title} (${c.slug}) -> ${res.upsertedCount ? "created" : "exists"}`);
    }
    console.log(`\nDone. New products created: ${created}`);
    await mongoose.disconnect();
  } catch (e) {
    console.error("ERR", e.message);
    process.exit(1);
  }
})();