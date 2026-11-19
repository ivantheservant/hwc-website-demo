/**
 * 五套範本共用的元件：頁首資料、示範標示、選單、崇拜卡片、最新消息、聯絡資料、下載清單、目錄頁。
 * 每套範本自己決定版面（layout / home / page），需要時才取用這裏的元件。
 */
'use strict';

const THEME_LABELS = { current: { zh: '現有', en: 'Current' }, a: { zh: 'A', en: 'A' }, b: { zh: 'B', en: 'B' }, c: { zh: 'C', en: 'C' }, d: { zh: 'D', en: 'D' } };

/** <head>：每一頁都加入 noindex。 */
function head(ctx, opts = {}) {
  const { esc, site, lang } = ctx;
  const suffix = lang === 'zh' ? `${site.church.zh_short}（示範網站）` : `${site.church.en_short} (Demo)`;
  const title = ctx.slug === 'index' ? suffix : `${ctx.fm.title}｜${suffix}`;
  return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-Hant' : 'en'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<meta name="description" content="${esc(ctx.fm.summary || '')}">
${opts.headExtra || ''}
${opts.fonts || ''}
<link rel="stylesheet" href="${ctx.asset('base.css')}">
<link rel="stylesheet" href="${ctx.asset(ctx.theme + '.css')}">
</head>`;
}

/** 頁頂細小的「示範網站 Demo」標示，並可以切換到另一款設計的同一頁。 */
function demoBar(ctx) {
  const { L, lang } = ctx;
  const links = ['current', 'a', 'b', 'c', 'd'].map((th) =>
    `<a href="${ctx.themeUrl(th)}"${th === ctx.theme ? ' class="on" aria-current="true"' : ''}>${THEME_LABELS[th][lang]}</a>`).join('');
  return `<div class="demo-bar"><strong>${L.demo_bar}</strong><span class="demo-bar-note">${L.demo_bar_note}</span>` +
    `<span class="demo-bar-switch"><a href="${ctx.root}index.html">${L.all_designs}</a>${links}</span></div>`;
}

/** 選單項目可以是頁面代號，或 { ext, label } 形式的外部連結。 */
function itemLink(ctx, item) {
  if (typeof item === 'string') return { href: ctx.url(item), label: ctx.navTitle(item), on: item === ctx.slug };
  return { href: ctx.t(ctx.site.external[item.ext]), label: ctx.t(item.label), ext: true, on: false };
}

/**
 * 主選單。groups 的每一項：{ label, items: [...] } 是下拉選單；{ label, link } 是單一連結；
 * 加上 button: true 會顯示成按鈕。
 */
function navList(ctx, groups) {
  const lis = groups.map((g) => {
    const label = ctx.t(g.label);
    if (g.link) {
      const on = g.link === ctx.slug;
      const cls = [g.button ? 'nav-btn' : '', g.cls || ''].join(' ').trim();
      return `<li${on ? ' class="active"' : ''}><a href="${ctx.url(g.link)}"${cls ? ` class="${cls}"` : ''}>${label}</a></li>`;
    }
    const items = g.items.map((i) => itemLink(ctx, i));
    const on = items.some((i) => i.on);
    return `<li class="has-sub${on ? ' active' : ''}"><a href="${items[0].href}" aria-haspopup="true">${label}</a><ul class="sub">` +
      items.map((i) => `<li><a href="${i.href}"${i.ext ? ' target="_blank" rel="noopener"' : ''}${i.on ? ' aria-current="page"' : ''}>${i.label}</a></li>`).join('') +
      '</ul></li>';
  });
  return `<ul class="nav">${lis.join('')}</ul>`;
}

function navToggle(ctx) {
  return `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav"><span class="nav-toggle-icon" aria-hidden="true"></span>${ctx.L.menu}</button>`;
}

function langSwitch(ctx) {
  const { lang, L } = ctx;
  const zh = lang === 'zh' ? `<span class="on" aria-current="true">${L.lang_zh}</span>` : `<a href="${ctx.otherUrl(ctx.slug)}" lang="zh-Hant">${L.lang_zh}</a>`;
  const en = lang === 'en' ? `<span class="on" aria-current="true">${L.lang_en}</span>` : `<a href="${ctx.otherUrl(ctx.slug)}" lang="en">${L.lang_en}</a>`;
  return `<span class="lang-switch">${zh}<span class="sep" aria-hidden="true">｜</span>${en}</span>`;
}

