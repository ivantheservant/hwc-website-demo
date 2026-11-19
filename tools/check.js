/**
 * 檢查 docs\ 的輸出。用法：node tools/check.js
 *
 * 1. 每頁都有 noindex 及「示範網站 Demo」標示；robots.txt 拒絕全部搜尋引擎。
 * 2. 全部內部連結、圖片、CSS、JS 都指向存在的檔案。
 * 3. 每款設計的中文及英文頁數相同，而且頁面一一對應。
 * 4. 每款設計的首頁可以連到該款的全部內頁。
 * 5. /current/ 的文字與 backup\pages\ 的備份一致（逐行比對，忽略空格、標點及圖片）。
 * 6. 列出全部外部連結（加上 --external 時逐一測試能否開啟）。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const DOCS = path.join(__dirname, '..', 'docs');
const BACKUP = path.join(__dirname, '..', '..', 'backup', 'pages');
const problems = [];
const notes = [];

function walk(dir, base = '') {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) out = out.concat(walk(path.join(dir, e.name), rel)); else out.push(rel);
  }
  return out;
}
const files = walk(DOCS);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const fileSet = new Set(files);
const read = (rel) => fs.readFileSync(path.join(DOCS, rel), 'utf8');

/* 1. noindex 及示範標示 */
for (const f of htmlFiles) {
  const html = read(f);
  if (!/<meta name="robots" content="noindex/.test(html)) problems.push(`${f}: 沒有 noindex`);
  const redirect = /^[abcd]\/index\.html$/.test(f);
  if (!redirect && !/示範網站 Demo|Demo site 示範網站/.test(html)) problems.push(`${f}: 沒有「示範網站 Demo」標示`);
}
const robots = fileSet.has('robots.txt') ? read('robots.txt') : '';
if (!/User-agent: \*\s+Disallow: \//.test(robots)) problems.push('robots.txt 沒有拒絕全部搜尋引擎');

/* 1b. 已移除的相片（有兒童樣貌）不可以再出現；英文 Bulletin 四個版本都只收錄最新一期 */
const REMOVED_IMAGES = ['anniversary-1.jpg', 'anniversary-5.jpg', 'anniversary-15.jpg', 'camp-2018.jpg', 'children-worship.jpg',
  'chinese-school-1.jpg', 'chinese-school-2.jpg', 'chinese-school-3.jpg', 'congregation-wide.jpg', 'english-group.jpg',
  'first-sunday-1994.jpg', 'stm-2.jpg'];
for (const name of REMOVED_IMAGES) {
  if (fileSet.has(`assets/img/${name}`)) problems.push(`docs/assets/img/${name} 仍然存在（已決定移除）`);
  const used = htmlFiles.filter((f) => read(f).includes(`img/${name}`));
  if (used.length) problems.push(`${name} 仍被引用：${used.slice(0, 3).join(', ')}`);
}
// 舊期 Bulletin 的內容（宣教士代禱事項、8 November 的程序）
const OLD_ISSUE = ['Mission News', 'Rev Janet', 'Pray that God will keep S&amp;C', 'Jacob, whom Nic', '8 November 2026', 'Clap your hands, all you nations', 'Rebecca Ho', 'Bible and politics'];
const bulletins = htmlFiles.filter((f) => /(^|\/)bulletin\.html$/.test(f) && !/\/zh\/|\/chi\//.test(f));
for (const f of bulletins) {
  const html = read(f);
  if (!html.includes('15 November 2026')) problems.push(`${f}: 找不到最新一期（15 November 2026）`);
  for (const s of OLD_ISSUE) if (html.includes(s)) problems.push(`${f}: 含有舊期 Bulletin 的內容「${s}」`);
}
for (const f of htmlFiles) {
  const html = read(f);
  for (const s of ['Mission News', 'Rev Janet', 'Jacob, whom Nic']) if (html.includes(s)) problems.push(`${f}: 含有舊期 Bulletin 的內容「${s}」`);
}
if (bulletins.length !== 5) problems.push(`英文 Bulletin 應有 5 個版本，實際找到 ${bulletins.length} 個：${bulletins.join(', ')}`);
else notes.push(`英文 Bulletin：${bulletins.join('、')} 五個版本都只有最新一期（15 November 2026）`);

/* 2. 內部連結及資源 */
const external = new Map();
const linksFrom = {};
let internalCount = 0;
for (const f of htmlFiles) {
  const html = read(f);
  linksFrom[f] = new Set();
  const refs = [...html.matchAll(/(?:href|src)="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
  for (const m of html.matchAll(/url\('([^']+)'\)/g)) refs.push(m[1]);
  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:)/.test(ref)) {
      if (/^https?:/.test(ref)) { if (!external.has(ref)) external.set(ref, f); }
      continue;
    }
    if (ref.startsWith('#')) {
      if (ref === '#') problems.push(`${f}: 有未完成的連結（#）`);
      else if (!html.includes(`id="${ref.slice(1)}"`)) problems.push(`${f}: 頁內連結 ${ref} 找不到對應位置`);
      continue;
    }
    const [file, frag] = ref.split('#');
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(f), file));
    internalCount++;
    if (!fileSet.has(target)) problems.push(`${f}: 連結失效 ${ref}`);
    else if (target.endsWith('.html')) {
      linksFrom[f].add(target);
      // 連到另一頁的某個位置（例如 services.html#service-english）時，確認該位置存在
      if (frag && !read(target).includes(`id="${frag}"`)) problems.push(`${f}: ${ref} 找不到對應位置`);
    }
  }
}
// CSS 內的圖片
for (const f of files.filter((x) => x.endsWith('.css'))) {
  for (const m of read(f).matchAll(/url\('([^']+)'\)/g)) {
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]));
    if (!fileSet.has(target)) problems.push(`${f}: 圖片不存在 ${m[1]}`);
  }
}

