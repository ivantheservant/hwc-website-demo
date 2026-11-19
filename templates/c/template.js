/**
 * 方向 C　教會生活入口（Church Hub）
 * 功能主導，卡片式，為會友每週使用而設。
 * 首頁：頂部列 → 選單 → 細橫額 → 「本主日」四張崇拜卡片 → 快速連結 → 最新消息及本週資訊 → 頁尾。
 * 內頁：左邊是同一個欄目的頁面清單，右邊是內容。
 */
'use strict';
const H = require('../shared.js');

const meta = {
  id: 'c',
  name: { zh: '方向 C　教會生活入口', en: 'Church Hub' },
  one: '功能主導，卡片式，為會友每週使用而設。',
  colors: ['#FFFFFF', '#0F766E', '#F59E0B', '#F3F4F6'],
};

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&family=Noto+Sans+TC:wght@400;500;700;900&display=swap">';

const NAV = [
  { label: { zh: '本週', en: 'This Week' }, items: ['bulletin', 'sermons', 'news', 'events'] },
  { label: { zh: '聚會', en: 'Services' }, items: ['services', 'northshore'] },
  { label: { zh: '事工', en: 'Ministries' }, items: ['groups', 'kids', 'mission'] },
  { label: { zh: '資源', en: 'Resources' }, items: ['downloads', 'booking', { ext: 'photos', label: { zh: '相片', en: 'Photos' } }] },
  { label: { zh: '關於', en: 'About' }, items: ['about', 'beliefs', 'team', 'contact'] },
  { label: { zh: '新朋友', en: "I'm New" }, link: 'new', button: true, cls: 'nav-btn-outline' },
  { label: { zh: '奉獻', en: 'Give' }, link: 'give', button: true },
];

// 首頁的快速連結
const QUICK = [
  { slug: 'bulletin', icon: 'bulletin', label: { zh: '週報', en: 'Bulletin' } },
  { slug: 'sermons', icon: 'sermons', label: { zh: '講道', en: 'Sermons' } },
  { slug: 'give', icon: 'give', label: { zh: '奉獻', en: 'Give' } },
  { slug: 'downloads', icon: 'downloads', label: { zh: '表格及文件', en: 'Forms & Files' } },
  { slug: 'events', icon: 'events', label: { zh: '活動日曆', en: 'Calendar' }, soon: true },
  { slug: 'booking', icon: 'booking', label: { zh: '場地預約', en: 'Venue Booking' }, soon: true },
  { slug: 'new', icon: 'new', label: { zh: '新朋友', en: "I'm New" } },
  { slug: 'contact', icon: 'contact', label: { zh: '聯絡', en: 'Contact' } },
];

function header(ctx) {
  const s = ctx.site.church;
  const c = ctx.site.contact;
  return `<div class="topbar">
<div class="wrap topbar-inner">
<span class="topbar-info">${c.address}　${c.phone}</span>
<span class="topbar-tools">${H.langSwitch(ctx)}<a class="login" href="${ctx.url('members')}">${H.icon('members')}${ctx.L.member_login}</a></span>
</div>
</div>
<header class="site-header">
<div class="wrap header-inner">
<a class="brand" href="${ctx.url('index')}"><span class="brand-mark"><img src="${ctx.img('logo-white.png')}" alt="" width="30" height="30"></span><span><strong>${ctx.lang === 'zh' ? s.zh_short : s.en_short}</strong><small>${ctx.lang === 'zh' ? s.en_short : s.zh_short}</small></span></a>
${H.navToggle(ctx)}
<nav id="site-nav" aria-label="${ctx.L.menu}">${H.navList(ctx, NAV)}</nav>
</div>
</header>`;
}

function footer(ctx) {
  const s = ctx.site.church;
  return `<footer class="site-footer">
<div class="wrap footer-grid">
<div><h2>${ctx.lang === 'zh' ? s.zh : s.en}</h2>${H.footerContact(ctx)}</div>
<div><h2>${ctx.L.sunday_services}</h2>${H.footerServices(ctx)}</div>
<div><h2>${ctx.L.follow_us}</h2>${H.socialLinks(ctx)}</div>
</div>
<div class="wrap">${H.sitemap(ctx, NAV)}</div>
</footer>`;
}

