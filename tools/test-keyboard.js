/**
 * D 款的鍵盤測試：全螢幕選單、右下角「下一步」及公告條都可以只用鍵盤操作。
 * 用法：node tools/test-keyboard.js
 *
 * 逐項檢查（桌面 1440 闊及手機 390 闊，中英文首頁及一個內頁）：
 * 1. 按 Tab 可以到達〔選單〕；按 Enter 開啟，焦點移到「關閉」，aria-expanded 變成 true。
 * 2. 選單開啟時，Tab 及 Shift+Tab 只在選單內循環。
 * 3. 按 Esc 關閉選單，焦點回到〔選單〕。
 * 4. 用空白鍵開啟，再在「關閉」按 Enter 關閉。
 * 5. 「下一步」按 Enter 展開，焦點移到第一個連結；按 Esc 收起，焦點回到按鈕。
 * 6. 公告條的「✕」按 Enter 可以關閉公告條。
 */
'use strict';
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium, devices } = require(path.join(__dirname, '..', '..', 'backup', 'tools', 'node_modules', 'playwright-core'));

const DOCS = path.join(__dirname, '..', 'docs');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.jpg': 'image/jpeg', '.png': 'image/png' };
const PAGES = ['d/zh/index.html', 'd/en/index.html', 'd/zh/services.html'];

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const file = path.join(DOCS, p);
    if (!file.startsWith(DOCS) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

(async () => {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  const fail = [];
  const check = (label, ok, detail = '') => { (ok ? results : fail).push(`${ok ? 'OK  ' : 'FAIL'} ${label}${detail ? '：' + detail : ''}`); };
  const active = (page) => page.evaluate(() => {
    const a = document.activeElement;
    return { cls: a.className || a.tagName, inPanel: !!a.closest('#menu-panel'), inQuick: !!a.closest('#quick-menu') };
  });

  for (const [mode, opts] of [['桌面', { viewport: { width: 1440, height: 900 } }], ['手機', { ...devices['iPhone 13'] }]]) {
    for (const p of PAGES) {
      const ctx = await browser.newContext(opts);
      const page = await ctx.newPage();
      await page.goto(base + p, { waitUntil: 'load' });
      const tag = `${mode} ${p}`;

      // 1. 用 Tab 到達〔選單〕
      let reached = false;
      for (let i = 0; i < 30 && !reached; i++) {
        await page.keyboard.press('Tab');
        reached = (await active(page)).cls.includes('menu-toggle');
      }
      check(`${tag} 按 Tab 可以到達〔選單〕`, reached);
      await page.keyboard.press('Enter');
      const opened = await page.evaluate(() => ({
        visible: getComputedStyle(document.getElementById('menu-panel')).display !== 'none',
        expanded: document.querySelector('.menu-toggle').getAttribute('aria-expanded'),
        modal: document.getElementById('menu-panel').getAttribute('aria-modal'),
      }));
      check(`${tag} 按 Enter 開啟全螢幕選單`, opened.visible && opened.expanded === 'true' && opened.modal === 'true', JSON.stringify(opened));
      check(`${tag} 開啟後焦點在「關閉」`, (await active(page)).cls.includes('menu-close'));

      // 2. Tab 及 Shift+Tab 只在選單內循環
      let trapped = true;
      for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); if (!(await active(page)).inPanel) { trapped = false; break; } }
      for (let i = 0; i < 5 && trapped; i++) { await page.keyboard.press('Shift+Tab'); if (!(await active(page)).inPanel) trapped = false; }
      check(`${tag} 選單開啟時 Tab 只在選單內循環`, trapped);

      // 3. Esc 關閉，焦點回到〔選單〕
      await page.keyboard.press('Escape');
      const closed = await page.evaluate(() => ({
        visible: getComputedStyle(document.getElementById('menu-panel')).display !== 'none',
        expanded: document.querySelector('.menu-toggle').getAttribute('aria-expanded'),
      }));
      check(`${tag} 按 Esc 關閉選單`, !closed.visible && closed.expanded === 'false', JSON.stringify(closed));
      check(`${tag} 關閉後焦點回到〔選單〕`, (await active(page)).cls.includes('menu-toggle'));

      // 4. 空白鍵開啟，「關閉」按 Enter 關閉
      await page.keyboard.press('Space');
      const open2 = await page.evaluate(() => document.getElementById('menu-panel').classList.contains('open'));
      await page.keyboard.press('Enter');
      const open3 = await page.evaluate(() => document.getElementById('menu-panel').classList.contains('open'));
      check(`${tag} 空白鍵開啟、在「關閉」按 Enter 關閉`, open2 && !open3 && (await active(page)).cls.includes('menu-toggle'));

      // 5. 「下一步」
      await page.focus('.quick-btn');
      await page.keyboard.press('Enter');
      const q1 = await page.evaluate(() => document.getElementById('quick-menu').classList.contains('open'));
      const q1focus = (await active(page)).inQuick;
      await page.keyboard.press('Escape');
      const q2 = await page.evaluate(() => document.getElementById('quick-menu').classList.contains('open'));
      check(`${tag}「下一步」Enter 展開、Esc 收起`, q1 && q1focus && !q2 && (await active(page)).cls.includes('quick-btn'));

      // 6. 公告條
      await page.focus('.announce-close');
      await page.keyboard.press('Enter');
      const hidden = await page.evaluate(() => document.getElementById('announce').hidden);
      check(`${tag} 公告條可以用鍵盤關閉`, hidden);

      await ctx.close();
    }
  }
  await browser.close();
  server.close();
  results.forEach((r) => console.log(r));
  if (fail.length) { console.log('\n未通過：'); fail.forEach((r) => console.log(r)); process.exitCode = 1; }
  else console.log(`\n全部 ${results.length} 項通過。`);
})();
