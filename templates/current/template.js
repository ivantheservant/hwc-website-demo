/**
 * /current/：現有網站的內容及結構，樸素版面，用來與三款新設計對照。
 * 結構照現有網站：入口頁只用來選擇語言；每一頁同時顯示中文及英文兩套選單，各 13 項。
 */
'use strict';
const H = require('../shared.js');

const meta = {
  id: 'current',
  name: { zh: '現有網站', en: 'Current site' },
  one: '現有網站的內容及結構，樸素版面，作備份對照。',
  colors: ['#ffffff', '#333333', '#9a9a9a'],
};

// 現有網站的選單次序；ext 是連到 Facebook 的項目
const MENU = {
  zh: ['index', 'about', 'services', 'team', 'give', 'beliefs', 'northshore', 'bulletin', 'mission', 'downloads',
    { ext: 'sermons', label: '崇拜重播' }, { ext: 'photos', label: '相片' }, 'contact'],
  en: ['index', 'about', 'services', 'team', 'give', 'beliefs', 'jobs', 'bulletin', 'mission', 'downloads',
    { ext: 'sermons', label: 'SERMONS' }, { ext: 'photos', label: 'PHOTOS' }, 'contact'],
};

function menu(ctx, lang) {
  const pages = ctx.pagesIn(lang);
  return `<ul class="menu" lang="${lang === 'zh' ? 'zh-Hant' : 'en'}">` + MENU[lang].map((item) => {
    if (typeof item === 'string') {
      const on = lang === ctx.lang && item === ctx.slug;
      return `<li><a href="${ctx.urlIn(lang, item)}"${on ? ' aria-current="page"' : ''}>${pages[item].fm.current_title || pages[item].fm.title}</a></li>`;
    }
    return `<li><a href="${ctx.site.external[item.ext][lang]}" target="_blank" rel="noopener">${item.label}</a></li>`;
  }).join('') + '</ul>';
}

function header(ctx) {
  return `<header class="site-header">
<a class="site-title" href="${ctx.root}current/index.html">Holy Word Church | 奧克蘭聖道堂</a>
<p class="lang-links"><a href="${ctx.urlIn('zh', 'index')}">中文</a> <a href="${ctx.urlIn('en', 'index')}">ENGLISH</a></p>
<nav aria-label="選單 Menu">${menu(ctx, 'zh')}${menu(ctx, 'en')}</nav>
</header>`;
}

function footer(ctx) {
  const c = ctx.site.contact;
  return `<footer class="site-footer">
<p><a href="${c.facebook.zh}" target="_blank" rel="noopener">Facebook (中文)</a> ｜ <a href="${c.facebook.en}" target="_blank" rel="noopener">Facebook (English)</a> ｜ <a href="mailto:${c.email}">Email</a></p>
<p><a href="#top">Back to Top</a></p>
</footer>`;
}

function layout(ctx, main) {
  return `${H.head(ctx)}
<body id="top">
${H.demoBar(ctx)}
${header(ctx)}
<main>
${main}
</main>
${footer(ctx)}
</body>
</html>
`;
}

function page(ctx, html) {
  const title = ctx.slug === 'index' ? '' : `<h1>${ctx.fm.current_title || ctx.fm.title}</h1>\n`;
  return title + html;
}

/** 入口頁：照現有網站，只有堂名及兩個語言連結。 */
function entry(ctx) {
  return `${H.head(ctx)}
<body id="top" class="entry">
${H.demoBar(ctx)}
<main>
<div class="imgs imgs-2"><figure><img src="${ctx.img('building-dedication-warm.jpg')}" alt=""></figure><figure><img src="${ctx.img('auckland-skyline.jpg')}" alt=""></figure></div>
<div class="entry-marks"><img src="${ctx.img('theme-mark.png')}" alt=""><img src="${ctx.img('theme-words.png')}" alt="愛裏同行，活現基督 Together in love, Living out Christ"></div>
<p class="entry-name">ECF HOLY WORD CHURCH OF AUCKLAND</p>
<p class="entry-name">中國佈道會奧克蘭聖道堂</p>
<ul class="entry-links"><li><a href="en/welcome.html">ENGLISH</a></li><li><a href="chi/welcome.html">中文</a></li></ul>
</main>
</body>
</html>
`;
}

module.exports = { meta, layout, page, entry, services: (ctx) => H.serviceList(ctx) };
