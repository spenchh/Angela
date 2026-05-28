(() => {
  const cfg = window.BIRTHDAY_CONFIG || {};
  const assets = [
    "assets/capy-watermelon.png",
    "assets/capy-crown.png",
    "assets/capy-party.png",
    "assets/capy-bouquet.png",
    "assets/capy-cake-big.png"
  ];
  const state = {
    page: 0,
    selectedDate: null,
    selectedTime: "",
    score: 0,
    motionReduced: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pages = $$(".page");
  const progress = $(".progress");

  function init() {
    document.body.classList.toggle("reduced-motion", state.motionReduced);
    fillNames();
    makeProgress();
    makeBackgroundCapys();
    setupNavigation();
    setupQuestion();
    setupCursor();
    setupGame();
    setupPhotos();
    setupCalendar();
    setupFinale();
    goToPage(0);
  }

  function fillNames() {
    const name = cfg.friendName || "birthday girl";
    $$('[data-friend-name]').forEach(el => { el.textContent = name; });
  }

  function makeProgress() {
    progress.innerHTML = "";
    pages.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dot";
      dot.setAttribute("aria-label", `Go to page ${i + 1}`);
      dot.addEventListener("click", () => goToPage(i));
      progress.appendChild(dot);
    });
  }

  function setupNavigation() {
    $$('[data-next]').forEach(btn => btn.addEventListener('click', () => goToPage(Math.min(state.page + 1, pages.length - 1))));
    $('#backButton').addEventListener('click', () => goToPage(Math.max(state.page - 1, 0)));
    $('#restartButton').addEventListener('click', () => goToPage(0));
    $('#peekButton').addEventListener('click', () => goToPage(2));
    $('#muteMotion').addEventListener('click', () => {
      state.motionReduced = !state.motionReduced;
      document.body.classList.toggle('reduced-motion', state.motionReduced);
      $('#muteMotion').setAttribute('aria-pressed', String(state.motionReduced));
      $('#muteMotion').textContent = state.motionReduced ? 'motion on' : 'calm mode';
    });
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'ArrowRight') goToPage(Math.min(state.page + 1, pages.length - 1));
      if (e.key === 'ArrowLeft') goToPage(Math.max(state.page - 1, 0));
    });
  }

  function goToPage(index) {
    state.page = index;
    pages.forEach((page, i) => {
      const active = i === index;
      page.classList.toggle('is-active', active);
      page.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    $$('.dot', progress).forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    $('#backButton').style.opacity = index === 0 ? '.38' : '1';
    $('#backButton').disabled = index === 0;
    if (index === 3 && state.score === 0) layoutTokens();
  }

  function makeBackgroundCapys() {
    const bg = $('.capy-background');
    bg.innerHTML = '';
    const count = 12;
    for (let i = 0; i < count; i++) {
      const img = document.createElement('img');
      img.className = 'bg-capy';
      img.src = assets[i % assets.length];
      img.alt = '';
      img.style.left = `${Math.random() * 100}%`;
      img.style.setProperty('--size', `${70 + Math.random() * 120}px`);
      img.style.setProperty('--opacity', `${0.07 + Math.random() * 0.13}`);
      img.style.setProperty('--duration', `${22 + Math.random() * 24}s`);
      img.style.setProperty('--delay', `${-Math.random() * 30}s`);
      img.style.setProperty('--drift', `${(Math.random() * 28 - 14).toFixed(1)}vw`);
      img.style.setProperty('--r1', `${(Math.random() * 26 - 13).toFixed(1)}deg`);
      img.style.setProperty('--r2', `${(Math.random() * 26 - 13).toFixed(1)}deg`);
      bg.appendChild(img);
    }
  }

  function setupCursor() {
    const cursor = $('#capyCursor');
    let raf = null;
    let x = -80, y = -80;
    window.addEventListener('pointermove', (e) => {
      x = e.clientX + 10;
      y = e.clientY + 10;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(-8deg)`;
        raf = null;
      });
    });
    window.addEventListener('pointerleave', () => { cursor.style.opacity = 0; });
    window.addEventListener('pointerenter', () => { cursor.style.opacity = .86; });
  }

  function setupQuestion() {
    const no = $('#noButton');
    const yes = $('#yesButton');
    const zone = $('#answerZone');
    const response = $('#questionResponse');

    const moveNo = () => {
      const zoneRect = zone.getBoundingClientRect();
      const btnRect = no.getBoundingClientRect();
      const maxX = Math.max(12, zoneRect.width - btnRect.width - 12);
      const maxY = Math.max(12, zoneRect.height - btnRect.height - 12);
      const nextX = Math.random() * maxX;
      const nextY = Math.random() * maxY;
      no.style.left = `${nextX}px`;
      no.style.top = `${nextY}px`;
      response.textContent = "The no button has entered witness protection.";
    };

    let rafPending = false;
    zone.addEventListener('pointermove', (e) => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(() => {
        rafPending = false;
        const rect = no.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const distance = Math.hypot(e.clientX - cx, e.clientY - cy);
        if (distance < 125) moveNo();
      });
    });
    no.addEventListener('pointerenter', moveNo);
    no.addEventListener('click', (e) => {
      e.preventDefault();
      moveNo();
    });
    yes.addEventListener('click', () => {
      response.textContent = "Correct answer. Extremely efficient.";
      burstConfetti(18);
      setTimeout(() => goToPage(2), 550);
    });
  }

  function setupGame() {
    $('#resetGame').addEventListener('click', () => layoutTokens(true));
    layoutTokens();
  }

  function layoutTokens(reset = false) {
    const board = $('#gameBoard');
    if (!board) return;
    if (board.children.length && !reset) return;
    board.innerHTML = '';
    state.score = 0;
    $('#scoreLabel').textContent = '0 / 6 collected';
    $('#gameNext').classList.add('hidden');
    for (let i = 0; i < 11; i++) {
      const btn = document.createElement('button');
      btn.className = 'game-token';
      btn.type = 'button';
      btn.style.left = `${8 + Math.random() * 84}%`;
      btn.style.top = `${14 + Math.random() * 72}%`;
      btn.style.setProperty('--token-size', `${52 + Math.random() * 36}px`);
      btn.style.setProperty('--rot', `${Math.random() * 32 - 16}deg`);
      const img = document.createElement('img');
      img.src = assets[i % assets.length];
      img.alt = 'capybara token';
      btn.appendChild(img);
      btn.addEventListener('click', () => collectToken(btn));
      board.appendChild(btn);
    }
  }

  function collectToken(btn) {
    if (btn.classList.contains('found')) return;
    btn.classList.add('found');
    state.score += 1;
    $('#scoreLabel').textContent = `${Math.min(state.score, 6)} / 6 collected`;
    if (state.score >= 6) {
      $('#scoreLabel').textContent = 'quest complete. unreasonable competence.';
      $('#gameNext').classList.remove('hidden');
      burstConfetti(22);
    }
  }

  function setupPhotos() {
    renderPhotoGrid(cfg.personalPhotos || []);
    $('#photoInput').addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []).slice(0, 9);
      const urls = files.map(file => URL.createObjectURL(file));
      renderPhotoGrid(urls, true);
    });
  }

  function renderPhotoGrid(photoUrls = [], isPreview = false) {
    const grid = $('#photoGrid');
    const template = $('#photoCardTemplate');
    grid.innerHTML = '';
    const slots = Math.max(6, photoUrls.length || 0);
    for (let i = 0; i < slots; i++) {
      const node = template.content.firstElementChild.cloneNode(true);
      const frame = $('.photo-frame', node);
      const input = $('.caption-input', node);
      input.value = isPreview ? `memory ${i + 1}` : `caption ${i + 1}`;
      if (photoUrls[i]) {
        frame.innerHTML = '';
        const img = document.createElement('img');
        img.src = photoUrls[i];
        img.alt = `personal photo ${i + 1}`;
        frame.appendChild(img);
      } else {
        frame.querySelector('span').textContent = `photo ${i + 1}`;
      }
      grid.appendChild(node);
    }
  }

  function setupCalendar() {
    makeCalendar();
    makeTimeOptions();
    $('#sendPlan').addEventListener('click', sendPlan);
    $('#copyPlan').addEventListener('click', async () => {
      const message = buildPlanMessage();
      if (!message) return;
      try {
        await navigator.clipboard.writeText(message);
        $('#sendStatus').textContent = 'Copied. The clipboard finally did one useful thing.';
      } catch {
        $('#sendStatus').textContent = 'Could not copy automatically. Select the text after sending instead.';
      }
    });
    $('#calendarInvite').addEventListener('click', downloadCalendarInvite);
  }

  function getStartDate() {
    if (cfg.scheduleStart) {
      const [y,m,d] = cfg.scheduleStart.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const today = new Date();
    today.setHours(0,0,0,0);
    return today;
  }

  function makeCalendar() {
    const grid = $('#calendarGrid');
    grid.innerHTML = '';
    const start = getStartDate();
    const days = Number(cfg.scheduleDays || 21);
    const fmtDow = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
    const fmtMonth = new Intl.DateTimeFormat(undefined, { month: 'short' });
    for (let i = 0; i < days; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const iso = toLocalISODate(date);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'date-tile';
      btn.dataset.date = iso;
      if ([0,6].includes(date.getDay())) btn.classList.add('is-weekend');
      btn.setAttribute('role', 'option');
      btn.setAttribute('aria-selected', 'false');
      btn.innerHTML = `
        <span class="dow">${fmtDow.format(date)}</span>
        <span class="day">${date.getDate()}</span>
        <span class="month">${fmtMonth.format(date)}</span>
      `;
      btn.addEventListener('click', () => selectDate(iso));
      grid.appendChild(btn);
    }
  }

  function makeTimeOptions() {
    const times = ['lunch', 'coffee', 'dinner', 'surprise me'];
    const wrap = $('#timeOptions');
    wrap.innerHTML = '';
    times.forEach(time => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-chip';
      btn.textContent = time;
      btn.addEventListener('click', () => {
        state.selectedTime = time;
        $$('.time-chip').forEach(b => b.classList.toggle('is-selected', b === btn));
        updateSelectedLine();
      });
      wrap.appendChild(btn);
    });
  }

  function selectDate(iso) {
    state.selectedDate = iso;
    $$('.date-tile').forEach(tile => {
      const selected = tile.dataset.date === iso;
      tile.classList.toggle('is-selected', selected);
      tile.setAttribute('aria-selected', String(selected));
    });
    updateSelectedLine();
  }

  function updateSelectedLine() {
    const line = $('#selectedLine');
    if (!state.selectedDate) {
      line.textContent = 'No day picked yet.';
      return;
    }
    const dateText = formatReadableDate(state.selectedDate);
    line.textContent = state.selectedTime ? `${dateText} for ${state.selectedTime}.` : `${dateText}. Pick a time vibe.`;
  }

  function buildPlanMessage() {
    if (!state.selectedDate) {
      $('#sendStatus').textContent = 'Pick a day first. Calendars are needy like that.';
      return '';
    }
    if (!state.selectedTime) {
      $('#sendStatus').textContent = 'Pick a time vibe too.';
      return '';
    }
    const note = $('#planNote').value.trim();
    const idea = randomFrom(cfg.dateIdeas || []);
    const friend = cfg.friendName || 'birthday girl';
    return [
      `${friend} picked a hangout day.`,
      `Date: ${formatReadableDate(state.selectedDate)}`,
      `Time: ${state.selectedTime}`,
      `Idea: ${idea || 'something good'}`,
      note ? `Note: ${note}` : '',
      '',
      `Sent from the capybara birthday site.`
    ].filter(Boolean).join('\n');
  }

  async function sendPlan() {
    const message = buildPlanMessage();
    if (!message) return;
    const status = $('#sendStatus');
    const endpoint = (cfg.formspreeEndpoint || '').trim();
    if (endpoint) {
      status.textContent = 'Sending...';
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            sender: cfg.friendName || 'birthday girl',
            recipient: cfg.senderName || 'Brandon',
            selectedDate: state.selectedDate,
            selectedTime: state.selectedTime,
            note: $('#planNote').value.trim(),
            message
          })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        status.textContent = 'Sent. Brandon has been notified.';
        burstConfetti(24);
        setTimeout(() => goToPage(6), 700);
        return;
      } catch (err) {
        console.warn(err);
        status.textContent = 'Endpoint failed, so opening an email draft instead.';
      }
    }
    openEmailDraft(message);
    status.textContent = 'Email draft opened. She still has to hit send, because spam prevention ruined automatic romance logistics.';
    setTimeout(() => goToPage(6), 900);
  }

  function openEmailDraft(message) {
    const subject = `Birthday hangout plan: ${formatReadableDate(state.selectedDate)}`;
    const to = encodeURIComponent(cfg.recipientEmail || '');
    const href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = href;
  }

  function downloadCalendarInvite() {
    const message = buildPlanMessage();
    if (!message) return;
    const start = new Date(`${state.selectedDate}T${timeToClock(state.selectedTime)}`);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const title = `Hangout with ${cfg.friendName || 'birthday girl'}`;
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Capybara Birthday//Hangout//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@capybara-birthday`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${escapeICS(title)}`,
      `DESCRIPTION:${escapeICS(message)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'capybara-hangout.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    $('#sendStatus').textContent = 'Calendar file downloaded.';
  }

  function setupFinale() {
    $('#confettiButton').addEventListener('click', () => burstConfetti(42));
  }

  function burstConfetti(count = 28) {
    if (state.motionReduced) return;
    const colors = ['#f5c7d3', '#a7cfa0', '#f0bc73', '#c98661', '#f6e6da'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}vw`;
      piece.style.setProperty('--confetti-color', randomFrom(colors));
      piece.style.setProperty('--x-drift', `${Math.random() * 80 - 40}px`);
      piece.style.setProperty('--fall-duration', `${1.25 + Math.random() * 1.25}s`);
      piece.style.borderRadius = Math.random() > .5 ? '999px' : '2px';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2700);
    }
  }

  function toLocalISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function formatReadableDate(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
  }

  function timeToClock(label) {
    const map = { lunch: '12:00:00', coffee: '14:00:00', dinner: '18:30:00', 'surprise me': '12:00:00' };
    return map[label] || '12:00:00';
  }

  function icsDate(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  }

  function escapeICS(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  }

  function randomFrom(arr) {
    if (!arr || !arr.length) return '';
    return arr[Math.floor(Math.random() * arr.length)];
  }

  init();
})();
