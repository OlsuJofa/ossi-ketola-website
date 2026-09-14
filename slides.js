/* Page transitions (the pages that opt in do so in their <head>; blog posts
   don't, so they load normally). Animations live in styles.css.
   - Between the five main pages (About, Blog, Companies, Social, Press Kit):
     slide sideways, direction from the menu order.
   - Opening a company page (Duel, CSGOEmpire, The Castle) from anywhere:
     it rises from below over the page you were on ("sheet-open").
   - Company page -> another company page: the new one rises while the old one
     is tucked away underneath ("sheet-swap"), and the old one is REPLACED in
     history rather than stacked, so there's only ever one company page open.
   - Leaving a company page (Back button, browser back, menu): it drops away
     ("sheet-close").
   Also powers the company pages' "Back" button: returns to the page the first
   company page was opened from, or to the Companies page if there isn't one
   on this site. */
(function () {
  function slot(url) {
    var p = new URL(url, location.href).pathname.replace(/index\.html$/, '');
    if (/\/blog\/$/.test(p)) return 1;
    if (/\/companies\/$/.test(p)) return 2;
    if (/\/social\.html$/.test(p)) return 3;
    if (/\/press\.html$/.test(p)) return 4;
    if (/\/$/.test(p)) return 0;
    return -1;
  }

  function page(url) {
    var p = new URL(url, location.href).pathname;
    if (/\/companies\/(duel|csgoempire|castle)\.html$/.test(p)) return { company: p };
    var s = slot(url);
    return s < 0 ? null : { main: s };
  }

  function typeFor(fromUrl, toUrl) {
    var a = fromUrl && page(fromUrl), b = toUrl && page(toUrl);
    if (!a || !b) return null;
    if (b.company) {
      if (a.company === b.company) return null;
      return a.company ? 'sheet-swap' : 'sheet-open';
    }
    if (a.company) return 'sheet-close';
    if (a.main === b.main) return null;
    return b.main > a.main ? 'slide-forward' : 'slide-back';
  }

  function quiet(vt) {
    ['ready', 'finished', 'updateCallbackDone'].forEach(function (k) {
      if (vt[k]) vt[k].catch(function () {});
    });
  }

  function decide(e) {
    if (!e.viewTransition) return;
    quiet(e.viewTransition);
    var act = e.activation || (window.navigation && navigation.activation);
    var type = act && act.entry ? typeFor(act.from ? act.from.url : null, act.entry.url) : null;
    // Skip here (on either page) rather than let the browser abort it, so the
    // rejection is handled instead of logged as an uncaught error.
    if (!type) { e.viewTransition.skipTransition(); return; }
    e.viewTransition.types.add(type);
  }

  // Old page: tag the transition too, so type-based CSS (e.g. keeping the
  // castle part of the page underneath a rising company page) applies when
  // this page is captured.
  window.addEventListener('pageswap', decide);
  window.addEventListener('pagereveal', decide);

  function plainClick(e) {
    return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  }

  document.addEventListener('click', function (e) {
    if (!plainClick(e) || !e.target.closest) return;

    // "Back" on company pages: go back in history when the previous page is on
    // this site; otherwise follow the link (the Companies page).
    var back = e.target.closest('[data-back]');
    if (back) {
      var prevOnSite = false;
      if (window.navigation && navigation.currentEntry) {
        var prev = navigation.entries()[navigation.currentEntry.index - 1];
        prevOnSite = !!(prev && prev.url && new URL(prev.url).origin === location.origin);
      } else if (document.referrer) {
        prevOnSite = new URL(document.referrer).origin === location.origin && history.length > 1;
      }
      if (prevOnSite) {
        e.preventDefault();
        history.back();
      }
      return;
    }

    // From one company page to another: replace this history entry instead of
    // adding one, so company pages never pile up and Back still goes to where
    // the first one was opened from.
    var link = e.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    var dest = new URL(link.href, location.href);
    if (dest.origin !== location.origin) return;
    var here = page(location.href), there = page(dest.href);
    if (!here || !here.company || !there || !there.company || here.company === there.company) return;
    e.preventDefault();
    location.replace(dest.href);
  });
})();
