/**
 * 方向 B　莊重典雅（Rooted）
 * 文字主導，襯線字配深藍，突出信仰傳承及三語一家。
 * 首頁：頂部工具列 → 置中的堂名及選單 → 年度主題 → 三語崇拜並列 → 教會簡介摘要 → 講道及本週週報 → 表格及文件下載 → 頁尾。
 */
'use strict';
const H = require('../shared.js');

const meta = {
  id: 'b',
  name: { zh: '方向 B　莊重典雅', en: 'Rooted' },
  one: '文字主導，襯線字配深藍，突出信仰傳承及三語一家。',
  colors: ['#F7F3EA', '#14274E', '#B08D57', '#1F2430'],
};

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Noto+Sans+TC:wght@400;500&family=Noto+Serif+TC:wght@500;700;900&display=swap">';

const NAV = [
  { label: { zh: '關於我們', en: 'About' }, items: ['about', 'beliefs', 'team'] },
  { label: { zh: '崇拜與聚會', en: 'Worship' }, items: ['services', 'northshore', 'new', 'events'] },
  { label: { zh: '講道與週報', en: 'Sermons & Bulletin' }, items: ['sermons', 'bulletin', 'downloads', 'news', { ext: 'photos', label: { zh: '相片', en: 'Photos' } }] },
  { label: { zh: '事工', en: 'Ministries' }, items: ['groups', 'kids', 'mission'] },
  { label: { zh: '奉獻', en: 'Give' }, link: 'give' },
  { label: { zh: '聯絡', en: 'Contact' }, link: 'contact' },
];

// 三語並列的名稱：粵語堂、華語堂、英語堂
const HALL = {
  cantonese: { zh: '粵語堂', en: 'Cantonese' },
  mandarin: { zh: '華語堂', en: 'Mandarin' },
  english: { zh: '英語堂', en: 'English' },
  northshore: { zh: '北岸粵語崇拜', en: 'North Shore' },
};

function header(ctx) {
  const s = ctx.site.church;
  return `<div class="utility">
<div class="wrap utility-inner">
<span class="utility-address">${ctx.site.contact.address}</span>
<span class="utility-links">${H.langSwitch(ctx)}<a href="${ctx.url('members')}">${ctx.L.member_login}</a><a href="${ctx.url('new')}">${ctx.L.new_here}</a></span>
</div>
</div>
<header class="site-header">
<div class="wrap">
<a class="brand" href="${ctx.url('index')}">
<img src="${ctx.img('logo-dark.png')}" alt="" width="54" height="54">
<span class="brand-zh">${s.zh}</span>
<span class="brand-en">${s.en}</span>
</a>
${H.navToggle(ctx)}
<nav id="site-nav" aria-label="${ctx.L.menu}">${H.navList(ctx, NAV)}</nav>
</div>
</header>`;
}

function footer(ctx) {
  const s = ctx.site.church;
  return `<footer class="site-footer">
<div class="wrap">
<p class="footer-name"><span>${s.zh}</span><span class="footer-name-en">${s.en}</span></p>
<div class="footer-grid">
<div><h2>${ctx.L.contact}</h2>${H.footerContact(ctx)}</div>
<div><h2>${ctx.L.sunday_services}</h2>${H.footerServices(ctx)}</div>
<div><h2>${ctx.L.follow_us}</h2>${H.socialLinks(ctx)}</div>
</div>
${H.sitemap(ctx, NAV)}
</div>
</footer>`;
}

