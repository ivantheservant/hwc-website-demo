/**
 * 方向 D　當代敬拜（Contemporary）
 * 深色相片配超大粗體字，全螢幕選單，風格當代，吸引年輕一代及新朋友。
 * 首頁：公告條 → 深色頁首（標誌及〔選單〕開關）→ 全闊深色相片及超大標語 → 主日崇拜四張直身相片卡
 *       → 相片橫額「講道重溫」→ 我們的教會 → 相片橫額「活動及教會日曆」→ 最新消息 → 相片橫額「參與教會」→ 頁尾。
 * 右下角固定一個圓形「下一步」按鈕。
 * 全部是 Squarespace 及 Wix 內置的做法：公告條、全螢幕選單、圖片卡、全闊圖片區塊、固定按鈕。
 */
'use strict';
const H = require('../shared.js');

const meta = {
  id: 'd',
  name: { zh: '方向 D　當代敬拜', en: 'Contemporary' },
  one: '深色相片配超大粗體字，全螢幕選單，風格當代，吸引年輕一代及新朋友。',
  colors: ['#F6F2EC', '#1F1626', '#5B2E72', '#CDB4EE'],
};

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;800;900&family=Noto+Sans+TC:wght@400;500;700;900&display=swap">';

// 在 <head> 最先執行：有 JavaScript 時才把選單收起來（沒有 JavaScript 時選單照常顯示）
const HEAD_JS = '<script>document.documentElement.classList.add("js")</script>';

// 全螢幕選單：頁面齊全，每種語言只顯示自己的選單
const MENU = [
  { label: { zh: '新朋友', en: "I'm New" }, items: ['new', { ext: 'visitor_form', label: { zh: '新朋友表格', en: 'Visitor Form' } }] },
  { label: { zh: '聚會', en: 'Gatherings' }, items: ['services', 'northshore', 'groups', 'kids', 'events'] },
  { label: { zh: '關於我們', en: 'About' }, items: ['about', 'beliefs', 'team', 'mission'] },
  { label: { zh: '資源', en: 'Resources' }, items: ['sermons', 'bulletin', 'downloads', 'news', 'booking', { ext: 'photos', label: { zh: '相片', en: 'Photos' } }] },
  { label: { zh: '奉獻', en: 'Give' }, items: ['give'] },
  { label: { zh: '聯絡', en: 'Contact' }, items: ['contact'] },
];

// 四堂崇拜在這款的名稱及相片（只用不含可以認出兒童的相片）
const SERVICE = {
  english: { zh: '英語崇拜', en: 'English Service', photo: 'english-service.jpg' },
  cantonese: { zh: '粵語崇拜', en: 'Cantonese Service', photo: 'anniversary-20.jpg' },
  mandarin: { zh: '華語崇拜', en: 'Mandarin Service', photo: 'mandarin-service.jpg' },
  northshore: { zh: '北岸粵語崇拜', en: 'North Shore Cantonese', photo: 'auckland-skyline.jpg' },
};

// 內頁頁首的深色相片
const PAGE_PHOTO = {
  new: 'church-building.jpg', services: 'english-service.jpg', northshore: 'auckland-skyline.jpg', groups: 'vanuatu-2.jpg',
  kids: 'church-interior.jpg', events: 'anniversary-10.jpg', about: 'building-dedication-warm.jpg', beliefs: 'church-interior.jpg',
  team: 'anniversary-20.jpg', mission: 'stm-1998.jpg', sermons: 'taking-notes.jpg', bulletin: 'taking-notes.jpg',
  downloads: 'church-building.jpg', news: 'anniversary-10.jpg', booking: 'church-interior.jpg', give: 'mandarin-service.jpg',
  contact: 'church-building.jpg', members: 'church-building.jpg',
};

