(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header border on scroll ---------- */
  var header = document.getElementById('siteHeader');
  function onScrollHeader() {
    if (window.scrollY > 8) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Mobile menu ---------- */
  var burger = document.getElementById('burgerBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    mobileMenu.hidden = !open;
  }
  burger.addEventListener('click', function () {
    setMenu(mobileMenu.hidden);
  });
  mobileMenu.addEventListener('click', function (e) {
    if (e.target.closest('a,button')) setMenu(false);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('in-view', 'reveal-done'); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-w]'), function (el) { el.style.opacity = '1'; });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute('data-reveal') || '0', 10) || 0;
        if (delay) el.style.transitionDelay = delay + 'ms';
        el.classList.add('in-view');
        io.unobserve(el);
        setTimeout(function () {
          el.classList.add('reveal-done');
          el.style.transitionDelay = '';
        }, 950 + delay);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Intro text: words light up while scrolling ---------- */
  var wordsP = document.querySelector('[data-words]');
  if (wordsP && !reduceMotion) {
    var words = wordsP.querySelectorAll('[data-w]');
    var shown = 0;
    var wRaf = 0;
    var clamp = function (v) { return Math.min(1, Math.max(0, v)); };
    var updateWords = function () {
      wRaf = 0;
      var vh = window.innerHeight;
      var r = wordsP.getBoundingClientRect();
      var pin = clamp((vh * 0.9 - r.top) / (vh * 0.32 + r.height / 2));
      var pout = clamp((vh - r.top) / (r.height + 40));
      shown = Math.min(Math.max(shown, pin), pout);
      for (var i = 0; i < words.length; i++) words[i].style.opacity = clamp(shown * words.length - i).toFixed(3);
    };
    var onWordsScroll = function () { if (!wRaf) wRaf = requestAnimationFrame(updateWords); };
    window.addEventListener('scroll', onWordsScroll, { passive: true });
    window.addEventListener('resize', onWordsScroll);
    updateWords();
  }

  /* ---------- Hero image load-in ---------- */
  var heroImg = document.getElementById('heroImg');
  if (heroImg) {
    function showHero() { heroImg.classList.add('in-view'); }
    if (reduceMotion) showHero();
    else if (heroImg.complete && heroImg.naturalWidth) requestAnimationFrame(showHero);
    else heroImg.addEventListener('load', showHero, { once: true });
    setTimeout(showHero, 2500);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
        }
      });
      item.classList.toggle('open', !isOpen);
      q.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  /* ---------- Team hotspots ---------- */
  var teamData = [
    { img: 'images/tim/lice-1.jpg', name: 'Marija Jurić', role: 'Stomatološka sestra', pos: '50% 30%' },
    { img: 'images/tim/lice-2.jpg', name: 'Dr. Ivana Bošnjak', role: 'Doktorica stomatologije', pos: '50% 30%' },
    { img: 'images/tim/lice-3.jpg', name: 'Dr. Ante Marić', role: 'Doktor stomatologije', pos: '50% 30%' },
    { img: 'images/tim/lice-4.jpg', name: 'Dr. Dominik Lubina', role: 'Specijalist ortodoncije', pos: '50% 30%' },
    { img: 'images/tim/lice-5.jpg', name: 'Ana Perić', role: 'Stomatološka sestra', pos: '50% 30%' }
  ];
  var teamBigPhoto = document.getElementById('teamBigPhoto');
  var teamWrap = document.getElementById('teamPhotoWrap');
  function setActiveTeam(idx) {
    document.querySelectorAll('.team-glow').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-glow') === String(idx));
    });
    document.querySelectorAll('.team-tip').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-tip') === String(idx));
    });
    document.querySelectorAll('.team-list-item').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-team') === String(idx));
    });
  }
  if (teamWrap) {
    teamWrap.querySelectorAll('.team-hotspot').forEach(function (el) {
      var idx = el.getAttribute('data-hotspot');
      el.addEventListener('mouseenter', function () { setActiveTeam(idx); });
      el.addEventListener('click', function () { setActiveTeam(idx); });
      el.addEventListener('focus', function () { setActiveTeam(idx); });
    });
  }
  document.querySelectorAll('.team-list-item').forEach(function (el) {
    var idx = +el.getAttribute('data-team');
    el.addEventListener('mouseenter', function () { setActiveTeam(idx); });
    el.addEventListener('focus', function () { setActiveTeam(idx); });
    el.addEventListener('click', function () {
      setActiveTeam(idx);
    });
  });
  // default highlight is index 3 (Dr. Dominik Lubina), matches initial markup

  /* ---------- Gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCount = document.getElementById('lbCount');
  var galleryTiles = Array.prototype.slice.call(document.querySelectorAll('.gal-tile'));
  var lbIndex = 0;
  function openLightbox(i) {
    lbIndex = i;
    var tile = galleryTiles[lbIndex];
    lbImg.src = tile.getAttribute('data-lb-src');
    lbImg.alt = tile.getAttribute('data-lb-alt') || '';
    lbCount.textContent = (lbIndex + 1) + ' / ' + galleryTiles.length;
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  function stepLightbox(dir) {
    lbIndex = (lbIndex + dir + galleryTiles.length) % galleryTiles.length;
    openLightbox(lbIndex);
  }
  galleryTiles.forEach(function (tile, i) {
    tile.addEventListener('click', function () { openLightbox(i); });
  });
  document.getElementById('lbCloseBtn').addEventListener('click', closeLightbox);
  document.getElementById('lbPrevBtn').addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(-1); });
  document.getElementById('lbNextBtn').addEventListener('click', function (e) { e.stopPropagation(); stepLightbox(1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });

  /* ---------- Booking modal ---------- */
  var overlay = document.getElementById('bookingOverlay');
  var formView = document.getElementById('bookingForm');
  var doneView = document.getElementById('bookingDone');
  var segRegular = document.getElementById('segRegular');
  var segUrgent = document.getElementById('segUrgent');
  var urgentPanel = document.getElementById('urgentPanel');
  var regularFlow = document.getElementById('regularFlow');
  var backToRegularBtn = document.getElementById('backToRegularBtn');
  var whyWrap = document.getElementById('whyWrap');
  var calMonth = document.getElementById('calMonth');
  var dayGrid = document.getElementById('dayGrid');
  var slotGrid = document.getElementById('slotGrid');
  var dayLong = document.getElementById('dayLong');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  var pickText = document.getElementById('pickText');
  var confirmBtn = document.getElementById('confirmBtn');
  var inputName = document.getElementById('inputName');
  var inputPhone = document.getElementById('inputPhone');
  var inputWhy = document.getElementById('inputWhy');
  var inputDesc = document.getElementById('inputDesc');

  var DN = ['Ned', 'Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub'];
  var DL = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];
  var MN = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];
  var HRS = [];
  for (var m = 8 * 60; m < 20 * 60; m += 60) {
    HRS.push(String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'));
  }

  var state = { urgent: false, wk: 0, di: 0, slot: null, termLabel: '' };

  function workDays(base) {
    var out = [];
    for (var k = 0; out.length < 6; k++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + k);
      if (d.getDay() !== 0) out.push(d);
    }
    return out;
  }
  function booked(d, h) {
    var val = (d.getDate() * 37 + d.getMonth() * 11 + h * 53 + h * h * 7) % 100;
    if (val < 35) return true;
    if (d.getDay() === 6 && HRS[h] >= '16:00') return true;
    return false;
  }
  function currentDays() {
    var t0 = new Date();
    var base = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + state.wk * 7);
    return workDays(base);
  }
  function renderCalendar() {
    var days = currentDays();
    calPrev.disabled = state.wk === 0;
    calPrev.style.opacity = state.wk === 0 ? '0.4' : '1';

    dayGrid.innerHTML = '';
    days.forEach(function (d, k) {
      var freeCount = 0;
      for (var h = 0; h < HRS.length; h++) if (!booked(d, h)) freeCount++;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'day-btn';
      btn.setAttribute('role', 'radio');
      var isOn = k === state.di;
      btn.setAttribute('aria-checked', String(isOn));
      btn.innerHTML = '<span class="dn">' + DN[d.getDay()] + '</span><span class="num">' + d.getDate() + '</span>';
      btn.addEventListener('click', function () {
        state.di = k;
        state.slot = null;
        renderCalendar();
        renderSlots();
        updateFooter();
      });
      dayGrid.appendChild(btn);
    });

    var cd = days[state.di];
    calMonth.textContent = MN[cd.getMonth()].charAt(0).toUpperCase() + MN[cd.getMonth()].slice(1) + ' ' + cd.getFullYear();
    dayLong.textContent = DL[cd.getDay()].charAt(0).toUpperCase() + DL[cd.getDay()].slice(1) + ', ' + cd.getDate() + '. ' + MN[cd.getMonth()];
  }

  function renderSlots() {
    var days = currentDays();
    var cd = days[state.di];
    slotGrid.innerHTML = '';
    HRS.forEach(function (t, h) {
      var isBooked = booked(cd, h);
      var isOn = state.slot === h && !isBooked;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(isOn));
      if (isBooked) btn.disabled = true;
      btn.innerHTML = '<span class="t">' + t + '</span><span class="st">' + (isBooked ? 'Rezervisano' : (isOn ? 'Vaš izbor' : 'Slobodno')) + '</span>';
      btn.addEventListener('click', function () {
        if (isBooked) return;
        state.slot = h;
        renderSlots();
        updateFooter();
      });
      slotGrid.appendChild(btn);
    });
  }

  function updateFooter() {
    var days = currentDays();
    var cd = days[state.di];
    var missingWhy = !state.urgent && !inputWhy.value;
    var missingContact = !inputName.value.trim() || !inputPhone.value.trim();
    var canConfirm = state.slot != null && !missingContact && !missingWhy;

    if (state.slot != null) {
      var label = DL[cd.getDay()] + ', ' + cd.getDate() + '. ' + MN[cd.getMonth()] + ' u ' + HRS[state.slot];
      state.termLabel = label.charAt(0).toUpperCase() + label.slice(1);
      if (canConfirm) {
        pickText.textContent = state.termLabel;
        pickText.classList.add('chosen');
      } else {
        pickText.textContent = missingContact ? 'Upišite ime i telefon.' : 'Izaberite zbog čega dolazite.';
        pickText.classList.remove('chosen');
      }
    } else {
      pickText.textContent = 'Kliknite na slobodan termin.';
      pickText.classList.remove('chosen');
    }
    confirmBtn.disabled = !canConfirm;
    confirmBtn.textContent = '';
    var label2 = document.createElement('span');
    label2.textContent = state.urgent ? 'Potvrdi hitni termin' : 'Potvrdi rezervaciju';
    confirmBtn.appendChild(label2);
    var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    arrow.setAttribute('class', 'icon');
    arrow.setAttribute('aria-hidden', 'true');
    var use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', '#icon-arrow-right');
    arrow.appendChild(use);
    confirmBtn.appendChild(arrow);
  }

  function setUrgent(on) {
    state.urgent = on;
    segRegular.setAttribute('aria-checked', String(!on));
    segUrgent.setAttribute('aria-checked', String(on));
    whyWrap.hidden = on;
    urgentPanel.hidden = !on;
    regularFlow.hidden = on;
    if (!on) {
      state.slot = null;
      renderCalendar();
      renderSlots();
    }
    updateFooter();
  }

  segRegular.addEventListener('click', function () { setUrgent(false); });
  segUrgent.addEventListener('click', function () { setUrgent(true); });
  backToRegularBtn.addEventListener('click', function () { setUrgent(false); });
  calPrev.addEventListener('click', function () {
    if (state.wk === 0) return;
    state.wk -= 1; state.di = 0; state.slot = null;
    renderCalendar(); renderSlots(); updateFooter();
  });
  calNext.addEventListener('click', function () {
    state.wk += 1; state.di = 0; state.slot = null;
    renderCalendar(); renderSlots(); updateFooter();
  });
  inputName.addEventListener('input', updateFooter);
  inputPhone.addEventListener('input', updateFooter);
  inputWhy.addEventListener('change', updateFooter);

  var syncWhy = (function () {
    var root = document.getElementById('whySelect');
    var btn = document.getElementById('whyBtn');
    var txt = document.getElementById('whyBtnText');
    var list = document.getElementById('whyList');
    var placeholder = inputWhy.options[0].textContent;
    var items = Array.prototype.filter.call(inputWhy.options, function (o) { return !o.disabled; }).map(function (o, i) {
      var li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.id = 'whyOpt' + i;
      li.dataset.value = o.value || o.textContent;
      var label = document.createElement('span');
      label.textContent = o.textContent;
      li.appendChild(label);
      li.insertAdjacentHTML('beforeend', '<svg class="icon" aria-hidden="true"><use href="#icon-check"/></svg>');
      list.appendChild(li);
      return li;
    });
    var active = -1;

    function sync() {
      var sel = -1;
      items.forEach(function (li, i) {
        var on = li.dataset.value === inputWhy.value;
        li.setAttribute('aria-selected', String(on));
        if (on) sel = i;
      });
      txt.textContent = sel >= 0 ? items[sel].firstChild.textContent : placeholder;
      txt.classList.toggle('placeholder', sel < 0);
    }
    function setActive(i) {
      active = i;
      items.forEach(function (li, j) { li.classList.toggle('active', j === i); });
      if (i >= 0) {
        btn.setAttribute('aria-activedescendant', items[i].id);
        items[i].scrollIntoView({ block: 'nearest' });
      } else {
        btn.removeAttribute('aria-activedescendant');
      }
    }
    function isOpen() { return !list.hidden; }
    function open() {
      list.hidden = false;
      root.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      root.classList.remove('up');
      var dlg = document.getElementById('bookingDialog').getBoundingClientRect();
      var b = btn.getBoundingClientRect();
      var below = dlg.bottom - b.bottom;
      var above = b.top - dlg.top;
      if (below < list.offsetHeight + 12 && above > below) root.classList.add('up');
      var cur = items.findIndex(function (li) { return li.getAttribute('aria-selected') === 'true'; });
      setActive(cur >= 0 ? cur : 0);
    }
    function close() {
      list.hidden = true;
      root.classList.remove('open', 'up');
      btn.setAttribute('aria-expanded', 'false');
      setActive(-1);
    }
    function choose(i) {
      inputWhy.value = items[i].dataset.value;
      sync();
      close();
      inputWhy.dispatchEvent(new Event('change'));
      btn.focus();
    }

    btn.addEventListener('click', function () { if (isOpen()) close(); else open(); });
    btn.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault();
        if (!isOpen()) { open(); return; }
        setActive((active + (k === 'ArrowDown' ? 1 : -1) + items.length) % items.length);
      } else if (k === 'Home' || k === 'End') {
        if (!isOpen()) return;
        e.preventDefault();
        setActive(k === 'Home' ? 0 : items.length - 1);
      } else if (k === 'Enter' || k === ' ') {
        e.preventDefault();
        if (isOpen()) choose(active); else open();
      } else if (k === 'Escape' && isOpen()) {
        e.stopPropagation();
        close();
      } else if (k === 'Tab' && isOpen()) {
        close();
      }
    });
    items.forEach(function (li, i) {
      li.addEventListener('mousemove', function () { if (active !== i) setActive(i); });
      li.addEventListener('click', function () { choose(i); });
    });
    document.addEventListener('click', function (e) { if (isOpen() && !root.contains(e.target)) close(); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay && isOpen()) close(); });

    sync();
    return function () { close(); sync(); };
  })();

  function openBooking(presetWhy) {
    state = { urgent: false, wk: 0, di: 0, slot: null, termLabel: '' };
    inputName.value = '';
    inputPhone.value = '';
    inputWhy.value = presetWhy || '';
    inputDesc.value = '';
    syncWhy();
    formView.hidden = false;
    doneView.hidden = true;
    setUrgent(false);
    renderCalendar();
    renderSlots();
    updateFooter();
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { inputName.focus(); }, 50);
  }
  function closeBooking() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-booking]').forEach(function (btn) {
    btn.addEventListener('click', function () { openBooking(btn.getAttribute('data-why')); });
  });
  document.getElementById('bookingCloseBtn').addEventListener('click', closeBooking);
  document.getElementById('doneCloseBtn').addEventListener('click', closeBooking);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeBooking(); });

  confirmBtn.addEventListener('click', function () {
    if (confirmBtn.disabled) return;
    var why = state.urgent ? 'Hitan pregled' : inputWhy.value;
    var first = inputName.value.trim().split(' ')[0];
    document.getElementById('doneTitle').textContent = first ? ('Hvala, ' + first + '.') : 'Hvala.';
    document.getElementById('doneText').textContent = 'Vaš termin je uspješno rezervisan: ' + state.termLabel + ' · ' + why + '.';
    formView.hidden = true;
    doneView.hidden = false;
  });

  /* ---------- Escape key closes modal/menu/lightbox ---------- */
  window.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!lightbox.hidden) { closeLightbox(); return; }
    if (!overlay.hidden) { closeBooking(); return; }
    if (!mobileMenu.hidden) { setMenu(false); return; }
  });
  window.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });
})();
