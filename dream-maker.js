/* Pip's Dream Maker · deterministic, local-only story composer. No dependencies. */
(() => {
  'use strict';
  const form = document.querySelector('#dream-maker-form');
  if (!form) return;

  // Story ingredients intentionally remain finite: no AI request, API key or upload.
  const ingredients = {
    feeling: {
      cozy: {
        title: 'The Snuggly',
        opening: 'Everything slowed down until even the smallest worry felt as light as a feather.',
        message: 'I stitched a warm corner into this dream, just for you.',
        accent: '#f9a88f'
      },
      adventurous: {
        title: 'The Brave Little',
        opening: 'There was a secret just beyond the next step, and you felt brave enough to follow it.',
        message: 'Being brave can mean taking one tiny step. I believe in yours!',
        accent: '#f3c462'
      },
      peaceful: {
        title: 'The Gentle',
        opening: 'The world grew quiet, as if somebody had turned down the volume of the stars.',
        message: 'You never have to hurry through a nice dream. Take your time.',
        accent: '#c4b5e8'
      }
    },
    destination: {
      moon: {
        title: 'Moonbeam',
        symbol: '☾',
        setting: 'On the moon, silver seas shimmered beneath your slippers, and little craters held cups of glowing cocoa.',
        gift: 'a silver pebble that remembered every kind wish',
        detail: 'a lullaby from the quiet side of the moon',
        skyTop: '#2a2247',
        skyBottom: '#52436f'
      },
      garden: {
        title: 'Cloud Garden',
        symbol: '☁',
        setting: 'In the floating cloud garden, daisy-shaped clouds bloomed above tiny bridges of rainbow mist.',
        gift: 'a seed that grew into a cushion-soft cloud',
        detail: 'the sound of floating flowers opening',
        skyTop: '#3b557c',
        skyBottom: '#7da7bb'
      },
      forest: {
        title: 'Starlit Forest',
        symbol: '✦',
        setting: 'In the starlit forest, sleepy trees hung their brightest constellations from low branches.',
        gift: 'a lantern filled with miniature fireflies',
        detail: 'the leaves whispering a secret goodnight',
        skyTop: '#1b2d42',
        skyBottom: '#3a5455'
      }
    },
    companion: {
      fox: {
        title: 'Little Fox',
        symbol: '🦊',
        name: 'a tiny fox',
        moment: 'A tiny fox offered you its favorite scarf, even though it was only big enough for one ear.',
        ending: 'With your fox curled beside you, you watched the stars blink softly to sleep.'
      },
      star: {
        title: 'Sleepy Star',
        symbol: '⭐',
        name: 'a sleepy star',
        moment: 'A sleepy star floated down into your hands and asked whether it could take a little rest.',
        ending: 'Your little star drifted into your pocket, glowing whenever you needed a friend.'
      },
      dragon: {
        title: 'Baby Dragon',
        symbol: '🐲',
        name: 'a baby dragon',
        moment: 'A baby dragon hiccupped a bubble of golden light and looked terribly proud of itself.',
        ending: 'The dragon gave a tiny yawn and curled up beside you, warm as a fresh bun.'
      }
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const result = $('#dream-result');
  const placeholder = $('#dream-placeholder');
  const actions = $('#maker-result-actions');
  const status = $('#maker-status');
  const titleEl = $('#dream-result-title');
  const storyEl = $('#dream-result-story');
  const pipEl = $('#dream-pip-message');
  const scene = $('#dream-art');
  const visual = $('#dream-art-visual');
  const fallback = $('#dream-copy-fallback');
  const saveBtn = $('#save-dream-card');
  const feelings = ['cozy', 'adventurous', 'peaceful'];
  const destinations = ['moon', 'garden', 'forest'];
  const companions = ['fox', 'star', 'dragon'];
  let currentDream = null;

  function selected() {
    const values = new FormData(form);
    return {
      feeling: values.get('feeling') || 'cozy',
      destination: values.get('destination') || 'moon',
      companion: values.get('companion') || 'fox'
    };
  }

  function buildDream(choice) {
    const f = ingredients.feeling[choice.feeling];
    const d = ingredients.destination[choice.destination];
    const c = ingredients.companion[choice.companion];
    if (!f || !d || !c) return null;
    const title = `${f.title} ${d.title} & the ${c.title}`;
    const story = `${f.opening} ${d.setting} ${c.moment} Together, you found ${d.gift}. You tucked it away, listening to ${d.detail}. ${c.ending}`;
    return {
      ...choice,
      title,
      story,
      message: `A note from Pip: “${f.message} Sweet dreams! ♡”`,
      text: `${title}\n\n${story}\n\n${f.message} — Pip ♡`
    };
  }

  /* Rich local SVG illustration generator for the dream scene */
  function renderSvgScene(choice) {
    const d = choice.destination;
    const c = choice.companion;
    const f = choice.feeling;

    // Background gradients and scenery
    let scenery = '';
    if (d === 'moon') {
      scenery = `
        <defs>
          <linearGradient id="m-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2a2247"/><stop offset="100%" stop-color="#554474"/></linearGradient>
          <radialGradient id="m-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fff8d6" stop-opacity="0.9"/><stop offset="60%" stop-color="#ffeaa7" stop-opacity="0.35"/><stop offset="100%" stop-color="#ffeaa7" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="500" height="240" fill="url(#m-sky)"/>
        <!-- Star cluster -->
        <g fill="#fff6d5" opacity="0.85">
          <circle cx="50" cy="40" r="1.5"/><circle cx="95" cy="70" r="2"/><circle cx="160" cy="35" r="1.2"/>
          <circle cx="230" cy="50" r="2.2"/><circle cx="390" cy="45" r="1.5"/><circle cx="450" cy="80" r="2"/>
          <circle cx="310" cy="85" r="1.2"/><circle cx="70" cy="120" r="1.8"/><circle cx="430" cy="30" r="1.5"/>
          <text x="110" y="48" font-size="11" fill="#ffeaa7">✧</text>
          <text x="270" y="38" font-size="14" fill="#ffeaa7">✦</text>
          <text x="410" y="75" font-size="10" fill="#ffeaa7">✧</text>
        </g>
        <!-- Luminous Crescent Moon -->
        <circle cx="140" cy="75" r="54" fill="url(#m-glow)"/>
        <path d="M125 32 C158 35 180 62 176 96 C172 125 145 146 116 142 C146 138 164 112 160 85 C156 58 135 40 125 32 Z" fill="#fff5d2"/>
        <circle cx="146" cy="68" r="4" fill="#eed9a8" opacity="0.6"/>
        <circle cx="152" cy="88" r="5" fill="#eed9a8" opacity="0.5"/>
        <circle cx="138" cy="105" r="3.5" fill="#eed9a8" opacity="0.6"/>
        <!-- Soft silver sea hill -->
        <path d="M-10 195 Q130 175 260 198 T510 185 L510 245 L-10 245 Z" fill="#6d5a86" opacity="0.85"/>
        <path d="M-10 215 Q180 190 320 212 T510 205 L510 245 L-10 245 Z" fill="#e9dbf0" opacity="0.95"/>
      `;
    } else if (d === 'garden') {
      scenery = `
        <defs>
          <linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3d5a80"/><stop offset="100%" stop-color="#90b4ce"/></linearGradient>
          <linearGradient id="rainbow" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#f8a5c2" stop-opacity="0.7"/><stop offset="35%" stop-color="#f7d794" stop-opacity="0.6"/><stop offset="70%" stop-color="#b8e994" stop-opacity="0.5"/><stop offset="100%" stop-color="#78e08f" stop-opacity="0.6"/></linearGradient>
        </defs>
        <rect width="500" height="240" fill="url(#g-sky)"/>
        <!-- Rainbow mist arc -->
        <path d="M-20 210 Q240 60 520 210" fill="none" stroke="url(#rainbow)" stroke-width="18" opacity="0.75" stroke-linecap="round"/>
        <!-- Floating star sparkles -->
        <g fill="#ffffff" opacity="0.9">
          <circle cx="60" cy="65" r="1.5"/><circle cx="180" cy="50" r="2"/><circle cx="320" cy="60" r="1.8"/><circle cx="440" cy="45" r="1.5"/>
          <text x="80" y="85" font-size="12" fill="#fff9d2">✿</text><text x="210" y="70" font-size="10" fill="#fff9d2">✧</text>
          <text x="350" y="80" font-size="13" fill="#fff9d2">✿</text><text x="440" y="90" font-size="11" fill="#fff9d2">✧</text>
        </g>
        <!-- Fluffy cloud pillows -->
        <g fill="#ffffff" opacity="0.92">
          <circle cx="60" cy="190" r="42"/><circle cx="120" cy="175" r="50"/><circle cx="190" cy="185" r="44"/>
          <circle cx="260" cy="178" r="48"/><circle cx="330" cy="182" r="45"/><circle cx="400" cy="172" r="52"/><circle cx="470" cy="188" r="46"/>
          <rect x="0" y="195" width="500" height="50" fill="#fcf6fa"/>
        </g>
        <!-- Blooming dream flowers -->
        <g fill="#f8a5c2" opacity="0.9">
          <circle cx="90" cy="165" r="5"/><circle cx="160" cy="170" r="4"/><circle cx="230" cy="160" r="5"/>
          <circle cx="430" cy="162" r="5"/><circle cx="470" cy="170" r="4"/>
        </g>
      `;
    } else {
      // Forest
      scenery = `
        <defs>
          <linearGradient id="f-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#192a3e"/><stop offset="100%" stop-color="#2e4a4d"/></linearGradient>
          <radialGradient id="firefly-glow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#fffa65"/><stop offset="100%" stop-color="#fffa65" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="500" height="240" fill="url(#f-sky)"/>
        <!-- Starry canopy -->
        <g fill="#fff" opacity="0.8">
          <circle cx="40" cy="30" r="1.5"/><circle cx="110" cy="45" r="2"/><circle cx="170" cy="25" r="1.2"/>
          <circle cx="260" cy="35" r="2"/><circle cx="350" cy="28" r="1.4"/><circle cx="440" cy="50" r="2.2"/>
          <path d="M40 30 L110 45 L170 25" stroke="#f1f2f6" stroke-width="0.7" fill="none" opacity="0.5"/>
          <text x="210" y="45" font-size="12" fill="#f9ca24">✦</text><text x="390" y="40" font-size="14" fill="#f9ca24">✧</text>
        </g>
        <!-- Distant pine silhouettes -->
        <g fill="#1a343b" opacity="0.75">
          <polygon points="50,220 75,120 100,220"/><polygon points="90,220 115,135 140,220"/>
          <polygon points="170,220 200,110 230,220"/><polygon points="260,220 285,130 310,220"/>
          <polygon points="380,220 410,105 440,220"/><polygon points="430,220 455,125 480,220"/>
        </g>
        <!-- Foreground soft pines & mossy hill -->
        <g fill="#244342" opacity="0.95">
          <polygon points="15,240 45,145 75,240"/><polygon points="120,240 155,130 190,240"/>
          <polygon points="215,240 245,150 275,240"/><polygon points="450,240 480,140 510,240"/>
        </g>
        <path d="M-10 205 Q140 185 270 208 T510 195 L510 245 L-10 245 Z" fill="#a4b07e" opacity="0.9"/>
        <!-- Fireflies -->
        <circle cx="85" cy="140" r="9" fill="url(#firefly-glow)" opacity="0.8"/>
        <circle cx="85" cy="140" r="2.5" fill="#fff"/>
        <circle cx="210" cy="130" r="10" fill="url(#firefly-glow)" opacity="0.85"/>
        <circle cx="210" cy="130" r="2.8" fill="#fff"/>
        <circle cx="430" cy="120" r="8" fill="url(#firefly-glow)" opacity="0.8"/>
        <circle cx="430" cy="120" r="2.2" fill="#fff"/>
      `;
    }

    // Companion vector illustration (centered at bottom right ~ x=330, y=145)
    let compSvg = '';
    if (c === 'fox') {
      compSvg = `
        <g transform="translate(325, 140)" id="comp-fox">
          <!-- Tail -->
          <path d="M-35 35 Q-55 20 -45 5 Q-30 0 -22 25 Z" fill="#e17055"/>
          <path d="M-48 10 Q-55 20 -45 5 Z" fill="#fffaf1"/>
          <!-- Body -->
          <ellipse cx="0" cy="35" rx="28" ry="24" fill="#e17055"/>
          <!-- Little paws -->
          <ellipse cx="-12" cy="52" rx="7" ry="5" fill="#fffaf1"/>
          <ellipse cx="12" cy="52" rx="7" ry="5" fill="#fffaf1"/>
          <!-- Head -->
          <circle cx="0" cy="12" r="23" fill="#e17055"/>
          <!-- Ears -->
          <polygon points="-20,2 -16,-22 -3,2" fill="#d63031"/>
          <polygon points="-16,0 -14,-17 -5,0" fill="#fab1a0"/>
          <polygon points="3,2 16,-22 20,2" fill="#d63031"/>
          <polygon points="5,0 14,-17 16,0" fill="#fab1a0"/>
          <!-- Snout cheeks -->
          <ellipse cx="-9" cy="18" rx="11" ry="9" fill="#fffaf1"/>
          <ellipse cx="9" cy="18" rx="11" ry="9" fill="#fffaf1"/>
          <!-- Little nose -->
          <polygon points="-3,16 3,16 0,20" fill="#2d3436"/>
          <!-- Sleepy curved eyes -->
          <path d="M-14 11 Q-9 16 -4 11" fill="none" stroke="#2d3436" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M4 11 Q9 16 14 11" fill="none" stroke="#2d3436" stroke-width="2.2" stroke-linecap="round"/>
          <!-- Rosy cheeks -->
          <circle cx="-16" cy="20" r="4" fill="#ff7675" opacity="0.6"/>
          <circle cx="16" cy="20" r="4" fill="#ff7675" opacity="0.6"/>
          <!-- Cozy knit scarf -->
          <path d="M-18 25 Q0 33 18 25 Q20 35 16 38 Q0 43 -16 38 Z" fill="#a34063"/>
          <path d="M8 32 L15 50 L5 50 L2 35 Z" fill="#a34063"/>
          <line x1="5" y1="50" x2="15" y2="50" stroke="#fbc531" stroke-width="2"/>
        </g>
      `;
    } else if (c === 'star') {
      compSvg = `
        <g transform="translate(325, 135)" id="comp-star">
          <!-- Warm starlight halo -->
          <circle cx="0" cy="10" r="45" fill="#ffeaa7" opacity="0.4" filter="blur(6px)"/>
          <!-- Chubby 5-point Star Body -->
          <path d="M0 -30 L11 -7 L34 -4 L17 12 L22 35 L0 23 L-22 35 L-17 12 L-34 -4 L-11 -7 Z" fill="#feca57" stroke="#eccc68" stroke-width="2.5" stroke-linejoin="round"/>
          <!-- Sleepy curved eyes -->
          <path d="M-12 6 Q-7 12 -2 6" fill="none" stroke="#574b90" stroke-width="2.4" stroke-linecap="round"/>
          <path d="M2 6 Q7 12 12 6" fill="none" stroke="#574b90" stroke-width="2.4" stroke-linecap="round"/>
          <!-- Gentle smile -->
          <path d="M-3 15 Q0 18 3 15" fill="none" stroke="#574b90" stroke-width="2" stroke-linecap="round"/>
          <!-- Cheeks -->
          <ellipse cx="-13" cy="13" rx="4" ry="2.5" fill="#ff6b81" opacity="0.65"/>
          <ellipse cx="13" cy="13" rx="4" ry="2.5" fill="#ff6b81" opacity="0.65"/>
          <!-- Cute nightcap on top point -->
          <path d="M-6 -22 Q-2 -44 18 -38 Q6 -26 4 -16 Z" fill="#ff7675"/>
          <circle cx="18" cy="-38" r="4.5" fill="#ffffff"/>
        </g>
      `;
    } else {
      // Dragon
      compSvg = `
        <g transform="translate(325, 140)" id="comp-dragon">
          <!-- Wings -->
          <path d="M14 18 Q36 2 32 30 Q22 25 14 24 Z" fill="#fd79a8" opacity="0.85"/>
          <path d="M-14 18 Q-36 2 -32 30 Q-22 25 -14 24 Z" fill="#fd79a8" opacity="0.85"/>
          <!-- Body -->
          <ellipse cx="0" cy="30" rx="26" ry="22" fill="#55efc4"/>
          <!-- Soft belly -->
          <ellipse cx="0" cy="34" rx="16" ry="14" fill="#dff9fb"/>
          <!-- Head -->
          <circle cx="0" cy="10" r="22" fill="#55efc4"/>
          <!-- Little rounded horns -->
          <path d="M-12 -6 Q-16 -22 -6 -16" fill="none" stroke="#ffeaa7" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M12 -6 Q16 -22 6 -16" fill="none" stroke="#ffeaa7" stroke-width="4.5" stroke-linecap="round"/>
          <!-- Sleepy curved eyes -->
          <path d="M-13 8 Q-8 3 -3 8" fill="none" stroke="#2d3436" stroke-width="2.2" stroke-linecap="round"/>
          <path d="M3 8 Q8 3 13 8" fill="none" stroke="#2d3436" stroke-width="2.2" stroke-linecap="round"/>
          <!-- Rosy cheeks -->
          <circle cx="-14" cy="15" r="4" fill="#fd79a8" opacity="0.7"/>
          <circle cx="14" cy="15" r="4" fill="#fd79a8" opacity="0.7"/>
          <!-- Tiny golden spark bubble floating near snout -->
          <circle cx="-25" cy="5" r="7" fill="#ffeaa7" opacity="0.85"/>
          <text x="-25" y="8" font-size="8" text-anchor="middle" fill="#d35400">✦</text>
        </g>
      `;
    }

    // Feeling mood sparkles
    let moodSparkles = '';
    if (f === 'cozy') {
      moodSparkles = `
        <g fill="#ff7675" opacity="0.75">
          <text x="300" y="80" font-size="14">♡</text><text x="370" y="65" font-size="12">♡</text>
        </g>
      `;
    } else if (f === 'adventurous') {
      moodSparkles = `
        <!-- Shooting star -->
        <line x1="280" y1="20" x2="360" y2="60" stroke="#ffeaa7" stroke-width="2" stroke-linecap="round" opacity="0.75"/>
        <line x1="280" y1="20" x2="310" y2="35" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
      `;
    } else {
      // peaceful
      moodSparkles = `
        <g stroke="#ffffff" fill="none" opacity="0.6">
          <circle cx="280" cy="90" r="6" stroke-width="1.2"/>
          <circle cx="370" cy="75" r="9" stroke-width="1.2"/>
          <circle cx="310" cy="60" r="4" stroke-width="1"/>
        </g>
      `;
    }

    return `
      <svg class="dream-scene-svg" viewBox="0 0 500 240" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Dream scene illustrating ${choice.title}">
        ${scenery}
        ${moodSparkles}
        ${compSvg}
      </svg>
    `;
  }

  function renderDream(choice) {
    const dream = buildDream(choice);
    if (!dream) {
      status.textContent = 'One of Pip’s dream ingredients went missing. Choose again.';
      return;
    }
    currentDream = dream;
    placeholder.hidden = true;
    result.hidden = false;
    actions.hidden = false;
    fallback.hidden = true;

    titleEl.textContent = dream.title;
    storyEl.textContent = dream.story;
    pipEl.textContent = dream.message;

    scene.dataset.place = dream.destination;
    scene.dataset.feeling = dream.feeling;

    // Render rich SVG storybook art
    if (visual) {
      visual.innerHTML = renderSvgScene(dream);
    }

    // Keep legacy fallback elements updated for full compatibility
    const placeEl = $('#dream-art-place');
    const friendEl = $('#dream-art-friend');
    if (placeEl) placeEl.textContent = ingredients.destination[dream.destination].symbol;
    if (friendEl) friendEl.textContent = ingredients.companion[dream.companion].symbol;

    status.textContent = `Dream created: ${dream.title}. You can save a dream card or copy your story. ♡`;
    titleEl.focus({ preventScroll: true });

    // Pip reacts livingly to the dream creation milestone
    if (typeof window.pipReact === 'function') {
      window.pipReact(`Your dream is ready! I tucked it right into the stars. ✧`, 'happy');
    }

    if (window.matchMedia('(max-width: 780px)').matches) {
      const scrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto' : 'smooth';
      result.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    renderDream(selected());
  });

  // Another dream cycles predictably through all 27 combinations
  $('#another-dream').addEventListener('click', () => {
    const val = selected();
    const index = (feelings.indexOf(val.feeling) * 9 + destinations.indexOf(val.destination) * 3 + companions.indexOf(val.companion) + 1) % 27;
    const next = {
      feeling: feelings[Math.floor(index / 9)],
      destination: destinations[Math.floor(index / 3) % 3],
      companion: companions[index % 3]
    };
    for (const [name, value] of Object.entries(next)) {
      const radio = form.querySelector(`input[name="${name}"][value="${value}"]`);
      if (radio) radio.checked = true;
    }
    renderDream(next);
  });

  // Copy dream text with fallback
  async function copyDream() {
    if (!currentDream) {
      status.textContent = 'Build your first dream before copying it.';
      return;
    }
    fallback.hidden = true;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(currentDream.text);
        status.textContent = 'Copied! Your little dream is ready to paste into a message or note. ♡';
        return;
      } catch (_) {
        /* Some browsers block Clipboard API; show manual copy field. */
      }
    }
    fallback.value = currentDream.text;
    fallback.hidden = false;
    fallback.focus();
    fallback.select();
    status.textContent = 'Select and copy the dream text in the box below (Ctrl+C / Cmd+C).';
  }
  $('#copy-dream').addEventListener('click', copyDream);

  // Helper for word wrapping text on canvas
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let curY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = words[n] + ' ';
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, curY);
    return curY + lineHeight;
  }

  // Rounded rectangle path drawer for canvas
  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  // High-resolution offline client-side PNG card exporter
  function saveDreamCard() {
    if (!currentDream) {
      status.textContent = 'Build your first dream before saving a card.';
      return;
    }
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 960;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');

      // 1. Storybook card background
      ctx.fillStyle = '#fffcf8';
      drawRoundedRect(ctx, 16, 16, 768, 928, 32);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#a34063';
      ctx.stroke();

      // Inner thin dashed border
      ctx.save();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#e8d5ca';
      ctx.setLineDash([8, 8]);
      drawRoundedRect(ctx, 28, 28, 744, 904, 24);
      ctx.stroke();
      ctx.restore();

      // 2. Header banner & stamps
      ctx.fillStyle = '#a34063';
      ctx.font = '700 13px "Fredoka", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.letterSpacing = '2px';
      ctx.fillText('✦ THE MIDNIGHT NURSERY · JUNIOR DREAM ENGINEER ✦', 400, 60);

      ctx.fillStyle = '#806b61';
      ctx.font = '500 12px "Fredoka", Arial, sans-serif';
      ctx.fillText('EST. ONE MOON AGO · A ONE-OF-A-KIND BEDTIME STORY', 400, 82);

      // 3. Illustrated Scene Box
      const sceneX = 48;
      const sceneY = 104;
      const sceneW = 704;
      const sceneH = 300;

      ctx.save();
      drawRoundedRect(ctx, sceneX, sceneY, sceneW, sceneH, 20);
      ctx.clip();

      // Sky Gradient
      const dInfo = ingredients.destination[currentDream.destination];
      const skyGrad = ctx.createLinearGradient(sceneX, sceneY, sceneX, sceneY + sceneH);
      skyGrad.addColorStop(0, dInfo.skyTop);
      skyGrad.addColorStop(1, dInfo.skyBottom);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(sceneX, sceneY, sceneW, sceneH);

      // Stars
      ctx.fillStyle = '#fff9d2';
      const starPositions = [
        [sceneX + 60, sceneY + 40], [sceneX + 130, sceneY + 80], [sceneX + 220, sceneY + 45],
        [sceneX + 340, sceneY + 60], [sceneX + 460, sceneY + 35], [sceneX + 570, sceneY + 70],
        [sceneX + 650, sceneY + 40], [sceneX + 180, sceneY + 110], [sceneX + 510, sceneY + 100]
      ];
      starPositions.forEach(([sx, sy], i) => {
        ctx.beginPath();
        ctx.arc(sx, sy, i % 2 === 0 ? 2.5 : 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Destination art in scene
      if (currentDream.destination === 'moon') {
        // Glowing Crescent Moon
        const moonGlow = ctx.createRadialGradient(sceneX + 180, sceneY + 110, 10, sceneX + 180, sceneY + 110, 80);
        moonGlow.addColorStop(0, 'rgba(255, 248, 214, 0.9)');
        moonGlow.addColorStop(0.6, 'rgba(255, 234, 167, 0.3)');
        moonGlow.addColorStop(1, 'rgba(255, 234, 167, 0)');
        ctx.fillStyle = moonGlow;
        ctx.beginPath();
        ctx.arc(sceneX + 180, sceneY + 110, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff5d2';
        ctx.beginPath();
        ctx.arc(sceneX + 180, sceneY + 110, 50, 0.2 * Math.PI, 1.8 * Math.PI);
        ctx.bezierCurveTo(sceneX + 215, sceneY + 70, sceneX + 215, sceneY + 150, sceneX + 180, sceneY + 160);
        ctx.fill();

        // Silver sea waves
        ctx.fillStyle = '#e9dbf0';
        ctx.beginPath();
        ctx.moveTo(sceneX, sceneY + sceneH - 40);
        ctx.quadraticCurveTo(sceneX + 200, sceneY + sceneH - 80, sceneX + 400, sceneY + sceneH - 50);
        ctx.quadraticCurveTo(sceneX + 550, sceneY + sceneH - 20, sceneX + sceneW, sceneY + sceneH - 45);
        ctx.lineTo(sceneX + sceneW, sceneY + sceneH);
        ctx.lineTo(sceneX, sceneY + sceneH);
        ctx.fill();
      } else if (currentDream.destination === 'garden') {
        // Rainbow arc
        ctx.lineWidth = 18;
        ctx.strokeStyle = 'rgba(248, 165, 194, 0.65)';
        ctx.beginPath();
        ctx.arc(sceneX + 350, sceneY + sceneH + 30, 240, Math.PI, 1.7 * Math.PI);
        ctx.stroke();

        // Cloud puffs
        ctx.fillStyle = '#ffffff';
        const puffs = [
          [sceneX + 80, sceneY + sceneH - 30, 60],
          [sceneX + 180, sceneY + sceneH - 45, 75],
          [sceneX + 290, sceneY + sceneH - 35, 65],
          [sceneX + 400, sceneY + sceneH - 50, 70],
          [sceneX + 520, sceneY + sceneH - 35, 65],
          [sceneX + 630, sceneY + sceneH - 40, 70]
        ];
        puffs.forEach(([cx, cy, r]) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Starlit Forest pines
        ctx.fillStyle = '#1e383e';
        const trees = [
          [sceneX + 70, sceneY + sceneH - 20, 45, 150],
          [sceneX + 160, sceneY + sceneH - 20, 55, 180],
          [sceneX + 250, sceneY + sceneH - 20, 50, 160],
          [sceneX + 560, sceneY + sceneH - 20, 60, 190],
          [sceneX + 640, sceneY + sceneH - 20, 45, 150]
        ];
        trees.forEach(([tx, ty, w, h]) => {
          ctx.beginPath();
          ctx.moveTo(tx, ty - h);
          ctx.lineTo(tx + w, ty);
          ctx.lineTo(tx - w, ty);
          ctx.closePath();
          ctx.fill();
        });

        // Fireflies
        ctx.fillStyle = '#ffffa0';
        [[sceneX + 120, sceneY + 160], [sceneX + 230, sceneY + 140], [sceneX + 530, sceneY + 150]].forEach(([fx, fy]) => {
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Companion icon/art stamp on card
      const compX = sceneX + sceneW - 180;
      const compY = sceneY + sceneH - 85;
      ctx.fillStyle = 'rgba(255, 252, 248, 0.9)';
      ctx.beginPath();
      ctx.arc(compX, compY, 46, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#a34063';
      ctx.stroke();

      ctx.font = '48px "Fredoka", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ingredients.companion[currentDream.companion].symbol, compX, compY);

      ctx.restore();

      // Border around scene
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#a34063';
      drawRoundedRect(ctx, sceneX, sceneY, sceneW, sceneH, 20);
      ctx.stroke();

      // 4. Dream Title
      ctx.textAlign = 'center';
      ctx.fillStyle = '#a34063';
      ctx.font = '700 28px "DM Serif Display", Georgia, serif';
      ctx.fillText(currentDream.title, 400, 445);

      // Decorative divider
      ctx.fillStyle = '#e8d5ca';
      ctx.fillRect(280, 462, 240, 2);
      ctx.fillStyle = '#a34063';
      ctx.font = '14px "Fredoka", Arial, sans-serif';
      ctx.fillText('♡', 400, 465);

      // 5. Story Body
      ctx.textAlign = 'left';
      ctx.fillStyle = '#5c4033';
      ctx.font = '400 18px "DM Sans", Arial, sans-serif';
      const storyEnd = wrapText(ctx, currentDream.story, 65, 500, 670, 28);

      // 6. Pip's Note Box
      const noteBoxY = Math.max(storyEnd + 15, 680);
      const noteBoxH = 130;
      ctx.fillStyle = '#fbe4eb';
      drawRoundedRect(ctx, 60, noteBoxY, 680, noteBoxH, 14);
      ctx.fill();

      // Left bar
      ctx.fillStyle = '#a34063';
      ctx.fillRect(60, noteBoxY, 8, noteBoxH);

      // Note text
      ctx.fillStyle = '#812e4d';
      ctx.font = '600 16px "Fredoka", Arial, sans-serif';
      ctx.fillText('A handwritten note from Pip ♡', 85, noteBoxY + 34);

      ctx.fillStyle = '#5c4033';
      ctx.font = 'italic 16px "DM Sans", Arial, sans-serif';
      wrapText(ctx, `“${ingredients.feeling[currentDream.feeling].message} Sweet dreams!”`, 85, noteBoxY + 68, 630, 24);

      // 7. Footer
      ctx.textAlign = 'center';
      ctx.fillStyle = '#806b61';
      ctx.font = '500 13px "Fredoka", Arial, sans-serif';
      ctx.fillText('☾ pip\'s dream desk · baby\'s first website 2026 · track 1 ✦', 400, 905);

      // Download trigger
      canvas.toBlob((blob) => {
        if (!blob) {
          status.textContent = 'Could not generate card image. You can still use Copy my story!';
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = currentDream.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        a.download = `pips-dream-${cleanTitle}.png`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          URL.revokeObjectURL(url);
          a.remove();
        }, 1000);

        status.textContent = '♡ Saved dream card! Check your downloads. Sweet dreams! ✦';
        if (typeof window.pipReact === 'function') {
          window.pipReact('I tucked your dream card into your pocket! Keep it safe. ♡', 'wave');
        }
      }, 'image/png');
    } catch (err) {
      status.textContent = 'Could not generate card image. You can still use Copy my story!';
    }
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', saveDreamCard);
  }
})();
