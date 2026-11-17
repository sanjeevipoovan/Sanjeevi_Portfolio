export default async function run(page) {
  const out = {};
  out.assets = {};
  for (const path of ["/portrait.webp", "/favicon.ico", "/favicon-64.png", "/favicon-32.png", "/apple-touch-icon.png"]) {
    const res = await page.request.get("http://localhost:4173" + path);
    out.assets[path] = res.status();
  }

  for (const [w, h] of [[1440, 900], [1280, 900], [1024, 800], [390, 844]]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const img = page.locator(".hero-portrait img");
    const visible = await img.isVisible().catch(() => false);
    out[w] = {
      visible,
      box: visible ? await img.boundingBox() : null,
      status: await img.evaluate((el) => el.complete && el.naturalWidth).catch(() => 0),
      titleBox: await page.locator(".hero-title").boundingBox(),
      bodyTop: (await page.locator(".hero-body").boundingBox())?.y ?? null,
    };
    await page.screenshot({ path: `hero-${w}.png` });
  }
  return out;
}
