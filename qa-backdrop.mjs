export default async function run(page) {
  const shots = [];
  for (const [w, h] of [
    [1200, 760],
    [390, 844],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("http://localhost:5199/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `view-${w}.png` });
    shots.push(`view-${w}.png`);

    await page.evaluate(() => {
      document.querySelector(".page-layer").style.opacity = "0";
      document.querySelector(".nav")?.style.setProperty("opacity", "0");
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `silk-${w}.png` });
    shots.push(`silk-${w}.png`);
  }
  return shots;
}
