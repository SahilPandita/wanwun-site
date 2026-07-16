// Light/dark theme toggle — click handler, persistence, and the celestial
// handoff: both bodies ride ONE orbit (see the exit/enter-arc CSS). The
// sitting sun/moon climbs the orbit's upper segment and exits through the
// TOP of the page at mid-sky, while its counterpart rises along the lower
// segment — from the left edge, low over the mountains — into the same
// seat, carrying the new light with it (a soft radial wash sweeps across
// as it climbs, and every themed surface cross-fades underneath). Pages
// without the sky scene (privacy, terms…) fall back to the soft bloom veil
// from the toggle button.
(function () {
  var SWAP_MS = 700;    // theme swaps as the riser climbs, under the wash peak
  var TOTAL_MS = 2100;  // full performance (exit 1.6s; enter 0.45s + 1.6s), then cleanup
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var transitioning = false;

  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('wanwun-theme', theme);
  }

  /* ── Celestial handoff (home page, where the sky scene lives) ── */

  function playCelestial(next, swap) {
    var body = document.querySelector('.site-backdrop .sky-body');
    var isLightNow = document.documentElement.getAttribute('data-theme') === 'light';

    // Act 1: freeze the sitting body's face, send it up the departure arc.
    body.classList.add(isLightNow ? 'is-sun' : 'is-moon', 'exit-arc');

    // Act 2: the successor rises from the left horizon into the same seat.
    var inc = document.createElement('div');
    inc.className = 'sky-body ' + (next === 'light' ? 'is-sun' : 'is-moon') + ' enter-arc';
    inc.innerHTML = '<span class="body-disc"></span>';
    body.parentNode.insertBefore(inc, body.nextSibling);

    // The light it carries: a sheer wash sweeping from its rising point.
    var wash = document.querySelector('.sky-wash');
    if (!wash) {
      wash = document.createElement('div');
      wash.className = 'sky-wash';
      document.body.appendChild(wash);
    }
    wash.className = 'sky-wash ' + (next === 'light' ? 'to-light' : 'to-dark');
    void wash.offsetHeight;
    wash.classList.add('washing');

    // The world changes as the riser climbs — surfaces cross-fade under the wash.
    setTimeout(function () { swap(); }, SWAP_MS);

    // Curtain: the original element (now wearing the new theme's face) takes
    // the seat back the instant the visually-identical stand-in leaves.
    setTimeout(function () {
      body.classList.remove('exit-arc', 'is-sun', 'is-moon');
      inc.remove();
      wash.className = 'sky-wash';
      transitioning = false;
    }, TOTAL_MS);
  }

  /* ── Bloom fallback (content pages without the sky scene) ── */

  function playBloom(next, btn, swap) {
    var overlay = document.querySelector('.theme-bloom');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'theme-bloom';
      document.body.appendChild(overlay);
    }
    var r = btn.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;
    overlay.style.setProperty('--bloom-x', cx + 'px');
    overlay.style.setProperty('--bloom-y', cy + 'px');
    var far = Math.max(
      Math.hypot(cx, cy),
      Math.hypot(window.innerWidth - cx, cy),
      Math.hypot(cx, window.innerHeight - cy),
      Math.hypot(window.innerWidth - cx, window.innerHeight - cy)
    );
    overlay.style.setProperty('--bloom-r', (far * 1.15) + 'px');

    overlay.className = 'theme-bloom ' + (next === 'light' ? 'to-light' : 'to-dark');
    void overlay.offsetHeight;
    overlay.classList.add('growing');

    setTimeout(function () { swap(); }, 620);
    setTimeout(function () { overlay.classList.add('fading'); }, 800);
    setTimeout(function () {
      overlay.className = 'theme-bloom';
      transitioning = false;
    }, 1620);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      var next = current === 'light' ? 'dark' : 'light';
      var swap = function () { applyTheme(next); };

      if (reduceMotion) { swap(); return; }
      if (transitioning) return;
      transitioning = true;

      if (document.querySelector('.site-backdrop .sky-body')) {
        playCelestial(next, swap);
      } else {
        playBloom(next, btn, swap);
      }
    });
  });
})();

// ── "Resources" nav dropdown ──────────────────────────────────────────────
// Hover-open lives in CSS (fine pointers only); this adds click/tap toggle
// for touch devices, plus outside-click and Escape to close.
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var dd = document.querySelector('.nav-dd');
    if (!dd) return;
    var btn = dd.querySelector('.nav-dd-toggle');

    function setOpen(open) {
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(!dd.classList.contains('open'));
    });
    document.addEventListener('click', function (e) {
      if (!dd.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setOpen(false); btn.blur(); }
    });
  });
})();
