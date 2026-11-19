#!/usr/bin/env node
/**
 * 聖道堂示範網站的建置腳本。
 *
 * 用法：node build.js
 *
 * 做的事：讀取 content\ 內唯一一份內容（中文及英文，一頁一個 Markdown 檔，另加 site.json 及
 * downloads.json 兩份共用資料），套入 templates\ 內的四套範本，輸出到 docs\：
 *   docs\current\  現有網站的內容及結構（樸素版面，作備份對照）
 *   docs\a\        方向 A　歡迎之家
 *   docs\b\        方向 B　莊重典雅
 *   docs\c\        方向 C　教會生活入口
 *   docs\d\        方向 D　當代敬拜
 *   docs\index.html 目錄頁
 * 不需要安裝任何套件，只需要 Node 18 或以上。
 *
 * 內容檔的寫法見 content\README.md。
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'docs');
const LANGS = ['zh', 'en'];
const THEMES = ['current', 'a', 'b', 'c', 'd'];
// 頁面在網站地圖及檢查報告內的次序
const PAGE_ORDER = ['index', 'new', 'services', 'groups', 'kids', 'northshore',
  'about', 'beliefs', 'team', 'mission', 'sermons', 'bulletin', 'downloads', 'news', 'events',
  'booking', 'give', 'contact', 'members', 'jobs'];

const readJson = (f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8'));
const site = readJson('site.json');
const downloads = readJson('downloads.json');
const warnings = [];

/* ---------- 讀取內容 ---------- */

/** 拆開檔案開頭的資料區（--- 之間，每行「名稱: 內容」）及正文。 */
function parseFile(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { fm, body: m[2] };
}

function loadLang(lang) {
  const dir = path.join(SRC, lang);
  const pages = {};
  const partials = {};
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.md'))) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    if (f.startsWith('_')) {
      partials[f.slice(1, -3)] = text.replace(/\r\n/g, '\n').trim();
    } else {
      const slug = f.slice(0, -3);
      pages[slug] = Object.assign(parseFile(text), { slug, lang });
    }
  }
  return { pages, partials };
}

const content = {};
for (const lang of LANGS) content[lang] = loadLang(lang);

/** 這一頁是否出現在這款設計內。 */
function inTheme(page, theme) {
  if (!page) return false;
  return theme === 'current' ? !!page.fm.current : page.fm.only !== 'current';
}

/** 頁面輸出到 docs\ 內的相對路徑。 */
function outPath(theme, lang, slug) {
  const page = content[lang].pages[slug];
  if (theme === 'current') return `current/${page.fm.current}.html`;
  return `${theme}/${lang}/${slug}.html`;
}

function slugsFor(theme, lang) {
  return PAGE_ORDER.filter((s) => inTheme(content[lang].pages[s], theme));
}

/* ---------- 小工具 ---------- */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const otherLang = (lang) => (lang === 'zh' ? 'en' : 'zh');