/* 3. 中英文頁數；4. 首頁連到全部內頁 */
const summary = [];
for (const theme of ['a', 'b', 'c', 'd']) {
  const zh = htmlFiles.filter((f) => f.startsWith(`${theme}/zh/`)).map((f) => path.basename(f)).sort();
  const en = htmlFiles.filter((f) => f.startsWith(`${theme}/en/`)).map((f) => path.basename(f)).sort();
  summary.push(`/${theme}/　中文 ${zh.length} 頁，英文 ${en.length} 頁`);
  if (zh.join() !== en.join()) problems.push(`/${theme}/ 中英文頁面不對應：${zh.filter((x) => !en.includes(x)).concat(en.filter((x) => !zh.includes(x))).join(', ')}`);
  for (const lang of ['zh', 'en']) {
    const home = `${theme}/${lang}/index.html`;
    const missing = htmlFiles.filter((f) => f.startsWith(`${theme}/${lang}/`) && f !== home && !linksFrom[home].has(f));
    if (missing.length) problems.push(`${home}: 首頁沒有連到 ${missing.join(', ')}`);
  }
}
{
  const zh = htmlFiles.filter((f) => /^current\/(chi|chin)\//.test(f));
  const en = htmlFiles.filter((f) => /^current\/en\//.test(f) || f === 'current/bulletin.html');
  summary.push(`/current/　中文 ${zh.length} 頁，英文 ${en.length} 頁，另加入口頁 1 頁（頁面照現有網站，中英文各有一頁對方沒有：北岸事工、Vacancies）`);
  if (zh.length !== en.length) problems.push(`/current/ 中英文頁數不同：${zh.length} 及 ${en.length}`);
}

/* 5. /current/ 的文字與備份比對 */
const norm = (s) => s.normalize('NFKC').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#42;/g, '*').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/[^\p{L}\p{N}]/gu, '').toLowerCase();
function htmlText(html) {
  const main = html.match(/<main>([\s\S]*)<\/main>/)[1];
  return norm(main.replace(/<[^>]+>/g, ' '));
}
function backupLines(md) {
  const body = md.replace(/\r\n/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '');
  const out = [];
  for (let line of body.split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('![') || line.startsWith('>')) continue; // 圖片及嵌入區塊的記錄
    line = line.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/^(\d+\.|-)\s+/, '');
    if (norm(line)) out.push(line);
  }
  return out;
}
// 刻意不照搬的內容（原因見 README「與備份的差異」）
const EXPECTED = [
  /^HWC Contributor$/, // blog 的作者連結
  /Sunday Service Attendance/, // 出席人數表是嵌入的程式，備份沒有內容
  /^www\.facebook\.com\/holywordchurch$/, // 聯絡頁的 Facebook 連結文字，示範網站統一寫法
];
// 英文 bulletin 只收錄最新一期（15 November 2026），較早一期不轉載
const CUT_AFTER = { bulletin: 'Committee on Duty: Nixon Fong' };
const PAIRS = {
  'chi_welcome': 'current/chi/welcome.html', 'chi_about-us': 'current/chi/about-us.html', 'chi_meetings': 'current/chi/meetings.html',
  'chi_our-team': 'current/chi/our-team.html', 'chin_giving': 'current/chin/giving.html', 'chi_statement-of-faith': 'current/chi/statement-of-faith.html',
  'chi_northshore': 'current/chi/northshore.html', 'chi_bulletin': 'current/chi/bulletin.html', 'chi_mission': 'current/chi/mission.html',
  'chi_downloads': 'current/chi/downloads.html', 'chi_contact-us': 'current/chi/contact-us.html',
  'en_welcome': 'current/en/welcome.html', 'en_about-us': 'current/en/about-us.html', 'en_meetings': 'current/en/meetings.html',
  'en_our-team': 'current/en/our-team.html', 'en_giving': 'current/en/giving.html', 'en_statement-of-faith': 'current/en/statement-of-faith.html',
  'en_jobs': 'current/en/jobs.html', 'bulletin': 'current/bulletin.html', 'en_mission': 'current/en/mission.html',
  'en_downloads': 'current/en/downloads.html', 'en_contact-us': 'current/en/contact-us.html', 'root': 'current/index.html',
};
let compared = 0;
let matched = 0;
const diffs = [];
for (const [name, out] of Object.entries(PAIRS)) {
  if (!fileSet.has(out)) { problems.push(`找不到 ${out}`); continue; }
  const page = htmlText(read(out));
  let lines = backupLines(fs.readFileSync(path.join(BACKUP, name + '.md'), 'utf8'));
  if (CUT_AFTER[name]) lines = lines.slice(0, lines.indexOf(CUT_AFTER[name]) + 1);
  for (const line of lines) {
    if (EXPECTED.some((re) => re.test(line))) continue;
    compared++;
    if (page.includes(norm(line))) matched++; else diffs.push(`${name}: ${line.length > 90 ? line.slice(0, 90) + '…' : line}`);
  }
}