// 這款自己的介面文字
const T = {
  zh: {
    slogan: '一同回家，一同成長',
    hero_sub: '中國佈道會奧克蘭聖道堂　粵語・華語・英語',
    services_lead: '每個星期日有四堂崇拜，選一堂你聽得最自在的語言。',
    sermons_title: '講道重溫', sermons_lead: '錯過了主日崇拜？可以在網上重溫講道，或者閱讀本週週報。',
    events_title: '活動及教會日曆', events_lead: '教會日曆及場地預約即將推出，屆時可以在這裏查看各項聚會及活動。',
    join_title: '參與教會', join_lead: '第一次來，或者想加入團契及小組？我們很樂意認識你。',
    quick: '下一步', close: '關閉', close_announce: '關閉公告', menu_title: '網站選單', skip: '跳到內容',
  },
  en: {
    slogan: 'Come home. Grow together.',
    hero_sub: 'ECF Holy Word Church of Auckland · Cantonese · Mandarin · English',
    services_lead: 'Four services every Sunday. Choose the language you are most at home in.',
    sermons_title: 'Sermons', sermons_lead: 'Missed a Sunday? Catch up on recent sermons or read this week\'s bulletin.',
    events_title: 'Events & Calendar', events_lead: 'The church calendar and venue booking are coming soon. You will be able to see every gathering here.',
    join_title: 'Get Involved', join_lead: 'New here, or looking for a fellowship group? We would love to meet you.',
    quick: 'Next step', close: 'Close', close_announce: 'Close announcement', menu_title: 'Site menu', skip: 'Skip to content',
  },
};

const pill = (href, label, cls = '') => `<a class="pill${cls ? ' ' + cls : ''}" href="${href}">${label}</a>`;
const bg = (ctx, photo) => `style="background-image:url('${ctx.img(photo)}')"`;

function brand(ctx) {
  const s = ctx.site.church;
  return `<a class="brand" href="${ctx.url('index')}"><img src="${ctx.img('logo-white.png')}" alt="" width="46" height="46">` +
    `<span><strong>${ctx.lang === 'zh' ? s.zh_short : s.en_short}</strong><small>${ctx.lang === 'zh' ? s.en_short : s.zh_short}</small></span></a>`;
}

function announcement(ctx) {
  const a = ctx.site.announcement;
  return `<div class="announce" id="announce" role="region" aria-label="${ctx.lang === 'zh' ? '公告' : 'Announcement'}">
<div class="wrap announce-inner">
<p>${a.demo ? H.demoTag(ctx) + ' ' : ''}${ctx.esc(ctx.t(a))}</p>
<a class="announce-btn" href="${ctx.url('news')}">${ctx.L.details}</a>
<button class="announce-close" type="button" aria-label="${T[ctx.lang].close_announce}">✕</button>
</div>
</div>`;
}

function menuPanel(ctx) {
  const t = T[ctx.lang];
  const c = ctx.site.contact;
  const groups = MENU.map((g) =>
    `<section class="menu-group"><h3>${ctx.t(g.label)}</h3><ul>` +
    g.items.map((i) => H.itemLink(ctx, i)).map((i) =>
      `<li><a href="${i.href}"${i.ext ? ' target="_blank" rel="noopener"' : ''}${i.on ? ' aria-current="page"' : ''}>${i.label}</a></li>`).join('') +
    '</ul></section>').join('');
  return `<div class="menu-panel" id="menu-panel" aria-label="${t.menu_title}">
<div class="wrap menu-top">${brand(ctx)}<button class="menu-close" type="button">${t.close}<span class="x" aria-hidden="true">✕</span></button></div>
<div class="wrap menu-body">
<nav class="menu-groups" aria-label="${t.menu_title}">${groups}</nav>
<div class="menu-side">
<p class="menu-lang">${H.langSwitch(ctx)}</p>
<p class="menu-pills">${pill(ctx.url('members'), ctx.L.member_login)}${pill(ctx.url('give'), ctx.L.give, 'pill-solid')}</p>
<p class="menu-contact">${c.address}<br><a href="tel:+6492711608">${c.phone}</a><br><a href="mailto:${c.email}">${c.email}</a></p>
</div>
</div>
</div>`;
}