/** 四堂崇拜卡片（資料在 site.json，中英文共用）。opts.order 可以指定次序。 */
function serviceCards(ctx, opts = {}) {
  let list = ctx.site.services;
  if (opts.order) list = opts.order.map((id) => list.find((s) => s.id === id));
  return `<div class="service-cards">` + list.map((s) =>
    `<a class="service-card service-${s.id}" href="${ctx.url(s.link)}">` +
    `<span class="service-lang">${ctx.t(s.lang)}</span>` +
    `<span class="service-time">${s.time}</span>` +
    `<span class="service-day">${ctx.L.every_sunday}</span>` +
    `<span class="service-place">${ctx.t(s.place)}</span></a>`).join('') + '</div>';
}

/** 樸素版面用的崇拜時間清單。 */
function serviceList(ctx) {
  return '<ul>' + ctx.site.services.map((s) => `<li>${ctx.t(s.lang)}：${s.time}</li>`).join('') + '</ul>';
}

function demoTag(ctx) {
  return `<span class="demo-tag">${ctx.L.demo_tag}</span>`;
}

function newsList(ctx, n) {
  return '<div class="news-list">' + ctx.site.news.slice(0, n).map((item) =>
    `<article class="news-item"><time datetime="${item.date}">${ctx.formatDate(item.date, ctx.lang)}</time>` +
    `<h3>${ctx.esc(item[ctx.lang].title)}</h3><p>${ctx.esc(item[ctx.lang].text)}</p></article>`).join('') + '</div>';
}

function contactBlock(ctx) {
  const c = ctx.site.contact;
  return `<div class="contact-block"><p>${c.address}</p>` +
    `<p><a href="tel:+6492711608">${c.phone}</a> | <a href="mailto:${c.email}">${c.email}</a></p>` +
    `<p><a href="${c.facebook[ctx.lang]}" target="_blank" rel="noopener">${c.facebook_label[ctx.lang]}</a></p></div>`;
}

function mapBlock(ctx) {
  const c = ctx.site.contact;
  return `<div class="map"><iframe src="${c.map_embed}" title="${ctx.L.map}" loading="lazy"></iframe></div>` +
    `<p class="map-link"><a href="${c.map_link}" target="_blank" rel="noopener">${ctx.L.map}</a></p>`;
}

/** 文件下載清單。現有版面按原有分類逐項列出；新設計再按 group 歸類。 */
function downloadsBlock(ctx) {
  const { lang, downloads: d, esc } = ctx;
  const itemUrl = (i) => (typeof i.url === 'string' ? i.url : i.url[lang]);
  const list = (cat) => '<ul class="dl-list">' + cat.items.map((i) =>
    `<li><a href="${esc(itemUrl(i))}" target="_blank" rel="noopener">${esc(i[lang])}</a></li>`).join('') + '</ul>';
  if (ctx.theme === 'current') {
    return d.categories.filter((c) => !c.only || c.only === lang)
      .map((c) => `<h4>${esc(c.title[lang])}</h4>${list(c)}`).join('\n');
  }
  return Object.keys(d.groups).map((g) => {
    const cats = d.categories.filter((c) => c.group === g);
    const inner = cats.map((c) => (cats.length > 1 ? `<h3>${esc(c.title[lang])}</h3>` : '') + list(c)).join('');
    return `<section class="dl-group"><h2>${esc(d.groups[g][lang])}</h2>${inner}</section>`;
  }).join('\n');
}

