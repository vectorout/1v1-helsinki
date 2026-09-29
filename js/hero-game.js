/* Optional hero game. Independent of the site's animation libraries. */
(function () {
  'use strict';
  var targets = { tl: { x: 104, y: 85 }, tr: { x: 336, y: 85 }, bl: { x: 104, y: 174 }, br: { x: 336, y: 174 } };
  function keeperAt(elapsed, shot) {
    return { x: 220 + Math.sin(elapsed / 620 + shot * 1.7) * 112, y: 130 + Math.sin(elapsed / 870 + shot) * 25 };
  }
  function createRound() {
    return {
      phase: 'idle', shots: 0, score: 0,
      start: function () { this.phase = 'aim'; this.shots = 0; this.score = 0; },
      shoot: function (corner, keeper) {
        if (this.phase !== 'aim' || !targets[corner]) return null;
        var t = targets[corner];
        var goal = Math.pow((t.x - keeper.x) / 118, 2) + Math.pow((t.y - keeper.y) / 100, 2) > 1;
        this.shots += 1; this.score += goal ? 1 : 0; this.phase = 'result';
        return goal;
      },
      advance: function () { if (this.phase === 'result') this.phase = this.shots === 3 ? 'done' : 'aim'; }
    };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { createRound: createRound, keeperAt: keeperAt };
  if (typeof document === 'undefined') return;
  var card = document.querySelector('[data-hero-game]');
  if (!card) return;
  var fi = document.documentElement.lang === 'fi';
  var words = fi ? {
    start: 'Aloita peli', next: 'Seuraava laukaus', replay: 'Pelaa uudelleen', pause: 'Tauko', resume: 'Jatka',
    idle: 'Kolme laukausta. Löydä vapaa kulma.', aim: 'Seuraa maalivahtia. Valitse vapaa kulma.', static: 'Valitse maalivahdista kauimpana oleva kulma.',
    goal: 'Maali. Hyvin sijoitettu.', save: 'Torjunta. Kokeile vapaata kulmaa.', paused: 'Peli tauolla.',
    end: function (n) { return 'Maalit: ' + n + '/3. Vielä yksi kierros?'; }, shot: 'Laukaus', ready: 'Valmiina', shooting: 'Laukaus…'
  } : {
    start: 'Start challenge', next: 'Next shot', replay: 'Play again', pause: 'Pause', resume: 'Resume',
    idle: 'Three shots. Find the open corner.', aim: 'Watch the keeper. Pick an open corner.', static: 'Pick the corner furthest from the keeper.',
    goal: 'Goal. Nicely placed.', save: 'Saved. Look for the open corner.', paused: 'Challenge paused.',
    end: function (n) { return n + '/3 goals. Fancy another round?'; }, shot: 'Shot', ready: 'Ready', shooting: 'Taking the shot…'
  };
  var round = createRound();
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var status = card.querySelector('[data-game-status]');
  var count = card.querySelector('[data-game-count]');
  var action = card.querySelector('[data-game-action]');
  var pause = card.querySelector('[data-game-pause]');
  var buttons = Array.from(card.querySelectorAll('[data-corner]'));
  var keeper = card.querySelector('[data-keeper]');
  var ball = card.querySelector('[data-ball]');
  var trail = card.querySelector('[data-trail]');
  var dots = Array.from(card.querySelectorAll('[data-shot-dot]'));
  var raf = 0, lastTime = 0, elapsed = 0, shotTime = 0, paused = false, visible = true, shot = null;
  var keeperPos = keeperAt(0, 0);
  function setKeeper(p) { keeperPos = p; keeper.setAttribute('transform', 'translate(' + p.x + ' ' + (p.y - 130) + ')'); }
  function placeBall(x, y, scale) { ball.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + scale + ')'); }
  function resetVisual() {
    shot = null; shotTime = 0; trail.setAttribute('d', ''); placeBall(220, 292, 1);
    card.removeAttribute('data-outcome');
    setKeeper(motion.matches ? keeperAt(760, round.shots) : keeperAt(elapsed, round.shots));
  }
  function paint() {
    var aiming = round.phase === 'aim';
    buttons.forEach(function (button) { button.disabled = !aiming || paused; });
    pause.hidden = !aiming || motion.matches;
    pause.textContent = paused ? words.resume : words.pause;
    action.disabled = !!shot;
    action.hidden = aiming;
    action.textContent = round.phase === 'idle' ? words.start : round.phase === 'done' || round.shots === 3 ? words.replay : words.next;
    count.textContent = round.phase === 'idle' ? words.ready : words.shot + ' ' + Math.min(round.shots + (aiming ? 1 : 0), 3) + '/3';
    card.dataset.phase = round.phase;
    if (aiming) status.textContent = paused ? words.paused : motion.matches ? words.static : words.aim;
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; lastTime = 0; }
  function sync() {
    stop();
    if (!document.hidden && visible && !motion.matches && !paused && (round.phase === 'aim' || shot)) raf = requestAnimationFrame(frame);
  }
  function finishShot() {
    var result = shot.goal;
    var origin = shot.origin;
    dots[round.shots - 1].dataset.result = result ? 'goal' : 'save';
    dots[round.shots - 1].textContent = result ? '●' : '×';
    card.dataset.outcome = result ? 'goal' : 'save';
    status.textContent = round.shots === 3 ? words.end(round.score) : result ? words.goal : words.save;
    shot = null;
    if (round.shots === 3) round.advance();
    paint();
    if (document.activeElement === origin || document.activeElement === document.body) action.focus({ preventScroll: true });
  }
  function frame(time) {
    raf = 0;
    var dt = lastTime ? Math.min(time - lastTime, 50) : 0; lastTime = time;
    if (shot) {
      shotTime += dt;
      var t = Math.min(shotTime / 620, 1), u = 1 - t;
      var end = shot.end;
      var x = u * u * 220 + 2 * u * t * (end.x + 45) + t * t * end.x;
      var y = u * u * 292 + 2 * u * t * 105 + t * t * end.y;
      placeBall(x, y, 1 - t * 0.48);
      trail.setAttribute('d', 'M220 292 Q' + (end.x + 45) + ' 105 ' + x + ' ' + y);
      var lean = Math.sin(t * Math.PI / 2);
      setKeeper({ x: shot.keeper.x + (shot.end.x - shot.keeper.x) * lean * (shot.goal ? 0.3 : 0.78), y: shot.keeper.y });
      if (t === 1) { finishShot(); stop(); return; }
    } else { elapsed += dt; setKeeper(keeperAt(elapsed, round.shots)); }
    raf = requestAnimationFrame(frame);
  }
  action.addEventListener('click', function () {
    if (shot) return;
    if (round.phase === 'idle' || round.phase === 'done') {
      round.start(); elapsed = 0;
      dots.forEach(function (dot) { dot.removeAttribute('data-result'); dot.textContent = '○'; });
    } else round.advance();
    paused = false; resetVisual(); paint(); sync(); buttons[0].focus({ preventScroll: true });
  });
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (paused || shot) return;
      var goal = round.shoot(button.dataset.corner, keeperPos);
      if (goal === null) return;
      shot = { goal: goal, origin: button, end: targets[button.dataset.corner], keeper: { x: keeperPos.x, y: keeperPos.y } };
      shotTime = 0; status.textContent = words.shooting; paint();
      if (motion.matches) { placeBall(shot.end.x, shot.end.y, 0.52); finishShot(); } else sync();
    });
  });
  pause.addEventListener('click', function () { paused = !paused; paint(); sync(); });
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', function () { if (motion.matches) paused = false; if (motion.matches && shot) finishShot(); if (!shot) resetVisual(); paint(); sync(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.1 }).observe(card);
  }
  window.addEventListener('pagehide', stop);
  window.addEventListener('pageshow', sync);
  status.textContent = words.idle;
  resetVisual(); paint(); card.classList.add('is-ready'); card.closest('.hero').classList.add('has-hero-game');
})();