function formatDate(iso, lang) {
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'zh') return `${y} 年 ${m} 月 ${d} 日`;
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${d} ${months[m - 1]} ${y}`;
}

/** 為每一頁準備範本需要的資料及函數。 */
function makeCtx(theme, lang, slug, outOverride) {
  const page = content[lang].pages[slug];
  const out = outOverride || outPath(theme, lang, slug);
  const root = '../'.repeat(out.split('/').length - 1);
  const ctx = {
    theme, lang, slug, page, fm: page.fm, site, downloads, root, mute: 0,
    L: site.labels[lang],
    pages: content[lang].pages,
    slugs: slugsFor(theme, lang),
    esc, formatDate,
    t: (obj) => (obj && typeof obj === 'object' ? obj[lang] : obj),
    has: (s) => inTheme(content[lang].pages[s], theme),
    title: (s) => content[lang].pages[s].fm.title,
    navTitle: (s) => content[lang].pages[s].fm.nav || content[lang].pages[s].fm.title,
    url(s) {
      if (!inTheme(content[lang].pages[s], theme)) {
        if (!ctx.mute) warnings.push(`${out}: 連到不存在的頁面 page:${s}`);
        return '#';
      }
      return root + outPath(theme, lang, s);
    },
    otherUrl(s) {
      const ol = otherLang(lang);
      if (inTheme(content[ol].pages[s], theme)) return root + outPath(theme, ol, s);
      return root + outPath(theme, ol, 'index');
    },
    themeUrl(th) {
      if (inTheme(page, th)) return root + outPath(th, lang, slug);
      return th === 'current' ? root + 'current/index.html' : root + outPath(th, lang, 'index');
    },
    urlIn: (l, s) => root + outPath(theme, l, s),
    pagesIn: (l) => content[l].pages,
    asset: (p) => root + 'assets/' + p,
    img: (name) => root + 'assets/img/' + name,
  };
  return ctx;
}

/* ---------- Markdown 轉 HTML ---------- */

function href(u, ctx) {
  if (u.startsWith('page:')) return ctx.url(u.slice(5));
  if (u.startsWith('other:')) return ctx.otherUrl(u.slice(6));
  if (u.startsWith('img:')) return ctx.img(u.slice(4));
  return u;
}

function inline(s, ctx) {
  s = esc(s).replace(/\\\*/g, '&#42;');
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, u) => (u === 'ph:'
    ? `<span class="ph" role="img" aria-label="${alt}" data-label="${ctx.L.photo_omitted}"></span>`
    : `<img src="${href(u, ctx)}" alt="${alt}" loading="lazy">`));
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)(\{\.([\w-]+)\})?/g, (m, text, u, _c, cls) => {
    const ext = /^https?:/.test(u) ? ' target="_blank" rel="noopener"' : '';
    return `<a href="${href(u, ctx)}"${cls ? ` class="${cls}"` : ''}${ext}>${text}</a>`;
  });
  return s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

/** 正文內獨立一行的 {{名稱}}。 */
function token(name, ctx) {
  const H = ctx.H;
  if (name === 'services') return ctx.tpl.services ? ctx.tpl.services(ctx) : H.serviceCards(ctx);
  if (name === 'contact') return H.contactBlock(ctx);
  if (name === 'map') return H.mapBlock(ctx);
  if (name === 'downloads') return H.downloadsBlock(ctx);
  if (name === 'news') return H.newsList(ctx, 99);
  if (name.startsWith('youtube:')) {
    return `<div class="video"><iframe src="https://www.youtube-nocookie.com/embed/${esc(name.slice(8))}" title="YouTube" loading="lazy" allowfullscreen></iframe></div>`;
  }
  if (name.startsWith('embed:')) {
    return `<div class="embed"><iframe src="${esc(name.slice(6))}" title="${esc(ctx.fm.title)}" loading="lazy"></iframe></div>`;
  }
  warnings.push(`${ctx.slug}: 不認識的標記 {{${name}}}`);
  return '';
}

function renderMarkdown(body, ctx) {
  const partials = content[ctx.lang].partials;
  const text = body
    .replace(/^\{\{>\s*([\w-]+)\s*\}\}$/gm, (m, n) => (partials[n] != null ? partials[n] : (warnings.push(`找不到共用段落 ${n}`), '')))
    .replace(/\{\{fm\.([\w-]+)\}\}/g, (m, k) => ctx.fm[k] || '');
  const lines = text.split('\n');
  let pos = 0;

  const isSpecial = (l) => /^(#{1,4}\s|:::|\||- |\d+\.\s|---+\s*$|\{\{.+\}\}\s*$)/.test(l);

  function blocks() {
    const out = [];
    while (pos < lines.length) {
      const line = lines[pos];
      if (line.trim() === ':::') { pos++; break; }
      let m;
      if (!line.trim()) { pos++; continue; }
      if ((m = line.match(/^:::([\w-]+)\s*$/))) {
        pos++;
        const name = m[1];
        // 這款設計不顯示的段落仍要讀過，但不檢查裏面的連結
        const hidden = ctx.theme === 'current' ? (name === 'new' || name === 'demo') : name === 'current';
        if (hidden) ctx.mute++;
        const inner = blocks();
        if (hidden) ctx.mute--;
        if (name === 'current') { if (ctx.theme === 'current') out.push(inner); continue; }
        if (name === 'new') { if (ctx.theme !== 'current') out.push(inner); continue; }
        if (name === 'demo') {
          if (ctx.theme !== 'current') out.push(`<div class="blk blk-demo"><span class="demo-tag">${ctx.L.demo_tag}</span>${inner}</div>`);
          continue;
        }
        out.push(`<div class="blk blk-${name}">${inner}</div>`);
        continue;
      }
      if ((m = line.match(/^(#{1,4})\s+(.*)$/))) {
        out.push(`<h${m[1].length}>${inline(m[2], ctx)}</h${m[1].length}>`);
        pos++; continue;
      }
      if (/^---+\s*$/.test(line)) { out.push('<hr>'); pos++; continue; }
      if ((m = line.match(/^\{\{(.+)\}\}\s*$/))) { out.push(token(m[1].trim(), ctx)); pos++; continue; }
      if (line.startsWith('|')) {
        const rows = [];
        while (pos < lines.length && lines[pos].startsWith('|')) {
          rows.push(lines[pos].trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
          pos++;
        }
        const head = rows[0];
        const bodyRows = rows.slice(2);
        out.push('<div class="table-wrap"><table><thead><tr>' + head.map((c) => `<th>${inline(c, ctx)}</th>`).join('') +
          '</tr></thead><tbody>' + bodyRows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c, ctx)}</td>`).join('') + '</tr>').join('') +
          '</tbody></table></div>');
        continue;
      }
      if (/^- /.test(line) || /^\d+\.\s/.test(line)) {
        const ordered = /^\d/.test(line);
        const re = ordered ? /^\d+\.\s+(.*)$/ : /^- (.*)$/;
        const items = [];
        while (pos < lines.length && re.test(lines[pos])) { items.push(lines[pos].match(re)[1]); pos++; }
        const tag = ordered ? 'ol' : 'ul';
        out.push(`<${tag}>` + items.map((i) => `<li>${inline(i, ctx)}</li>`).join('') + `</${tag}>`);
        continue;
      }
      // 一般段落：連續的文字行，行與行之間換行
      const para = [];
      while (pos < lines.length && lines[pos].trim() && !isSpecial(lines[pos])) { para.push(lines[pos].trim()); pos++; }
      if (!para.length) { para.push(lines[pos].trim()); pos++; } // 防止遇到未能辨認的行時停住
      const onlyImages = para.every((l) => /^!\[[^\]]*\]\([^)]+\)$/.test(l));
      const onlyButtons = para.length === 1 && /^(\[[^\]]+\]\([^)\s]+\)\{\.[\w-]+\}\s*)+$/.test(para[0]);
      if (onlyImages) {
        out.push(`<div class="imgs imgs-${Math.min(para.length, 4)}">` +
          para.map((l) => `<figure>${inline(l, ctx)}</figure>`).join('') + '</div>');
      } else if (onlyButtons) {
        out.push(`<p class="btns">${inline(para[0], ctx)}</p>`);
      } else {
        out.push(`<p>${para.map((l) => inline(l, ctx)).join('<br>')}</p>`);
      }
    }
    return out.join('\n');
  }
  const html = [];
  while (pos < lines.length) html.push(blocks()); // 多出來的 ::: 不會令後面的內容消失
  return html.join('\n');
}