/** 頁尾的「網站內容」：列出全部內頁，確保首頁可以連到每一頁。 */
function sitemap(ctx, groups, extra = []) {
  const cols = groups.filter((g) => g.items).map((g) =>
    `<div class="sitemap-col"><h3>${ctx.t(g.label)}</h3><ul>` +
    g.items.map((i) => itemLink(ctx, i)).map((i) => `<li><a href="${i.href}"${i.ext ? ' target="_blank" rel="noopener"' : ''}>${i.label}</a></li>`).join('') +
    '</ul></div>');
  const listed = new Set(groups.flatMap((g) => (g.items || []).filter((i) => typeof i === 'string')));
  const rest = ctx.slugs.filter((s) => !listed.has(s) && s !== 'index');
  if (rest.length || extra.length) {
    cols.push(`<div class="sitemap-col"><h3>${ctx.lang === 'zh' ? '其他' : 'More'}</h3><ul>` +
      rest.map((s) => `<li><a href="${ctx.url(s)}">${ctx.navTitle(s)}</a></li>`).join('') + '</ul></div>');
  }
  return `<nav class="sitemap" aria-label="${ctx.L.sitemap}">${cols.join('')}</nav>`;
}

/** 內頁標題下的說明：整頁是示範內容，或只有按鈕位置。 */
function pageNotice(ctx) {
  const s = ctx.fm.status;
  if (s === 'demo') return `<p class="page-notice">${demoTag(ctx)} ${ctx.L.demo_page}</p>`;
  if (s === 'placeholder') return `<p class="page-notice"><span class="demo-tag soon">${ctx.L.placeholder_tag}</span></p>`;
  return '';
}

function footerContact(ctx) {
  const c = ctx.site.contact;
  const L = ctx.L;
  return `<dl class="footer-contact">
<dt>${L.address}</dt><dd><a href="${c.map_link}" target="_blank" rel="noopener">${c.address}</a></dd>
<dt>${L.phone}</dt><dd><a href="tel:+6492711608">${c.phone}</a></dd>
<dt>${L.email}</dt><dd><a href="mailto:${c.email}">${c.email}</a></dd>
<dt>${L.office_hours}</dt><dd>${c.office[ctx.lang]}</dd>
</dl>`;
}

function footerServices(ctx) {
  return '<ul class="footer-services">' + ctx.site.services.map((s) =>
    `<li><span>${ctx.t(s.lang)}</span> <strong>${s.time}</strong></li>`).join('') + '</ul>';
}

function socialLinks(ctx) {
  const c = ctx.site.contact;
  return `<ul class="social"><li><a href="${c.facebook.zh}" target="_blank" rel="noopener">${ctx.L.facebook_zh}</a></li>` +
    `<li><a href="${c.facebook.en}" target="_blank" rel="noopener">${ctx.L.facebook_en}</a></li></ul>`;
}

function scripts(ctx) {
  return `<script src="${ctx.asset('site.js')}" defer></script>`;
}

