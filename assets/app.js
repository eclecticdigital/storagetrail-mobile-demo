/* ==========================================================================
   StorageTrail — Mobile Listings page
   Vanilla JS, no dependencies. Every control in the mockup is wired:
   search, category chips, sort, filter sheet, favourites, map toggle.

   In the production WordPress build these same controls bind to the
   existing storagetrail-listings query instead of the static DOM below,
   so the markup and behaviour stay identical while the data goes live.
   ========================================================================== */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  var cards = $$('.card');

  /* committed filter state */
  var state = { q: '', type: 'all', sort: 'new', maxPrice: 1000, setting: 'any', instant: false };
  /* draft state while the filter sheet is open */
  var draft = null;

  /* ---------------------------------------------------------------- matching */
  function matches(card, s) {
    if (s.type !== 'all' && card.dataset.type !== s.type) return false;
    if (Number(card.dataset.price) > s.maxPrice) return false;
    if (s.setting !== 'any' && card.dataset.setting !== s.setting) return false;
    if (s.instant && card.dataset.instant !== '1') return false;
    if (s.q && card.dataset.hay.indexOf(s.q) === -1) return false;
    return true;
  }

  function countFor(s) {
    return cards.filter(function (c) { return matches(c, s); }).length;
  }

  /* ---------------------------------------------------------------- rendering */
  function render() {
    var visible = [];

    cards.forEach(function (c) {
      var ok = matches(c, state);
      c.hidden = !ok;
      if (ok) visible.push(c);
    });

    /* sort by reordering the DOM */
    visible.sort(function (a, b) {
      if (state.sort === 'lo') return Number(a.dataset.price) - Number(b.dataset.price);
      if (state.sort === 'hi') return Number(b.dataset.price) - Number(a.dataset.price);
      return Number(b.dataset.added) - Number(a.dataset.added);
    });

    var grid = $('#listings');
    visible.forEach(function (c) { grid.appendChild(c); });

    $('#count').textContent = visible.length;
    $('#empty').hidden = visible.length !== 0;
    $('#listings').hidden = visible.length === 0;

    /* the Filters button gets a dot when anything beyond defaults is set */
    var dirty = state.maxPrice < 1000 || state.setting !== 'any' || state.instant;
    $('#filtersDot').hidden = !dirty;

    renderPins(visible);
  }

  /* ---------------------------------------------------------------- map pins */
  var PIN_POS = [
    [20, 34], [58, 22], [78, 48], [34, 62], [64, 74], [12, 76], [46, 42], [86, 30]
  ];

  function renderPins(visible) {
    var host = $('#mapPins');
    host.innerHTML = '';
    visible.slice(0, 8).forEach(function (card, i) {
      var pos = PIN_POS[i % PIN_POS.length];
      var b = document.createElement('button');
      b.className = 'mappin';
      b.style.left = pos[0] + '%';
      b.style.top = pos[1] + '%';
      b.textContent = '$' + card.dataset.price;
      b.setAttribute('aria-label', 'Show ' + $('.card__t', card).textContent);
      b.addEventListener('click', function () {
        $$('.mappin').forEach(function (p) { p.classList.remove('is-on'); });
        b.classList.add('is-on');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.animate(
          [{ boxShadow: '0 0 0 0 rgba(232,119,34,.55)' }, { boxShadow: '0 0 0 12px rgba(232,119,34,0)' }],
          { duration: 700, easing: 'ease-out' }
        );
      });
      host.appendChild(b);
    });
  }

  /* ---------------------------------------------------------------- toast */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2000);
  }

  /* ---------------------------------------------------------------- search */
  var q = $('#q');
  q.addEventListener('input', function () {
    state.q = q.value.trim().toLowerCase();
    $('#qClear').hidden = q.value === '';
    render();
  });
  $('#qClear').addEventListener('click', function () {
    q.value = ''; state.q = '';
    $('#qClear').hidden = true;
    q.focus(); render();
  });
  $('#headerSearchBtn').addEventListener('click', function () {
    q.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(function () { q.focus(); }, 320);
  });

  /* ---------------------------------------------------------------- chips */
  $('#chips').addEventListener('click', function (e) {
    var chip = e.target.closest('.chip');
    if (!chip || chip.id === 'moreChip') return;
    $$('.chip', this).forEach(function (c) {
      if (c.id === 'moreChip') return;
      c.classList.remove('is-on');
      c.setAttribute('aria-selected', 'false');
    });
    chip.classList.add('is-on');
    chip.setAttribute('aria-selected', 'true');
    state.type = chip.dataset.type;
    render();
  });

  var moreChip = $('#moreChip');
  moreChip.addEventListener('click', function () {
    var open = moreChip.getAttribute('aria-expanded') === 'true';
    moreChip.setAttribute('aria-expanded', String(!open));
    $$('.chip--more').forEach(function (c) { c.hidden = open; });
    $('span', moreChip).textContent = open ? 'More' : 'Less';
  });

  /* ---------------------------------------------------------------- sort */
  $('#sort').addEventListener('change', function () {
    state.sort = this.value;
    render();
  });

  /* ---------------------------------------------------------------- map toggle */
  var mapBtn = $('#mapBtn');
  mapBtn.addEventListener('click', function () {
    var on = mapBtn.getAttribute('aria-pressed') === 'true';
    mapBtn.setAttribute('aria-pressed', String(!on));
    $('#mapPanel').hidden = on;
    if (!on) $('#mapPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ---------------------------------------------------------------- favourites */
  $$('.fav').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var on = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!on));
      toast(on ? 'Removed from saved spaces' : 'Saved to your spaces');
    });
  });

  /* ---------------------------------------------------------------- filter sheet */
  var sheet = $('#sheet');
  var maxPrice = $('#maxPrice');
  var instantOnly = $('#instantOnly');

  function money(n) {
    return '$' + Number(n).toLocaleString('en-US') + (Number(n) >= 1000 ? '+' : '');
  }

  function syncSheet() {
    maxPrice.value = draft.maxPrice;
    $('#maxPriceOut').textContent = money(draft.maxPrice);
    instantOnly.checked = draft.instant;
    $$('#settingSegs .seg').forEach(function (s) {
      s.classList.toggle('is-on', s.dataset.setting === draft.setting);
    });
    $('#applyCount').textContent = countFor(draft);
  }

  function openSheet() {
    draft = { q: state.q, type: state.type, sort: state.sort,
              maxPrice: state.maxPrice, setting: state.setting, instant: state.instant };
    syncSheet();
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    $('#filtersBtn').focus();
  }

  $('#filtersBtn').addEventListener('click', openSheet);
  $('#sheetX').addEventListener('click', closeSheet);
  $('#sheetScrim').addEventListener('click', closeSheet);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !sheet.hidden) closeSheet();
  });

  maxPrice.addEventListener('input', function () {
    draft.maxPrice = Number(this.value);
    $('#maxPriceOut').textContent = money(draft.maxPrice);
    $('#applyCount').textContent = countFor(draft);
  });

  instantOnly.addEventListener('change', function () {
    draft.instant = this.checked;
    $('#applyCount').textContent = countFor(draft);
  });

  $('#settingSegs').addEventListener('click', function (e) {
    var seg = e.target.closest('.seg');
    if (!seg) return;
    draft.setting = seg.dataset.setting;
    syncSheet();
  });

  $('#sheetReset').addEventListener('click', function () {
    draft.maxPrice = 1000; draft.setting = 'any'; draft.instant = false;
    syncSheet();
  });

  $('#sheetApply').addEventListener('click', function () {
    state.maxPrice = draft.maxPrice;
    state.setting = draft.setting;
    state.instant = draft.instant;
    closeSheet();
    render();
    toast(countFor(state) + ' spaces match your filters');
  });

  /* ---------------------------------------------------------------- reset all */
  $('#resetAll').addEventListener('click', function () {
    state = { q: '', type: 'all', sort: state.sort, maxPrice: 1000, setting: 'any', instant: false };
    q.value = '';
    $('#qClear').hidden = true;
    $$('.chip').forEach(function (c) {
      if (c.id === 'moreChip') return;
      var on = c.dataset.type === 'all';
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-selected', String(on));
    });
    render();
  });

  /* ---------------------------------------------------------------- nav + strip */
  var navBtn = $('#navBtn');
  navBtn.addEventListener('click', function () {
    var open = navBtn.getAttribute('aria-expanded') === 'true';
    navBtn.setAttribute('aria-expanded', String(!open));
    $('#navPanel').hidden = open;
  });

  $('#demoStripX').addEventListener('click', function () {
    $('#demoStrip').remove();
  });

  /* ---------------------------------------------------------------- go */
  render();
})();
