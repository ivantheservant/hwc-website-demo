/*
 * 方向 D 的互動：全螢幕選單、右下角「下一步」按鈕、可以關閉的公告條。
 * 鍵盤：按〔選單〕開啟後焦點移到「關閉」，Tab 只在選單內循環，Esc 關閉並把焦點交回〔選單〕。
 */
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  function visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
  function focusables(container) {
    return Array.prototype.filter.call(container.querySelectorAll('a[href], button:not([disabled])'), visible);
  }

  /* 全螢幕選單 */
  var toggle = document.querySelector('.menu-toggle');
  var panel = document.getElementById('menu-panel');
  var closeBtn = panel && panel.querySelector('.menu-close');
  function menuOpen() { return panel.classList.contains('open'); }
  function openMenu() {
    panel.classList.add('open');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeBtn.focus();
  }
  function closeMenu() {
    panel.classList.remove('open');
    panel.removeAttribute('role');
    panel.removeAttribute('aria-modal');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    toggle.focus();
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () { if (menuOpen()) closeMenu(); else openMenu(); });
    closeBtn.addEventListener('click', closeMenu);
  }

  /* 右下角「下一步」 */
  var quickBtn = document.querySelector('.quick-btn');
  var quickMenu = document.getElementById('quick-menu');
  function quickOpen() { return quickMenu.classList.contains('open'); }
  function setQuick(open, returnFocus) {
    quickMenu.classList.toggle('open', open);
    quickBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var first = quickMenu.querySelector('a'); if (first) first.focus(); }
    else if (returnFocus) quickBtn.focus();
  }
  if (quickBtn && quickMenu) {
    quickBtn.addEventListener('click', function () { setQuick(!quickOpen(), true); });
    document.addEventListener('click', function (e) {
      if (quickOpen() && !quickMenu.contains(e.target) && e.target !== quickBtn) setQuick(false, false);
    });
  }

  /* Esc 及 Tab */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (panel && menuOpen()) { e.preventDefault(); closeMenu(); }
      else if (quickMenu && quickOpen()) { e.preventDefault(); setQuick(false, true); }
      return;
    }
    if (e.key === 'Tab' && panel && menuOpen()) {
      var items = focusables(panel);
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* 公告條：按「✕」關閉，同一個瀏覽期間不再顯示 */
  var bar = document.getElementById('announce');
  var KEY = 'hwc-demo-d-announce-closed';
  try { if (bar && sessionStorage.getItem(KEY) === '1') bar.hidden = true; } catch (err) { /* 瀏覽器不允許儲存時照常顯示 */ }
  var barClose = bar && bar.querySelector('.announce-close');
  if (barClose) {
    barClose.addEventListener('click', function () {
      bar.hidden = true;
      try { sessionStorage.setItem(KEY, '1'); } catch (err) { /* 略過 */ }
      if (toggle) toggle.focus();
    });
  }
})();