function header(ctx) {
  return `<header class="site-header">
<div class="wrap header-inner">
${brand(ctx)}
<div class="header-tools">
<span class="header-lang">${H.langSwitch(ctx)}</span>
<button class="menu-toggle" type="button" aria-expanded="false" aria-controls="menu-panel"><span>${ctx.L.menu}</span><span class="menu-icon" aria-hidden="true"></span></button>
</div>
</div>
</header>
${menuPanel(ctx)}`;
}

function quick(ctx) {
  const t = T[ctx.lang];
  const links = [['new', ctx.lang === 'zh' ? '第一次來' : 'First time here'], ['services', ctx.L.service_times], ['give', ctx.L.give], ['members', ctx.L.member_login]];
  return `<div class="quick">
<ul class="quick-menu" id="quick-menu">${links.map(([s, label]) => `<li><a href="${ctx.url(s)}">${label}</a></li>`).join('')}</ul>
<button class="quick-btn" type="button" aria-expanded="false" aria-controls="quick-menu">${t.quick}</button>
</div>`;
}

function footer(ctx) {
  const s = ctx.site.church;
  const zh = ctx.lang === 'zh';
  return `<footer class="site-footer">
<div class="wrap footer-grid">
<div class="footer-brand">
<img src="${ctx.img('logo-white.png')}" alt="" width="132" height="132">
<p class="footer-name">${zh ? s.zh : s.en}<span>${zh ? s.en : s.zh}</span></p>
</div>
<div class="footer-cols">
<div><h2>${ctx.L.contact}</h2>${H.footerContact(ctx)}</div>
<div><h2>${ctx.L.sunday_services}</h2>${H.footerServices(ctx)}</div>
<div><h2>${ctx.L.follow_us}</h2>${H.socialLinks(ctx)}
<h2 class="footer-more">${zh ? '常用連結' : 'Quick Links'}</h2>
<ul class="footer-links"><li><a href="${ctx.url('new')}">${ctx.navTitle('new')}</a></li><li><a href="${ctx.url('services')}">${ctx.L.service_times}</a></li><li><a href="${ctx.url('sermons')}">${ctx.navTitle('sermons')}</a></li><li><a href="${ctx.url('give')}">${ctx.navTitle('give')}</a></li></ul>
</div>
</div>
</div>
<div class="wrap footer-bottom"><p>${ctx.L.demo_bar}　${ctx.L.demo_bar_note}</p><p><a href="#top">${ctx.L.back_top} ↑</a></p></div>
</footer>`;
}

function layout(ctx, main) {
  return `${H.head(ctx, { fonts: FONTS, headExtra: HEAD_JS })}
<body class="theme-d" id="top">
<a class="skip" href="#main">${T[ctx.lang].skip}</a>
${H.demoBar(ctx)}
${announcement(ctx)}
${header(ctx)}
<main id="main">
${main}
</main>
${footer(ctx)}
${quick(ctx)}
<script src="${ctx.asset('d.js')}" defer></script>
</body>
</html>
`;
}

function banner(ctx, { photo, title, lead, buttons, soon }) {
  return `<section class="banner" ${bg(ctx, photo)}>
<div class="wrap banner-inner">
<h2 class="display">${title}</h2>
<p>${lead}${soon ? ` <span class="demo-tag soon">${ctx.L.placeholder_tag}</span>` : ''}</p>
<p class="pills">${buttons.join('')}</p>
</div>
</section>`;
}