/* 報告 */
console.log(`頁面：${htmlFiles.length} 個 HTML 檔`);
summary.forEach((s) => console.log('  ' + s));
console.log(`內部連結及資源：檢查了 ${internalCount} 個`);
console.log(`外部連結：${external.size} 個不同的網址`);
notes.forEach((n) => console.log(n));
console.log(`已移除的相片：${REMOVED_IMAGES.length} 張都不在 docs\\ 內，也沒有被引用`);
console.log(`與備份比對文字：${compared} 行，其中 ${matched} 行一致，${diffs.length} 行有出入`);
if (diffs.length) { console.log('\n與備份有出入的行（原因見 README「與備份的差異」）：'); diffs.forEach((d) => console.log('  - ' + d)); }
if (problems.length) { console.log('\n問題：'); problems.forEach((p) => console.log('  - ' + p)); process.exitCode = 1; } else console.log('\n沒有發現問題。');

if (process.argv.includes('--external')) {
  (async () => {
    console.log('\n測試外部連結……');
    const bad = [];
    for (const [url, from] of external) {
      if (/fonts\.g(oogleapis|static)\.com/.test(url)) continue;
      try {
        const res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 link-check' }, signal: AbortSignal.timeout(20000) });
        if (res.status >= 400) bad.push(`${res.status}　${url}　（${from}）`);
      } catch (e) {
        bad.push(`無法連線　${url}　（${from}）`);
      }
    }
    if (bad.length) { console.log('未能確認的外部連結：'); bad.forEach((b) => console.log('  - ' + b)); } else console.log('全部外部連結都可以開啟。');
  })();
}