function layout(ctx, main) {
  return `${H.head(ctx, { fonts: FONTS })}
<body class="theme-c">
${H.demoBar(ctx)}
${header(ctx)}
<main>
${main}
</main>
${footer(ctx)}
${H.scripts(ctx)}
</body>
</html>
`;
}

function serviceCards(ctx) {
  return '<div class="service-cards">' + ctx.site.services.map((s) =>
    `<a class="service-card" href="${ctx.url(s.link)}"><span class="service-lang">${ctx.t(s.lang)}</span>` +
    `<span class="service-time">${s.time}</span><span class="service-place">${ctx.t(s.place)}</span></a>`).join('') + '</div>';
}

function home(ctx) {
  const { L, lang, site } = ctx;
  const sermon = site.latest_sermon[lang];
  const tiles = QUICK.map((q) =>
    `<a class="tile" href="${ctx.url(q.slug)}">${H.icon(q.icon)}<span>${ctx.t(q.label)}</span>${q.soon ? `<em>${L.placeholder_tag}</em>` : ''}</a>`).join('');
  const news = site.news.map((n) =>
    `<li><time datetime="${n.date}">${ctx.formatDate(n.date, lang)}</time><div><strong>${ctx.esc(n[lang].title)}</strong><p>${ctx.esc(n[lang].text)}</p></div></li>`).join('');
  return `<section class="banner">
<div class="wrap banner-inner">
<h1>${site.church[lang]}</h1>
<p>${ctx.fm.tagline} ${H.demoTag(ctx)}</p>
</div>
</section>

<section class="block">
<div class="wrap">
<div class="block-head"><h2>${L.this_sunday}</h2><a href="${ctx.url('services')}">${L.service_times}</a></div>
${serviceCards(ctx)}
</div>
</section>

<section class="block">
<div class="wrap">
<div class="block-head"><h2>${L.quick_links}</h2></div>
<div class="tiles">${tiles}</div>
</div>
</section>

<section class="block">
<div class="wrap dash">
<div class="dash-main">
<div class="block-head"><h2>${L.latest_news} ${H.demoTag(ctx)}</h2><a href="${ctx.url('news')}">${L.more_news}</a></div>
<ul class="feed">${news}</ul>
</div>
<aside class="dash-side">
<div class="info-card">
<h3>${L.latest_sermon}${sermon.demo ? ' ' + H.demoTag(ctx) : ''}</h3>
<p class="info-title">${ctx.esc(sermon.title)}</p>
<p class="info-meta">${ctx.esc(sermon.scripture)}・${ctx.formatDate(sermon.date, lang)}</p>
<a class="btn btn-small" href="${ctx.url('sermons')}">${L.watch_sermons}</a>
</div>
<div class="info-card">
<h3>${L.this_week_bulletin}</h3>
<p class="info-meta">${lang === 'zh' ? '主日崇拜程序及教會消息' : 'Order of service and church news'}</p>
<a class="btn btn-small" href="${ctx.url('bulletin')}">${L.read_bulletin}</a>
</div>
</aside>
</div>
</section>`;
}

function page(ctx, html) {
  const group = NAV.find((g) => g.items && g.items.includes(ctx.slug));
  const side = group
    ? `<p class="side-title">${ctx.t(group.label)}</p><ul>` + group.items.map((s) => H.itemLink(ctx, s)).map((i) =>
      `<li><a href="${i.href}"${i.ext ? ' target="_blank" rel="noopener"' : ''}${i.on ? ' aria-current="page"' : ''}>${i.label}</a></li>`).join('') + '</ul>'
    : `<p class="side-title">${ctx.L.quick_links}</p><ul>` + QUICK.map((q) =>
      `<li><a href="${ctx.url(q.slug)}"${q.slug === ctx.slug ? ' aria-current="page"' : ''}>${ctx.t(q.label)}</a></li>`).join('') + '</ul>';
  return `<div class="wrap page-grid">
<aside class="side" aria-label="${group ? ctx.t(group.label) : ctx.L.quick_links}">${side}</aside>
<article class="content content-${ctx.slug}">
<p class="crumb"><a href="${ctx.url('index')}">${ctx.L.home}</a>${group ? ` / ${ctx.t(group.label)}` : ''}</p>
<h1>${ctx.fm.title}</h1>
${H.pageNotice(ctx)}
${html}
</article>
</div>`;
}

module.exports = { meta, layout, home, page, services: serviceCards };