function home(ctx) {
  const { L, lang, site, fm } = ctx;
  const t = T[lang];
  const cards = site.services.map((s) => {
    const v = SERVICE[s.id];
    return `<a class="card" href="${ctx.url('services')}#service-${s.id}" ${bg(ctx, v.photo)}>
<span class="card-top"><span class="card-name">${v[lang]}</span><span class="card-time">${L.every_sunday} ${s.time}</span></span>
<span class="card-btn">${L.details}</span>
</a>`;
  }).join('');
  const news = site.news.map((n) =>
    `<article class="news-card"><time datetime="${n.date}">${ctx.formatDate(n.date, lang)}</time><h3>${ctx.esc(n[lang].title)}</h3><p>${ctx.esc(n[lang].text)}</p></article>`).join('');
  return `<section class="hero" ${bg(ctx, 'building-dedication.jpg')}>
<div class="wrap hero-inner">
<p class="hero-tag">${H.demoTag(ctx)}</p>
<h1 class="display">${t.slogan}</h1>
<p class="hero-sub">${t.hero_sub}</p>
<p class="pills">${pill(ctx.url('services'), L.service_times)}${pill(ctx.url('new'), L.first_time)}</p>
</div>
</section>

<section class="section" id="gather">
<div class="wrap">
<div class="section-head"><h2 class="display">${L.sunday_services}</h2><p>${t.services_lead}</p></div>
<div class="cards">${cards}</div>
</div>
</section>

${banner(ctx, { photo: 'taking-notes.jpg', title: t.sermons_title, lead: t.sermons_lead,
    buttons: [pill(ctx.url('sermons'), L.watch_sermons), pill(ctx.url('bulletin'), L.this_week_bulletin)] })}

<section class="section">
<div class="wrap">
<div class="section-head"><h2 class="display">${fm.about_title}</h2><p class="about-text">${fm.about_text}</p></div>
<p class="pills pills-dark">${pill(ctx.url('about'), ctx.navTitle('about'))}${pill(ctx.url('beliefs'), ctx.navTitle('beliefs'))}${pill(ctx.url('team'), ctx.navTitle('team'))}</p>
</div>
</section>

${banner(ctx, { photo: 'anniversary-10.jpg', title: t.events_title, lead: t.events_lead, soon: true,
    buttons: [pill(ctx.url('events'), L.events), pill(ctx.url('booking'), L.booking)] })}

<section class="section">
<div class="wrap">
<div class="section-head"><h2 class="display">${L.latest_news}</h2><p>${H.demoTag(ctx)}</p></div>
<div class="news-cards">${news}</div>
<p class="pills pills-dark">${pill(ctx.url('news'), L.more_news)}</p>
</div>
</section>

${banner(ctx, { photo: 'vanuatu-2.jpg', title: t.join_title, lead: t.join_lead,
    buttons: [pill(ctx.url('new'), L.first_time), pill(ctx.url('groups'), ctx.navTitle('groups'))] })}`;
}

function page(ctx, html) {
  const group = MENU.find((g) => g.items.includes(ctx.slug));
  return `<section class="page-hero" ${bg(ctx, PAGE_PHOTO[ctx.slug] || 'church-building.jpg')}>
<div class="wrap page-hero-inner">
${group ? `<p class="kicker">${ctx.t(group.label)}</p>` : ''}
<h1 class="display">${ctx.fm.title}</h1>
${H.pageNotice(ctx)}
</div>
</section>
<div class="wrap page-body">
<article class="content content-${ctx.slug}">
${html}
</article>
</div>`;
}

/** 內頁的四堂崇拜：每堂一張相片卡，帶 id，讓首頁的卡片可以連到對應位置。 */
function services(ctx) {
  return '<div class="svc-list">' + ctx.site.services.map((s) => {
    const v = SERVICE[s.id];
    const more = s.link === 'northshore' ? `<a class="svc-link" href="${ctx.url('northshore')}">${ctx.navTitle('northshore')} →</a>` : '';
    return `<section class="svc" id="service-${s.id}"><div class="svc-photo" ${bg(ctx, v.photo)}></div>` +
      `<div class="svc-body"><h3>${v[ctx.lang]}</h3><p class="svc-time">${s.time}</p><p class="svc-meta">${ctx.L.every_sunday}・${ctx.t(s.place)}</p>${more}</div></section>`;
  }).join('') + '</div>';
}

module.exports = { meta, layout, home, page, services };
