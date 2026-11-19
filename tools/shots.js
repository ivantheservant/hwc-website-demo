/**
 * 為 docs\ 內每一頁截圖（桌面 1440 闊及手機 390 闊，整頁），存到 ..\designs\screenshots\<款式>\。
 *
 * 用法：node tools/shots.js            全部頁面
 *       node tools/shots.js a/zh/index  只截網址包含這段文字的頁面（可以寫多個）
 *
 * 使用本機已安裝的 Chrome，以及 backup\tools 內已安裝的 playwright-core，不需要另外安裝。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium, devices } = require(path.join(__dirname, '..', '..', 'backup', 'tools', 'node_modules', 'playwright-core'));

const DOCS = path.join(__dirname, '..', 'docs');
const OUT = path.join(__dirname, '..', '..', 'designs', 'screenshots');
const filters = process.argv.slice(2);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png', '.txt': 'text/plain' };

function listPages(dir, base = '') {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) { if (e.name !== 'assets') out = out.concat(listPages(path.join(dir, e.name), rel)); }
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(DOCS, p);
    if (!file.startsWith(DOCS) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  // /a/ 至 /d/ 的 index.html 只是轉址，不用截圖
  let pages = listPages(DOCS).filter((p) => !/^[abcd]\/index\.html$/.test(p));
  if (filters.length) pages = pages.filter((p) => filters.some((f) => p.includes(f)));
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const modes = [
    ['desktop', { viewport: { width: 1440, height: 900 } }],
    ['mobile', { ...devices['iPhone 13'], deviceScaleFactor: 2 }], // 2 倍解像度：太長的頁面用 3 倍會超出瀏覽器截圖的上限
  ];
  let ok = 0;
  const problems = [];
  for (const [label, opts] of modes) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    for (const p of pages) {
      const theme = p.includes('/') ? p.split('/')[0] : 'index';
      const name = p.replace(/\.html$/, '').split('/').slice(1).join('-') || 'index';
      const file = path.join(OUT, theme, `${name}_${label}.jpg`);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      try {
        await page.goto(base + p, { waitUntil: 'load', timeout: 45000 });
        await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
        await page.evaluate(() => document.fonts.ready);
        // 截圖前先載入全部延遲載入的圖片及嵌入內容（地圖、影片）
        await page.evaluate(async () => {
          document.querySelectorAll('[loading="lazy"]').forEach((el) => { el.loading = 'eager'; });
          for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
          window.scrollTo(0, 0);
          await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
        });
        await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(300);
        const broken = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.getAttribute('src')));
        if (broken.length) problems.push(`${label} ${p}: 圖片未能顯示 ${broken.join(', ')}`);
        const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, h: document.documentElement.scrollHeight }));
        if (m.sw > m.cw + 1) problems.push(`${label} ${p}: 內容比畫面闊（${m.sw} > ${m.cw}）`);
        if (label === 'desktop' && /index\.html$/.test(p) && m.h > 5000) problems.push(`${label} ${p}: 首頁高度 ${m.h}px，超過 5000px`);
        // 嵌入的地圖及影片只會在畫面範圍內繪製，所以先把畫面高度拉長到整頁，截圖後還原
        const vp = page.viewportSize();
        await page.evaluate(() => document.querySelectorAll('.embed iframe').forEach((f) => { f.style.height = f.getBoundingClientRect().height + 'px'; }));
        await page.setViewportSize({ width: vp.width, height: Math.min(m.h, 12000) });
        await page.waitForTimeout(900);
        await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 72 });
        await page.setViewportSize(vp);
        ok++;
      } catch (e) {
        problems.push(`${label} ${p}: ${e.message.split('\n')[0]}`);
      }
    }
    // D 款：另外截取全螢幕選單及「下一步」展開時的畫面（只截一個畫面高度）
    for (const p of pages.filter((x) => /^d\/(zh|en)\/index\.html$/.test(x))) {
      const lang = p.split('/')[1];
      try {
        await page.goto(base + p, { waitUntil: 'load', timeout: 45000 });
        await page.evaluate(() => document.fonts.ready);
        await page.click('.menu-toggle');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(OUT, 'd', `${lang}-menu-open_${label}.jpg`), type: 'jpeg', quality: 80 });
        await page.keyboard.press('Escape');
        await page.click('.quick-btn');
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(OUT, 'd', `${lang}-quick-open_${label}.jpg`), type: 'jpeg', quality: 80 });
        ok += 2;
      } catch (e) {
        problems.push(`${label} ${p}（選單開啟）: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  server.close();
  console.log(`截圖 ${ok} 張（${pages.length} 頁 × 桌面及手機），存到 designs\\screenshots\\`);
  if (problems.length) { console.log('要留意：'); problems.forEach((x) => console.log(' - ' + x)); }
})();
