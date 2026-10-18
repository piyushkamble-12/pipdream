/*
 * Pip's Dream Desk · JavaScript controller
 * Vanilla JS only. No API keys, trackers, database or frameworks.
 * All audio begins in response to an explicit user action.
 */
(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isFinePointer = window.matchMedia('(pointer: fine)');

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (_) { /* Private browsing: no persistence. */ }
  }
  function restore(key) {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  }

  // Pip's Living Personality System
  const pip = $('#pip-character');
  const pipGreeting = $('#pip-greeting');
  const greetings = [
    '*tiny sleepy wave* ♡',
    'Oh! A visitor! ☁',
    'I saved you a star! ✧',
    'Pip is very happy to see you.',
    'The clouds are so soft today! ☁',
    'Welcome to my little workshop! ✳'
  ];
  let greetingIndex = 0;
  let lastPipReactionTime = 0;

  function pipReact(message, action = 'wave') {
    if (!pipGreeting || !pip) return;
    const now = performance.now();
    // Allow immediate reaction for milestones, but avoid rapid flicker
    if (now - lastPipReactionTime < 400) return;
    lastPipReactionTime = now;

    pipGreeting.textContent = message;
    pipGreeting.classList.remove('is-active');
    void pipGreeting.offsetWidth;
    pipGreeting.classList.add('is-active');

    if (!prefersReducedMotion.matches) {
      pip.classList.remove('is-waving');
      void pip.offsetWidth;
      pip.classList.add('is-waving');
    }
  }
  window.pipReact = pipReact;

  if (isFinePointer.matches && !prefersReducedMotion.matches && pip) {
    pip.addEventListener('pointermove', (event) => {
      const box = pip.getBoundingClientRect();
      const offset = (event.clientX - box.left - box.width / 2) / box.width;
      pip.style.setProperty('--look-x', `${Math.max(-5, Math.min(5, offset * 10)).toFixed(1)}deg`);
    }, { passive: true });
    pip.addEventListener('pointerleave', () => pip.style.setProperty('--look-x', '0deg'));
  }

  if (pip) {
    pip.addEventListener('click', () => {
      const text = greetings[greetingIndex++ % greetings.length];
      pipReact(text);
    });
  }

  // Three persistent lantern moods. The header still toggles light/night,
  // while Pip's lantern cycles through all three choices.
  const themeButton = $('#theme-toggle');
  const lanternButton = $('#lantern-button');
  const moodButtons = [...document.querySelectorAll('[data-mood-option]')];
  const moods = ['sunset', 'lavender', 'midnight'];
  const moodNames = { sunset: 'Warm sunset', lavender: 'Moonlit lavender', midnight: 'Midnight blue' };
  const moodLines = {
    sunset: 'Pip warmed the room with a pocketful of sunset. ☀',
    lavender: 'Lavender moonbeams are floating around your pillow. ✧',
    midnight: 'The whole nursery is tucked under midnight blue. ☾'
  };
  const moodReactions = {
    sunset: 'Warm sunset! Just like a cozy afternoon nap. ☀',
    lavender: 'Ooh, lavender moonbeams! My favorite. ✧',
    midnight: 'Midnight blue... perfect for catching shooting stars. ☾'
  };

  const storedMood = restore('pip_lighting_mood');
  let mood = moods.includes(storedMood) ? storedMood : (restore('pip_dream_mode') === 'true' ? 'midnight' : 'sunset');
  let lastNightMood = mood === 'sunset' ? 'lavender' : mood;

  function syncTheme() {
    document.body.dataset.mood = mood;
    document.body.classList.toggle('dream-mode', mood !== 'sunset');
    const isNight = mood !== 'sunset';
    themeButton.setAttribute('aria-pressed', String(isNight));
    $('#theme-icon').textContent = isNight ? '☀' : '☾';
    $('#theme-label').textContent = isNight ? 'Sunset mode' : 'Dream mode';
    lanternButton.setAttribute('aria-pressed', String(isNight));
    $('#lantern-label').textContent = 'Try the next glow';
    $('#lantern-status').textContent = moodLines[mood];
    const miniature = $('.lantern-miniature');
    if (miniature) miniature.dataset.mood = mood;
    moodButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.moodOption === mood)));
    const metaTheme = $('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', mood === 'sunset' ? '#fff8f1' : mood === 'lavender' ? '#312c4d' : '#1b2942');
    }
  }

  function setMood(next, announcePip = true) {
    if (!moods.includes(next)) return;
    const previousMood = mood;
    mood = next;
    if (announcePip && previousMood !== next) {
      window.dispatchEvent(new CustomEvent('pip:milestone', { detail: { step: 'lantern' } }));
    }
    if (next !== 'sunset') lastNightMood = next;
    store('pip_lighting_mood', next);
    store('pip_dream_mode', String(next !== 'sunset'));
    syncTheme();
    if (announcePip) {
      pipReact(moodReactions[next]);
    }
  }

  themeButton.addEventListener('click', () => setMood(mood === 'sunset' ? lastNightMood : 'sunset'));
  lanternButton.addEventListener('click', () => setMood(moods[(moods.indexOf(mood) + 1) % moods.length]));
  moodButtons.forEach(button => button.addEventListener('click', () => setMood(button.dataset.moodOption)));
  syncTheme();

  // Web Audio: short click chimes + a playable, stoppable music-box tune.
  // The master gain makes muting instantaneous, even for scheduled notes.
  const soundButton = $('#sound-toggle');
  const lullabyButton = $('#lullaby-button');
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  let soundOn = false;
  let audio = null;
  let master = null;
  let melodyPlaying = false;
  let melodyResetId = null;
  const voices = new Set();
  let customPlaying = false;
  let customPlaybackTimer = null;
  let replayTimers = [];
  const recorded = [];
  const noteFrequencies = { C: 523.25, D: 587.33, E: 659.25, F: 698.46, G: 783.99, A: 880 };
  const customPlayButton = $('#play-custom');
  const customResetButton = $('#reset-custom');
  const composeStatus = $('#compose-status');

  function audioReady() {
    if (!AudioContextType) return false;
    if (!audio || audio.state === 'closed') {
      audio = new AudioContextType();
      master = audio.createGain();
      master.gain.value = soundOn ? 0.56 : 0;
      master.connect(audio.destination);
    }
    if (audio.state === 'suspended') {
      audio.resume().catch(() => {
        composeStatus.textContent = 'Audio was blocked. Try Sound on again.';
      });
    }
    return true;
  }

  function syncSound() {
    soundButton.setAttribute('aria-pressed', String(soundOn));
    $('#sound-icon').textContent = soundOn ? '♬' : '♫';
    $('#sound-label').textContent = soundOn ? 'Sound on' : 'Sound off';
    if (master && audio) master.gain.setTargetAtTime(soundOn ? 0.56 : 0, audio.currentTime, 0.012);
  }

  function tone(freq, startAfter = 0, length = 0.15, volume = 0.05) {
    if (!soundOn || !audioReady()) return;
    const startAt = audio.currentTime + startAfter;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), startAt + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + length);
    osc.connect(gain).connect(master);
    voices.add(osc);
    osc.onended = () => {
      voices.delete(osc);
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(startAt);
    osc.stop(startAt + length + 0.02);
  }

  function stopMelody(message) {
    if (melodyResetId !== null) clearTimeout(melodyResetId);
    melodyResetId = null;
    for (const osc of [...voices]) {
      try { osc.stop(); } catch (_) { /* Oscillator may have finished already. */ }
    }
    melodyPlaying = false;
    lullabyButton.setAttribute('aria-pressed', 'false');
    $('#lullaby-icon').textContent = '♫';
    $('#lullaby-label').textContent = 'Play my lullaby';
    $('.project-pink .project-visual').classList.remove('is-playing');
    if (message) $('#lullaby-status').textContent = message;
  }

  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    if (soundOn && !audioReady()) {
      soundOn = false;
      $('#lullaby-status').textContent = 'This browser does not support Web Audio.';
    }
    syncSound();
    if (!soundOn) {
      if (melodyPlaying) stopMelody('Muted. The music box is resting.');
      if (customPlaying) stopCustomPlayback('The little melody is resting. Sound is off.');
    } else if (soundOn) {
      tone(880, 0, 0.16, 0.027);
    }
  });
  syncSound();

  const melody = [
    [523.25, 0.0, 0.45], [659.25, 0.38, 0.35], [783.99, 0.76, 0.55],
    [698.46, 1.36, 0.35], [659.25, 1.75, 0.42], [587.33, 2.2, 0.4],
    [523.25, 2.66, 0.75], [392.00, 3.35, 0.5], [440.00, 3.87, 0.38],
    [523.25, 4.30, 0.48], [659.25, 4.83, 0.4], [587.33, 5.3, 0.46],
    [523.25, 5.82, 0.85]
  ];

  lullabyButton.addEventListener('click', () => {
    if (customPlaying) stopCustomPlayback();
    if (melodyPlaying) {
      stopMelody('The music box is tucked in. ♡');
      return;
    }
    if (!soundOn) {
      $('#lullaby-status').textContent = 'Please turn sound on in the header before playing Pip’s lullaby. ♫';
      return;
    }
    if (!audioReady()) {
      soundOn = false;
      syncSound();
      $('#lullaby-status').textContent = 'Audio is unavailable in this browser.';
      return;
    }
    syncSound();
    melodyPlaying = true;
    lullabyButton.setAttribute('aria-pressed', 'true');
    $('#lullaby-icon').textContent = 'Ⅱ';
    $('#lullaby-label').textContent = 'Stop the lullaby';
    $('#lullaby-status').textContent = '♪ Listen! My favorite sleepy melody...';
    $('.project-pink .project-visual').classList.add('is-playing');
    pipReact('♪ Listen! My favorite sleepy melody...');
    melody.forEach(([frequency, delay, length]) => tone(frequency, delay, length, 0.054));
    melodyResetId = setTimeout(() => {
      stopMelody('♫ The little lullaby has finished.');
      pipReact('The stars are fast asleep now. ♡');
    }, 7000);
  });

  // Hand-playable six-key music box with animated playback highlights
  function clearReplayTimers() {
    replayTimers.forEach(t => clearTimeout(t));
    replayTimers = [];
    document.querySelectorAll('.note-key').forEach(k => k.classList.remove('is-sounding'));
    document.querySelectorAll('.recorded-chip').forEach(c => c.classList.remove('is-playing'));
  }

  function drawRecorded() {
    const panel = $('#recorded-notes');
    panel.replaceChildren();
    if (recorded.length === 0) {
      const hint = document.createElement('span');
      hint.className = 'empty-melody-hint';
      hint.textContent = 'Your melody is an empty little page.';
      panel.appendChild(hint);
      panel.classList.remove('is-full');
    } else {
      recorded.forEach((note, index) => {
        const chip = document.createElement('span');
        chip.className = 'recorded-chip';
        chip.textContent = note;
        chip.setAttribute('aria-label', `Note ${index + 1}: ${note}`);
        panel.appendChild(chip);
      });
      if (recorded.length >= 12) {
        panel.classList.add('is-full');
      } else {
        panel.classList.remove('is-full');
      }
    }
    customPlayButton.disabled = recorded.length === 0;
    customResetButton.disabled = recorded.length === 0;
    document.querySelectorAll('.note-key').forEach(button => {
      button.disabled = recorded.length >= 12;
    });
  }

  function stopCustomPlayback(message = '') {
    if (customPlaybackTimer !== null) clearTimeout(customPlaybackTimer);
    customPlaybackTimer = null;
    clearReplayTimers();
    if (customPlaying) {
      for (const osc of [...voices]) {
        try { osc.stop(); } catch (_) {}
      }
    }
    customPlaying = false;
    customPlayButton.textContent = '▶ Replay yours';
    customPlayButton.setAttribute('aria-pressed', 'false');
    if (message) composeStatus.textContent = message;
  }

  function triggerNoteVisual(note) {
    const btn = document.querySelector(`.note-key[data-note="${note}"]`);
    if (btn) {
      btn.classList.add('is-sounding');
      setTimeout(() => btn.classList.remove('is-sounding'), 260);
    }
  }

  document.querySelectorAll('.note-key').forEach(button => button.addEventListener('click', () => {
    if (recorded.length >= 12) return;
    if (customPlaying) stopCustomPlayback();
    if (melodyPlaying) stopMelody('Pip put the original lullaby away for now.');
    const note = button.dataset.note;
    recorded.push(note);
    tone(noteFrequencies[note], 0, 0.28, 0.04);
    triggerNoteVisual(note);
    drawRecorded();

    if (recorded.length === 1) {
      pipReact('Ooh, a lovely first note! ♫');
    } else if (recorded.length === 12) {
      pipReact('Your music box is full of starlight! Replay it! ♡');
    }

    composeStatus.textContent = recorded.length >= 12
      ? '★ All 12 notes filled! Press Replay to listen or Start fresh. ♡'
      : `${note} added (${recorded.length}/12). ${soundOn ? 'Lovely!' : 'Turn Sound on to hear your notes.'}`;
  }));

  customPlayButton.addEventListener('click', () => {
    if (customPlaying) return stopCustomPlayback('Your little song has stopped. ♡');
    if (!recorded.length) {
      composeStatus.textContent = 'Pick a note first.';
      return;
    }
    if (!soundOn) {
      composeStatus.textContent = 'Turn Sound on in the header to hear your melody.';
      soundButton.focus();
      return;
    }
    if (!audioReady()) {
      composeStatus.textContent = 'Web Audio is unavailable here.';
      return;
    }
    if (melodyPlaying) stopMelody();
    customPlaying = true;
    customPlayButton.textContent = '■ Stop replay';
    customPlayButton.setAttribute('aria-pressed', 'true');
    composeStatus.textContent = `Pip is playing your ${recorded.length}-note lullaby. ♫`;

    clearReplayTimers();
    recorded.forEach((note, index) => {
      tone(noteFrequencies[note], index * 0.34, 0.31, 0.045);
      const timer = setTimeout(() => {
        triggerNoteVisual(note);
        const chips = document.querySelectorAll('.recorded-chip');
        if (chips[index]) {
          chips[index].classList.add('is-playing');
          setTimeout(() => chips[index].classList.remove('is-playing'), 280);
        }
      }, index * 340);
      replayTimers.push(timer);
    });

    customPlaybackTimer = setTimeout(() => {
      stopCustomPlayback('♫ Your own little lullaby finished.');
      if (recorded.length >= 3) {
        window.dispatchEvent(new CustomEvent('pip:milestone', { detail: { step: 'melody' } }));
      }
      pipReact('What a sweet lullaby! You are a natural dream engineer. ♡');
    }, recorded.length * 340 + 380);
  });

  customResetButton.addEventListener('click', () => {
    stopCustomPlayback();
    recorded.length = 0;
    drawRecorded();
    composeStatus.textContent = 'Fresh page! Pip kept his original lullaby above, ready to play. ♡';
  });
  drawRecorded();

  // Keyboard shortcut support for composing music box notes
  window.addEventListener('keydown', (event) => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
        event.isComposing || event.repeat) return;
    const focused = document.activeElement;
    // Do not interpret letters as music when users operate links, buttons,
    // radio options, or editable regions with their keyboard.
    if (focused && (focused.isContentEditable ||
        (typeof focused.closest === 'function' && focused.closest(
          'a[href], button, input, textarea, select, summary, [contenteditable], ' +
          '[role="button"], [role="link"], [role="textbox"], [role="combobox"]'
        )))) return;
    const keyMap = {
      'c': 'C', 'C': 'C', '1': 'C',
      'd': 'D', 'D': 'D', '2': 'D',
      'e': 'E', 'E': 'E', '3': 'E',
      'f': 'F', 'F': 'F', '4': 'F',
      'g': 'G', 'G': 'G', '5': 'G',
      'a': 'A', 'A': 'A', '6': 'A'
    };
    const note = keyMap[event.key];
    if (note) {
      const keyBtn = document.querySelector(`.note-key[data-note="${note}"]`);
      if (keyBtn && !keyBtn.disabled) {
        keyBtn.click();
      }
    }
  });

  // Gentle optional sounds for other controls, using the SAME mute switch.
  document.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || button === soundButton || button === lullabyButton || button === customPlayButton || button === customResetButton || button.classList.contains('note-key')) return;
    tone(660, 0, 0.09, 0.014);
  });

  // Privacy-friendly returning visitor greeting
  const hasVisited = restore('pip_has_visited') === 'true';
  const visitorNote = $('#visitor-note');
  if (visitorNote) {
    visitorNote.textContent = hasVisited
      ? '♡ Welcome back, dream explorer. Pip saved your little cloud.'
      : '☁ First time here? Pip saved you a little cloud.';
  }
  store('pip_has_visited', 'true');

  // Fine-pointer sparkles
  if (isFinePointer.matches && !prefersReducedMotion.matches) {
    let lastSparkle = 0;
    const characters = ['✧', '✦', '⋆'];
    document.addEventListener('pointermove', (event) => {
      // A user may enable reduced motion *after* the page initially loads.
      if (prefersReducedMotion.matches) return;
      const now = performance.now();
      if (now - lastSparkle < 75) return;
      lastSparkle = now;
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.textContent = characters[Math.floor(Math.random() * characters.length)];
      sparkle.style.left = `${event.clientX}px`;
      sparkle.style.top = `${event.clientY}px`;
      document.body.appendChild(sparkle);
      sparkle.addEventListener('animationend', () => sparkle.remove(), { once: true });
      setTimeout(() => sparkle.remove(), 950);
    }, { passive: true });
  }

  // Story scroll reveal
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    document.body.classList.add('js-reveal');
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    }, { threshold: 0.12 });
    document.querySelectorAll('.story-scene').forEach((scene) => observer.observe(scene));
  }

  // Three distinct SVG trails with interactive destination highlighting
  const routePath = $('#delivery-path');
  const parcel = $('#parcel');
  const routeVisual = $('.route-visual');
  const deliverButton = $('#deliver-button');
  const routeStatus = $('#delivery-status');
  const destinationSelect = $('#delivery-destination');
  const packageSelect = $('#delivery-package');
  const paths = {
    moon: { d: 'M30 231 C110 224 105 68 220 110 S330 85 388 59', label: 'TO THE MOON', person: 'the Moon Nursery' },
    garden: { d: 'M30 231 C125 255 134 156 218 170 S310 204 388 204', label: 'CLOUD GARDEN', person: 'the Cloud Garden' },
    forest: { d: 'M30 231 C90 145 170 249 215 138 S304 77 388 128', label: 'STARLIT FOREST', person: 'the Starlit Forest' }
  };
  const packages = { courage: 'a spoonful of courage', calm: 'quiet, cozy clouds', wonder: 'a pocket of wonder' };
  let routeFrame = null;
  let routeRun = 0;

  function setParcelPoint(point) {
    parcel.setAttribute('transform', `translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`);
  }

  function updateRoute() {
    const destKey = destinationSelect.value;
    const route = paths[destKey];
    routePath.setAttribute('d', route.d);
    $('#route-destination-label').textContent = route.label;
    $('#route-svg-desc').textContent = `A parcel leaves the nursery and travels along the winding trail to ${route.person}.`;
    setParcelPoint(routePath.getPointAtLength(0));
    routeStatus.textContent = `Ready with ${packages[packageSelect.value]} for ${route.person}.`;

    // Highlight active destination node in SVG
    document.querySelectorAll('.dest-node').forEach(node => {
      node.classList.remove('active-dest');
      const halo = node.querySelector('.dest-halo');
      if (halo) halo.setAttribute('opacity', '0');
    });
    const activeNode = $(`#dest-${destKey}`);
    if (activeNode) {
      activeNode.classList.add('active-dest');
      const halo = activeNode.querySelector('.dest-halo');
      if (halo) halo.setAttribute('opacity', '0.45');
    }
  }

  function cancelDelivery() {
    routeRun++;
    if (routeFrame !== null) cancelAnimationFrame(routeFrame);
    routeFrame = null;
    routeVisual.classList.remove('is-flying');
    deliverButton.disabled = false;
    deliverButton.removeAttribute('aria-busy');
  }

  destinationSelect.addEventListener('change', () => { cancelDelivery(); updateRoute(); });
  packageSelect.addEventListener('change', () => { cancelDelivery(); updateRoute(); });

  function deliverDream() {
    cancelDelivery();
    const runId = routeRun;
    const destKey = destinationSelect.value;
    const route = paths[destKey];
    const pack = packages[packageSelect.value];
    const length = routePath.getTotalLength();
    routeVisual.classList.add('is-flying');
    routeStatus.textContent = `✉ Sending ${pack} to ${route.person}...`;
    deliverButton.disabled = true;
    deliverButton.setAttribute('aria-busy', 'true');

    const finish = () => {
      if (routeRun !== runId) return;
      setParcelPoint(routePath.getPointAtLength(length));
      routeVisual.classList.remove('is-flying');
      routeStatus.textContent = `♡ Pip delivered ${pack} to ${route.person}. A little kindness has arrived!`;
      deliverButton.disabled = false;
      deliverButton.removeAttribute('aria-busy');
      routeFrame = null;

      // Arrival animation on destination node
      const activeNode = $(`#dest-${destKey}`);
      if (activeNode) {
        activeNode.classList.add('arrival-pulse');
        setTimeout(() => activeNode.classList.remove('arrival-pulse'), 1400);
      }
      pipReact(`Special delivery arrived safely at ${route.person}! Sleep tight! ✉`);
      window.dispatchEvent(new CustomEvent('pip:milestone', { detail: { step: 'delivery' } }));
    };

    if (prefersReducedMotion.matches) {
      finish();
      return;
    }

    const started = performance.now();
    const duration = 2100;
    function frame(now) {
      if (runId !== routeRun) return;
      const t = Math.min((now - started) / duration, 1);
      const eased = t * t * (3 - 2 * t);
      setParcelPoint(routePath.getPointAtLength(length * eased));
      if (t < 1) routeFrame = requestAnimationFrame(frame);
      else finish();
    }
    routeFrame = requestAnimationFrame(frame);
  }

  deliverButton.addEventListener('click', deliverDream);
  window.addEventListener('pagehide', () => {
    cancelDelivery();
    if (melodyPlaying) stopMelody();
    if (customPlaying) stopCustomPlayback();
    if (audio) audio.close().catch(() => {});
  });
  updateRoute();

  // Sleepy Mailroom: five-stage dream sorting game
  const dreamLetters = [
    { icon: '🔭', title: 'A marshmallow telescope', clue: 'A little owl wants to watch constellations at bedtime.', place: 'rooftop', friend: 'Ollie the owl' },
    { icon: '🫧', title: 'Bubbles made of moonlight', clue: 'A frog has been dreaming of a sparkling lily-pad bath.', place: 'pond', friend: 'Freddie the frog' },
    { icon: '🧸', title: "The world\'s coziest blanket fort", clue: 'A shy mouse wants somewhere warm for a nap.', place: 'nest', friend: 'Mimi the mouse' },
    { icon: '⭐', title: 'A library of shooting stars', clue: 'Our little stargazer lives high above the sleeping town.', place: 'rooftop', friend: 'Ollie the owl' },
    { icon: '🎶', title: 'A tiny lily-pad orchestra', clue: 'A musical friend lives beside the sleepy water.', place: 'pond', friend: 'Freddie the frog' }
  ];
  const toyButtons = Array.from(document.querySelectorAll('.toy-choice'));
  const toyRestart = $('#toy-restart');
  let toyIndex = 0;
  let toyLocked = false;

  function updateToyDots() {
    const dots = document.querySelectorAll('.toy-dot');
    dots.forEach((dot, idx) => {
      dot.classList.remove('active', 'completed');
      if (idx < toyIndex) {
        dot.classList.add('completed');
        dot.textContent = '✓';
      } else if (idx === toyIndex) {
        dot.classList.add('active');
        dot.textContent = String(idx + 1);
      } else {
        dot.textContent = String(idx + 1);
      }
    });
  }

  function drawDream() {
    updateToyDots();
    const dream = dreamLetters[toyIndex];
    $('#toy-progress').textContent = `DREAM ${toyIndex + 1} OF ${dreamLetters.length}`;
    $('#toy-score').textContent = `${toyIndex} ${toyIndex === 1 ? 'dream' : 'dreams'} delivered`;
    $('#toy-icon').textContent = dream.icon;
    $('#toy-title').textContent = dream.title;
    $('#toy-clue').textContent = dream.clue;
    $('#toy-letter').classList.remove('delivered', 'celebrate');
    $('#toy-feedback').textContent = 'Pick a destination to make a delivery.';
    toyButtons.forEach(button => {
      button.hidden = false;
      button.disabled = false;
      button.removeAttribute('aria-disabled');
      button.classList.remove('wobble', 'correct');
    });
    toyRestart.hidden = true;
    toyLocked = false;
  }

  toyButtons.forEach(button => button.addEventListener('click', () => {
    if (toyLocked) return;
    const dream = dreamLetters[toyIndex];
    if (button.dataset.destination !== dream.place) {
      $('#toy-feedback').textContent = 'Not quite! Look at the clue and try another sleepy friend. ♡';
      button.classList.add('wobble');
      setTimeout(() => button.classList.remove('wobble'), 400);
      tone(330, 0, 0.14, 0.018);
      return;
    }
    toyLocked = true;
    button.classList.add('correct');
    $('#toy-letter').classList.add('delivered');
    $('#toy-feedback').textContent = `✦ Delivered to ${dream.friend}!`;
    toyButtons.forEach(choice => { choice.setAttribute('aria-disabled', 'true'); });
    toyIndex += 1;
    updateToyDots();

    if (toyIndex === dreamLetters.length) {
      $('#toy-progress').textContent = 'ALL DREAMS DELIVERED';
      $('#toy-score').textContent = '5 dreams delivered!';
      $('#toy-letter').classList.add('celebrate');
      $('#toy-icon').textContent = '★';
      $('#toy-title').textContent = 'Honorary Dream Engineer!';
      $('#toy-clue').textContent = 'All 5 sleepy friends are tucked in with happy dreams. Pip is so proud of you!';
      $('#toy-feedback').textContent = '♡ Mission complete! Pip awards you a golden bedtime star.';
      toyRestart.hidden = false;
      toyRestart.focus();
      tone(880, 0, 0.2, 0.026);
      tone(1174.66, 0.18, 0.28, 0.024);
      pipReact('All five dreams delivered! You are officially an honorary Dream Engineer! ★');
      return;
    }
    setTimeout(drawDream, prefersReducedMotion.matches ? 100 : 700);
  }));

  toyRestart.addEventListener('click', () => {
    toyIndex = 0;
    drawDream();
    toyButtons[0].focus();
  });
  drawDream();

  // Hidden Easter egg: five knocks on the moon with visual meter
  let knocks = 0;
  const knockMeter = $('#knock-meter');
  const secretMoonBtn = $('#secret-moon');

  function updateKnockMeter() {
    if (!knockMeter) return;
    const dots = knockMeter.querySelectorAll('.knock-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('knock-lit', i < knocks);
    });
  }

  secretMoonBtn.addEventListener('click', () => {
    knocks += 1;
    updateKnockMeter();
    secretMoonBtn.classList.remove('is-knocking');
    void secretMoonBtn.offsetWidth;
    secretMoonBtn.classList.add('is-knocking');

    const message = $('#secret-message');
    if (knocks < 5) {
      tone(660 + knocks * 70, 0, 0.12, 0.02);
      const hints = ['Did the moon just wiggle?', 'tap, tap... ✦', 'Something is glowing...', 'Psst. Just one more...'];
      message.textContent = hints[knocks - 1];
      return;
    }

    knocks = 5;
    updateKnockMeter();
    secretMoonBtn.classList.add('unlocked');
    message.textContent = '✦ SECRET UNLOCKED! The moon thinks you are a star. Sweet dreams! ♡';
    tone(880, 0, 0.26, 0.035);
    tone(1174.66, 0.14, 0.35, 0.034);
    pipReact('You found the moon secret! The moon thinks you are a star! ✧');

    setTimeout(() => {
      knocks = 0;
      updateKnockMeter();
      secretMoonBtn.classList.remove('unlocked');
    }, 12000);

    if (prefersReducedMotion.matches) return;
    const layer = $('#confetti-layer');
    const colors = ['#a34063', '#e5af68', '#c6abed', '#ffc1d2', '#fff2cc'];
    for (let i = 0; i < 54; i += 1) {
      const piece = document.createElement('span');
      piece.className = 'confetti-piece';
      piece.style.setProperty('--x', `${Math.random() * 100}%`);
      piece.style.setProperty('--c', colors[i % colors.length]);
      piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 220}px`);
      piece.style.setProperty('--duration', `${2 + Math.random() * 1.6}s`);
      layer.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
      setTimeout(() => piece.remove(), 4000);
    }
  });

  // Image fallback handler
  document.querySelectorAll('.official-asset').forEach((image) => {
    image.addEventListener('error', () => {
      const fallback = image.dataset.fallback;
      if (fallback && !image.dataset.didFallback) {
        image.dataset.didFallback = 'true';
        image.src = fallback;
      }
    });
    if (image.complete && image.naturalWidth === 0 && image.getAttribute('src')) {
      image.dispatchEvent(new Event('error'));
    }
  });
})();