function layout(ctx, main) {
  return `${H.head(ctx, { fonts: FONTS })}
<body class="theme-b">
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

function home(ctx) {
  const { L, fm, lang, site } = ctx;
  const other = lang === 'zh' ? 'en' : 'zh';
  const svc = (id) => site.services.find((s) => s.id === id);
  const halls = ['cantonese', 'mandarin', 'english', 'northshore'].map((id) => {
    const s = svc(id);
    return `<a class="hall" href="${ctx.url(s.link)}"><h3>${HALL[id][lang]}</h3><p class="hall-time">${s.time}</p><p class="hall-place">${ctx.t(s.place)}</p></a>`;
  }).join('');
  const sermon = site.latest_sermon[lang];
  const dl = ctx.downloads.groups;
  return `<section class="hero">
<div class="wrap hero-inner">
<p class="hero-label">${L.year_theme} ${H.demoTag(ctx)}</p>
<h1>${site.theme[lang]}</h1>
<p class="hero-other" lang="${other === 'zh' ? 'zh-Hant' : 'en'}">${site.theme[other]}</p>
<p class="hero-church">${site.church[lang]}</p>
</div>
</section>

<section class="section section-halls">
<div class="wrap">
<h2 class="section-title">${L.sunday_services}</h2>
<div class="halls">${halls}</div>
<p class="halls-more"><a href="${ctx.url('services')}">${lang === 'zh' ? '全部聚會時間' : 'All meeting times'}</a>　·　<a href="${ctx.url('new')}">${L.first_time}</a></p>
</div>
</section>

<section class="section section-about">
<div class="wrap about-grid">
<div>
<h2 class="section-title">${fm.about_title}</h2>
<p class="about-text">${fm.about_text}</p>
<p class="text-links"><a href="${ctx.url('about')}">${ctx.navTitle('about')}</a><a href="${ctx.url('beliefs')}">${ctx.navTitle('beliefs')}</a><a href="${ctx.url('team')}">${ctx.navTitle('team')}</a></p>
</div>
<figure class="about-photo"><img src="${ctx.img('building-dedication.jpg')}" alt="${lang === 'zh' ? '聖道堂的會址' : 'The church building'}" loading="lazy"></figure>
</div>
</section>

<section class="section section-word">
<div class="wrap panels">
<div class="panel">
<h2>${L.latest_sermon}${sermon.demo ? ' ' + H.demoTag(ctx) : ''}</h2>
<p class="panel-title">${ctx.esc(sermon.title)}</p>
<p class="panel-meta">${ctx.esc(sermon.scripture)}<br>${ctx.esc(sermon.speaker)}・${ctx.formatDate(sermon.date, lang)}</p>
<p><a class="btn" href="${ctx.url('sermons')}">${L.watch_sermons}</a></p>
</div>
<div class="panel">
<h2>${L.this_week_bulletin}</h2>
<p class="panel-title">${lang === 'zh' ? '主日崇拜程序及教會消息' : 'Order of service and church news'}</p>
<p class="panel-meta">${L.every_sunday}</p>
<p><a class="btn" href="${ctx.url('bulletin')}">${L.read_bulletin}</a></p>
</div>
</div>
</section>

<section class="section section-forms">
<div class="wrap">
<h2 class="section-title">${L.forms_downloads}</h2>
<ul class="forms-list">
${Object.keys(dl).map((g) => `<li><a href="${ctx.url('downloads')}">${dl[g][lang]}</a></li>`).join('')}
<li><a href="${ctx.url('mission')}">${lang === 'zh' ? '宣教報告' : 'Mission Reports'}</a></li>
<li><a href="${ctx.url('give')}">${lang === 'zh' ? '奉獻方法' : 'How to Give'}</a></li>
<li><a href="${site.external.visitor_form}" target="_blank" rel="noopener">${L.visitor_form}</a></li>
<li><a href="${ctx.url('booking')}">${L.booking}</a></li>
</ul>
</div>
</section>`;
}

function page(ctx, html) {
  const group = NAV.find((g) => g.items && g.items.includes(ctx.slug));
  return `<section class="page-head">
<div class="wrap">
${group ? `<p class="page-section">${ctx.t(group.label)}</p>` : ''}
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

/** 內頁的四堂崇拜：用表格式的列，不用卡片。 */
function services(ctx) {
  return '<div class="service-rows">' + ctx.site.services.map((s) =>
    `<a class="service-row" href="${ctx.url(s.link)}"><span class="service-lang">${ctx.t(s.lang)}</span><span class="service-time">${s.time}</span><span class="service-place">${ctx.t(s.place)}</span></a>`).join('') + '</div>';
}

module.exports = { meta, layout, home, page, services };