/* ---------- 建置 ---------- */

function write(rel, html) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html.replace(/[ \t]+\n/g, '\n'), 'utf8');
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

function build() {
  // 只清除由本腳本產生的資料夾，保留 docs\ 內的 CNAME 及圖片來源.md
  for (const d of [...THEMES, 'assets']) fs.rmSync(path.join(OUT, d), { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
  const H = require('./templates/shared.js');
  const counts = {};

  for (const theme of THEMES) {
    const tpl = require(`./templates/${theme}/template.js`);
    fs.copyFileSync(path.join(ROOT, 'templates', theme, 'style.css'), path.join(OUT, 'assets', `${theme}.css`));
    counts[theme] = {};
    for (const lang of LANGS) {
      const slugs = slugsFor(theme, lang);
      counts[theme][lang] = slugs.length;
      for (const slug of slugs) {
        const ctx = makeCtx(theme, lang, slug);
        ctx.tpl = tpl;
        ctx.H = H;
        ctx.render = (md) => renderMarkdown(md, ctx);
        const isHome = slug === 'index' && tpl.home;
        const main = isHome ? tpl.home(ctx) : tpl.page(ctx, renderMarkdown(ctx.page.body, ctx));
        write(outPath(theme, lang, slug), tpl.layout(ctx, main, { home: !!isHome }));
      }
    }
    if (tpl.entry) {
      // 現有網站的入口頁（只用來選擇語言）
      const ctx = makeCtx(theme, 'en', 'index', `${theme}/index.html`);
      ctx.tpl = tpl; ctx.H = H;
      write(`${theme}/index.html`, tpl.entry(ctx));
    } else {
      // 進入 /a/ 等網址時直接顯示中文首頁（瀏覽器語言不是中文時顯示英文首頁）
      write(`${theme}/index.html`, H.redirectPage(theme));
    }
  }

  write('index.html', H.directoryPage({ site, counts, themes: THEMES.map((t) => require(`./templates/${t}/template.js`).meta) }));
  write('robots.txt', 'User-agent: *\nDisallow: /\n');
  write('.nojekyll', '');

  for (const theme of THEMES) {
    console.log(`${theme.padEnd(8)} 中文 ${counts[theme].zh} 頁　英文 ${counts[theme].en} 頁` + (theme === 'current' ? '　另加入口頁 1 頁' : ''));
  }
  if (warnings.length) {
    console.log('\n要留意：');
    for (const w of [...new Set(warnings)]) console.log(' - ' + w);
    process.exitCode = 1;
  } else {
    console.log('完成，沒有警告。輸出在 docs\\');
  }
}

build();