/** 簡單的線條圖示（自行繪製）。 */
const ICONS = {
  bulletin: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
  sermons: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>',
  give: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.600-7 10-7 10z"/>',
  downloads: '<path d="M12 4v11M7.500 11l4.500 4.500 4.500-4.500M5 20h14"/>',
  events: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4"/>',
  booking: '<path d="M4 20V9l8-5 8 5v11z"/><path d="M10 20v-6h4v6"/>',
  new: '<circle cx="10" cy="8" r="3.500"/><path d="M3.500 20c0-3.600 2.900-6 6.500-6s6.500 2.400 6.500 6M18 7v6M15 10h6"/>',
  contact: '<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>',
  services: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.500 2"/>',
  members: '<circle cx="12" cy="8" r="3.500"/><path d="M5 20c0-3.900 3.100-6 7-6s7 2.100 7 6"/>',
};
function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/** /a/、/b/、/c/ 的 index.html：直接轉到首頁，不設入口頁。 */
function redirectPage(theme) {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>奧克蘭聖道堂（示範網站）</title>
<script>location.replace((navigator.language || 'zh').toLowerCase().indexOf('zh') === 0 ? 'zh/index.html' : 'en/index.html');</script>
<meta http-equiv="refresh" content="0; url=zh/index.html">
</head>
<body>
<p><a href="zh/index.html">中文</a>｜<a href="en/index.html">English</a></p>
</body>
</html>
`;
}

/** docs\index.html：列出四個版本的目錄頁。 */
function directoryPage({ site, counts, themes }) {
  const cards = themes.map((m) => {
    const c = counts[m.id];
    const pageCount = m.id === 'current' ? `中文 ${c.zh} 頁、英文 ${c.en} 頁，另加入口頁` : `中文 ${c.zh} 頁、英文 ${c.en} 頁`;
    const links = m.id === 'current'
      ? `<a class="go" href="current/index.html">入口頁</a><a href="current/chi/welcome.html">中文</a><a href="current/en/welcome.html">English</a>`
      : `<a class="go" href="${m.id}/zh/index.html">中文首頁</a><a href="${m.id}/en/index.html">English</a>`;
    return `<article class="card">
<div class="swatches">${m.colors.map((col) => `<span style="background:${col}"></span>`).join('')}</div>
<p class="path">/${m.id}/</p>
<h2>${m.name.zh}<small>${m.name.en}</small></h2>
<p class="one">${m.one}</p>
<p class="count">${pageCount}</p>
<p class="links">${links}</p>
</article>`;
  }).join('\n');
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>聖道堂網站示範｜HWC Website Demo</title>
<style>
*{box-sizing:border-box}
body{margin:0;font-family:"Noto Sans TC","PingFang HK","Microsoft JhengHei",system-ui,sans-serif;background:#f4f2ee;color:#22262b;line-height:1.7}
.demo{background:#22262b;color:#fff;font-size:12px;padding:5px 16px;letter-spacing:.04em}
main{max-width:1080px;margin:0 auto;padding:48px 20px 64px}
h1{font-size:30px;line-height:1.3;margin:0 0 8px}
.lead{margin:0 0 36px;max-width:46em;color:#4a5058}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
.grid .card:first-child{grid-column:1/-1}
.card{background:#fff;border:1px solid #dedad2;border-radius:10px;padding:22px 24px 24px}
.swatches{display:flex;gap:6px;margin-bottom:14px}
.swatches span{width:34px;height:34px;border-radius:50%;border:1px solid rgba(0,0,0,.12)}
.path{margin:0;font-family:Consolas,Menlo,monospace;font-size:13px;color:#6b7078}
h2{margin:2px 0 6px;font-size:22px;line-height:1.35}
h2 small{font-size:14px;font-weight:400;color:#6b7078;margin-left:10px}
.one{margin:0 0 6px}
.count{margin:0 0 16px;font-size:14px;color:#6b7078}
.links{margin:0;display:flex;flex-wrap:wrap;gap:10px}
.links a{display:inline-block;padding:7px 16px;border-radius:6px;border:1px solid #22262b;color:#22262b;text-decoration:none;font-size:15px}
.links a.go{background:#22262b;color:#fff}
.links a:hover{opacity:.8}
.notes{margin-top:36px;font-size:14px;color:#4a5058}
.notes li{margin-bottom:4px}
@media(max-width:720px){.grid{grid-template-columns:1fr}h1{font-size:25px}main{padding-top:32px}}
</style>
</head>
<body>
<div class="demo">示範網站 Demo　並非聖道堂正式網站</div>
<main>
<h1>${site.church.zh}網站示範</h1>
<p class="lead">這裏有五個版本：現有網站的內容整理版，以及四款新設計。五個版本使用同一份內容，可以用每頁頁頂的「現有｜A｜B｜C｜D」在同一頁之間切換比較。</p>
<div class="grid">
${cards}
</div>
<ul class="notes">
<li>標明「示範內容」的文字並非教會的正式資料，只用來示範版面。</li>
<li>「會友登入」「活動日曆」「場地預約」暫時只放按鈕位置。</li>
<li>這個網站不會被搜尋引擎收錄。教會的正式網站是 <a href="https://holywordchurch.org.nz">holywordchurch.org.nz</a>。</li>
</ul>
</main>
</body>
</html>
`;
}

module.exports = {
  head, demoBar, navList, navToggle, langSwitch, serviceCards, serviceList, demoTag, newsList, contactBlock,
  mapBlock, downloadsBlock, sitemap, pageNotice, footerContact, footerServices, socialLinks, scripts, icon,
  redirectPage, directoryPage, itemLink,
};
