/* 手機版選單的開關。 */
(function () {
  var button = document.querySelector('.nav-toggle');
  if (!button) return;
  button.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();
