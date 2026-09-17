/* Back-to-top button. styles.css only shows it on phones; it fades in once
   you've scrolled about a screen down and takes you smoothly back to the top
   (instantly for visitors who prefer reduced motion). */
(function () {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">'
    + '<path d="M12 19V5M5.5 11.5 12 5l6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(btn);

  // Show after about a screen of scrolling, or after 40% of the page's total
  // scroll on shorter pages (Blog, Social, Press can't scroll a full screen on
  // phones). Pages that barely scroll at all never show it.
  function update() {
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    var threshold = Math.min(window.innerHeight * 0.9, maxScroll * 0.4);
    btn.classList.toggle('is-visible', maxScroll > 150 && window.scrollY > threshold);
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();

  btn.addEventListener('click', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
