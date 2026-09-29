/* Native fullscreen when available; a modal play view on mobile Safari. */
(function () {
  'use strict';
  var host = document.querySelector('[data-hero-games]');
  if (!host || !window.HTMLDialogElement) return;
  var button = host.querySelector('[data-game-fullscreen]');
  if (!button) return;
  var fi = document.documentElement.lang === 'fi';
  var dialog = document.createElement('dialog');
  dialog.className = 'hg-fullscreen-dialog';
  dialog.setAttribute('aria-label', fi ? 'Jalkapallopelit' : 'Football games');
  dialog.setAttribute('data-lenis-prevent', '');
  document.body.appendChild(dialog);
  var placeholder, open = false, nativeActive = false, previousOverflow, previousFocus;
  function finishClose() {
    if (!open) return;
    open = false; nativeActive = false;
    host.classList.remove('is-fullscreen');
    placeholder.replaceWith(host);
    dialog.close();
    document.documentElement.style.overflow = previousOverflow;
    button.textContent = fi ? 'Koko näyttö' : 'Full screen';
    button.setAttribute('aria-expanded', 'false');
    if (previousFocus && previousFocus.isConnected) previousFocus.focus({preventScroll:true});
  }
  async function close() {
    if (document.fullscreenElement === host) {
      button.disabled = true;
      try { await document.exitFullscreen(); } catch (_) { /* Keep the exit control available if native exit fails. */ }
      button.disabled = false;
      if (document.fullscreenElement === host) return;
    }
    finishClose();
  }
  async function enter() {
    if (open) return;
    previousFocus = document.activeElement;
    previousOverflow = document.documentElement.style.overflow;
    placeholder = document.createElement('div');
    placeholder.style.height = host.getBoundingClientRect().height + 'px';
    host.before(placeholder);
    dialog.appendChild(host);
    open = true;
    host.classList.add('is-fullscreen');
    document.documentElement.style.overflow = 'hidden';
    button.textContent = fi ? 'Poistu koko näytöstä' : 'Exit full screen';
    button.setAttribute('aria-expanded', 'true');
    dialog.showModal();
    button.focus({preventScroll:true});
    if (host.requestFullscreen) {
      button.disabled = true;
      try {
        await host.requestFullscreen();
        if (!open && document.fullscreenElement === host) await document.exitFullscreen();
      } catch (_) { /* The dialog remains the screen-filling fallback. */ }
      finally { button.disabled = false; }
    }
  }
  button.hidden = false;
  button.addEventListener('click', function () { if (open) close(); else enter(); });
  dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });
  document.addEventListener('fullscreenchange', function () {
    if (document.fullscreenElement === host) nativeActive = true;
    else if (nativeActive) finishClose();
  });
  host.addEventListener('keydown', function (e) {
    if (open && e.key === 'Escape') { e.preventDefault(); close(); }
  });
  host.addEventListener('click', async function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!open || !link) return;
    e.preventDefault(); e.stopPropagation();
    await close();
    if (!open) link.click();
  }, true);
})();
