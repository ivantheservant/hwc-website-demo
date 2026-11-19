/**
 * 方向 A　歡迎之家（Welcome Home）
 * 相片主導，溫暖親切，先照顧第一次來的人。
 * 首頁：公告條 → 選單 → 全闊相片、歡迎語及三個按鈕 → 四堂崇拜卡片 → 「第一次來？」 → 最新消息 → 頁尾。
 */
'use strict';
const H = require('../shared.js');

const meta = {
  id: 'a',
  name: { zh: '方向 A　歡迎之家', en: 'Welcome Home' },
  one: '相片主導，溫暖親切，先照顧第一次來的人。',
  colors: ['#FBF7F2', '#C8553D', '#2F3E46', '#E9C46A'],
};

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Poppins:wght@500;600;700&display=swap">';

const NAV = [
  { label: { zh: '新朋友', en: "I'm New" }, items: ['new', { ext: 'visitor_form', label: { zh: '新朋友表格', en: 'Visitor Form' } }] },
  { label: { zh: '聚會', en: 'Services' }, items: ['services', 'northshore', 'events'] },
  { label: { zh: '關於我們', en: 'About' }, items: ['about', 'beliefs', 'team', 'contact'] },
  { label: { zh: '事工', en: 'Ministries' }, items: ['groups', 'kids', 'mission'] },
  { label: { zh: '資源', en: 'Resources' }, items: ['sermons', 'bulletin', 'downloads', 'news', { ext: 'photos', label: { zh: '相片', en: 'Photos' } }] },
  { label: { zh: '奉獻', en: 'Give' }, link: 'give', button: true },
];

function announcement(ctx) {
  const a = ctx.site.announcement;
  return `<div class="announce"><div class="wrap">${a.demo ? H.demoTag(ctx) : ''}<span>${ctx.esc(ctx.t(a))}</span><a href="${ctx.url('news')}">${ctx.L.details}</a></div></div>`;
}

function header(ctx) {
  const s = ctx.site.church;
  return `<header class="site-header">
<div class="wrap header-inner">
<a class="brand" href="${ctx.url('index')}"><img src="${ctx.img('logo-dark.png')}" alt="" width="44" height="44"><span><strong>${ctx.lang === 'zh' ? s.zh_short : s.en_short}</strong><small>${ctx.lang === 'zh' ? s.en_short : s.zh_short}</small></span></a>
${H.navToggle(ctx)}
<div class="header-nav" id="site-nav">
<div class="header-tools">${H.langSwitch(ctx)}<a class="login" href="${ctx.url('members')}">${ctx.L.member_login}</a></div>
<nav aria-label="${ctx.L.menu}">${H.navList(ctx, NAV)}</nav>
</div>
</div>
</header>`;
}

function footer(ctx) {
  const s = ctx.site.church;
  return `<footer class="site-footer">
<div class="wrap footer-grid">
<div class="footer-about">
<p class="footer-name"><img src="${ctx.img('logo-white.png')}" alt="" width="40" height="40">${ctx.lang === 'zh' ? s.zh : s.en}</p>
${H.footerContact(ctx)}
</div>
<div>
<h2>${ctx.L.sunday_services}</h2>
${H.footerServices(ctx)}
<h2>${ctx.L.follow_us}</h2>
${H.socialLinks(ctx)}
</div>
<div class="footer-map"><div class="map"><iframe src="${ctx.site.contact.map_embed}" title="${ctx.L.map}" loading="lazy"></iframe></div></div>
</div>
<div class="wrap">${H.sitemap(ctx, NAV)}</div>
</footer>`;
}

function layout(ctx, main) {
  return `${H.head(ctx, { fonts: FONTS })}
<body class="theme-a">
${H.demoBar(ctx)}
${announcement(ctx)}
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

function home(ctx) {
  const { L, fm } = ctx;
  return `<section class="hero" style="background-image:url('${ctx.img('church-building.jpg')}')">
<div class="wrap hero-inner">
<h1>${fm.hero_title}</h1>
<p class="hero-btns"><a class="btn" href="${ctx.url('new')}">${L.first_time}</a><a class="btn btn-light" href="${ctx.url('services')}">${L.service_times}</a><a class="btn btn-ghost" href="${ctx.url('sermons')}">${L.watch_sermons}</a></p>
</div>
</section>

<section class="section section-services">
<div class="wrap">
<h2 class="section-title">${L.sunday_services}</h2>
<p class="section-lead">${L.every_sunday}・${ctx.site.contact.address}</p>
${H.serviceCards(ctx)}
</div>
</section>

<section class="section section-welcome">
<div class="wrap split">
<figure class="split-photo"><img src="${ctx.img('church-interior.jpg')}" alt="${ctx.lang === 'zh' ? '聖道堂的禮堂' : 'The church sanctuary'}" loading="lazy"></figure>
<div class="split-text">
${H.demoTag(ctx)}
<h2 class="section-title">${fm.welcome_title}</h2>
<p>${fm.welcome_text}</p>
<p class="btns"><a class="btn" href="${ctx.url('new')}">${L.more}</a><a class="btn btn-outline" href="${ctx.site.external.visitor_form}" target="_blank" rel="noopener">${L.visitor_form}</a></p>
</div>
</div>
</section>

<section class="section section-news">
<div class="wrap">
<h2 class="section-title">${L.latest_news} ${H.demoTag(ctx)}</h2>
${H.newsList(ctx, 3)}
<p class="section-more"><a class="btn btn-outline" href="${ctx.url('news')}">${L.more_news}</a></p>
</div>
</section>`;
}

function page(ctx, html) {
  const group = NAV.find((g) => g.items && g.items.includes(ctx.slug));
  const crumb = `<a href="${ctx.url('index')}">${ctx.L.home}</a>` + (group ? ` <span aria-hidden="true">›</span> ${ctx.t(group.label)}` : '');
  return `<section class="page-head">
<div class="wrap">
<p class="crumb">${crumb}</p>
<h1>${ctx.fm.title}</h1>
${H.pageNotice(ctx)}
</div>
</section>
<div class="wrap page-body">
<article class="content content-${ctx.slug}">
${html}
</article>
</div>`;
}

module.exports = { meta, layout, home, page };
