/*
 * Pip's Dream Desk — Living Motion
 * Deliberately tiny visual layer; no new dependencies, audio or storage.
 * All interactions work without this file. Reduced-motion users see no
 * decorative animation.
 */
(() => {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const stage = document.querySelector('.hero-stage');
  const dreamForm = document.querySelector('#dream-maker-form');
  const lantern = document.querySelector('.lantern-miniature');
  let pointerFrame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let revealObserver = null;
  const transient = new Set();

  function cleanupTransient(node) {
    transient.delete(node);
    node.remove();
  }

  function scatterNotes(origin, symbols = ['♫', '✧'], amount = 2) {
    if (reduced.matches || transient.size >= 18) return;
    const box = origin.getBoundingClientRect();
    if (!box.width || !box.height) return;

    for (let i = 0; i < amount && transient.size < 18; i++) {
      const mote = document.createElement('span');
      mote.className = 'motion-note-mote';
      mote.textContent = symbols[i % symbols.length];
      mote.setAttribute('aria-hidden', 'true');
      mote.style.left = box.left + box.width * (0.35 + i * .28) + 'px';
      mote.style.top = box.top + 10 + 'px';
      mote.style.setProperty('--float-side', (i % 2 ? 21 : -21) + 'px');
      document.body.appendChild(mote);
      transient.add(mote);
      mote.addEventListener('animationend', () => cleanupTransient(mote), { once: true });
      window.setTimeout(() => cleanupTransient(mote), 1200);
    }
  }

  function restartClass(el, name) {
    if (!el || reduced.matches) return;
    el.classList.remove(name);
    // Restart on direct interaction only, not on every animation frame.
    void el.offsetWidth;
    el.classList.add(name);
  }

  // Pip's desk feels slightly three-dimensional, without parallax scrolling.
  if (stage && finePointer.matches && !reduced.matches) {
    stage.addEventListener('pointermove', event => {
      const r = stage.getBoundingClientRect();
      if (!r.width || !r.height) return;
      pointerX = ((event.clientX - r.left) / r.width - .5) * 15;
      pointerY = ((event.clientY - r.top) / r.height - .5) * 12;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        stage.style.setProperty('--motion-x', pointerX.toFixed(1) + 'px');
        stage.style.setProperty('--motion-y', pointerY.toFixed(1) + 'px');
        pointerFrame = 0;
      });
    }, { passive: true });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--motion-x', '0px');
      stage.style.setProperty('--motion-y', '0px');
    });
  }

  // Animate *in-view* sections once; content is never hidden while waiting.
  if ('IntersectionObserver' in window && !reduced.matches) {
    revealObserver = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('motion-arrived');
        revealObserver.unobserve(entry.target);
      }
    }, { rootMargin: '0px 0px -7% 0px', threshold: .1 });

    document.querySelectorAll(
      '.project-card, .maker-heading, .toybox-panel, .passport-step'
    ).forEach(el => revealObserver.observe(el));
  }

  // Music-box notes are playable already; these tiny notes are only feedback.
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || reduced.matches) return;
    const noteKey = event.target.closest('.note-key');
    if (noteKey && !noteKey.disabled) {
      scatterNotes(noteKey, ['♫', '✦'], 2);
    }
    const modeButton = event.target.closest('[data-mood-option], #lantern-button, #theme-toggle');
    if (modeButton && lantern) {
      // CSS glow follows the real mood change; this simply celebrates it.
      restartClass(lantern, 'motion-awake');
    }
  });

  if (dreamForm) {
    dreamForm.addEventListener('submit', () => {
      window.requestAnimationFrame(() => {
        const result = document.querySelector('#dream-result');
        if (result && !result.hidden) {
          restartClass(result, 'motion-dream-reveal');
          const art = result.querySelector('.dream-art');
          if (art) scatterNotes(art, ['✧', '★', '✦'], 3);
        }
      });
    });
    const another = document.querySelector('#another-dream');
    if (another) another.addEventListener('click', () => {
      window.requestAnimationFrame(() => restartClass(document.querySelector('#dream-result'), 'motion-dream-reveal'));
    });
  }

  // A passport stamp feels like a physical sticker being pressed on paper.
  // This listener remains harmless if the optional Passport feature is absent.
  window.addEventListener('pip:milestone', event => {
    if (reduced.matches) return;
    const step = event.detail && event.detail.step;
    if (!['melody', 'lantern', 'delivery'].includes(step)) return;
    const stamp = document.querySelector('[data-passport-step="' + step + '"] .passport-stamp');
    if (!stamp) return;
    // Passport updates synchronously; animate after its render finishes.
    window.requestAnimationFrame(() => restartClass(stamp, 'motion-new-stamp'));
  });

  function cleanup() {
    if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    if (revealObserver) revealObserver.disconnect();
    for (const node of [...transient]) cleanupTransient(node);
  }
  window.addEventListener('pagehide', cleanup, { once: true });
  if (typeof reduced.addEventListener === 'function') {
    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      if (pointerFrame) window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      if (stage) {
        stage.style.removeProperty('--motion-x');
        stage.style.removeProperty('--motion-y');
      }
      for (const node of [...transient]) cleanupTransient(node);
    });
  }
})();
