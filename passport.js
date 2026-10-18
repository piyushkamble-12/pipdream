/* Pip's Dream Passport — three honest milestones, one local keepsake. */
(() => {
  'use strict';
  const root = document.querySelector('#passport');
  if (!root) return;

  const KEY = 'pip_dream_passport_v1';
  const steps = ['melody', 'lantern', 'delivery'];
  const names = {
    melody: 'Melody Maker',
    lantern: 'Moonlight Keeper',
    delivery: 'Dream Courier'
  };
  const status = document.querySelector('#passport-status');
  const progress = document.querySelector('#passport-progress');
  const bar = document.querySelector('#passport-progress-bar');
  const award = document.querySelector('#passport-award');
  const awardStatus = document.querySelector('#passport-award-status');
  const saveButton = document.querySelector('#passport-save');
  const resetButton = document.querySelector('#passport-reset');
  const nameInput = document.querySelector('#passport-name');
  const awardName = document.querySelector('#passport-award-name');

  let complete = { melody: false, lantern: false, delivery: false };

  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (raw && typeof raw === 'object') {
      for (const step of steps) complete[step] = raw[step] === true;
    }
  } catch (_) {
    // Private browsing or blocked storage: passport still works this session.
  }

  function store() {
    try { localStorage.setItem(KEY, JSON.stringify(complete)); } catch (_) {}
  }

  function tally() {
    return steps.filter(step => complete[step]).length;
  }

  function render(announcement) {
    const count = tally();
    for (const step of steps) {
      const card = root.querySelector('[data-passport-step="' + step + '"]');
      if (!card) continue;
      const isDone = complete[step];
      card.classList.toggle('is-stamped', isDone);
      const stamp = card.querySelector('.passport-stamp');
      const label = card.querySelector('.passport-step-state');
      if (stamp) {
        stamp.textContent = isDone ? '✓' : '✧';
        stamp.setAttribute('aria-label', isDone ? 'Stamp collected' : 'Stamp not collected');
      }
      if (label) label.textContent = isDone ? 'Stamp collected!' : 'Not collected yet';
    }
    progress.textContent = count + ' of 3 stamps collected';
    bar.style.width = Math.round(count / 3 * 100) + '%';
    award.hidden = count !== 3;
    resetButton.hidden = count === 0;
    if (announcement) {
      status.textContent = announcement;
    } else if (count === 3) {
      status.textContent = 'All three stamps! Pip says: Welcome, Honorary Dream Engineer. ♡';
    } else if (count === 0) {
      status.textContent = 'Your passport is ready. Try one of Pip’s inventions to earn a stamp.';
    } else {
      status.textContent = 'Beautiful work! ' + (3 - count) + ' more ' +
        (3 - count === 1 ? 'stamp' : 'stamps') + ' until your special surprise.';
    }
  }

  window.addEventListener('pip:milestone', (event) => {
    const step = event.detail && event.detail.step;
    if (!steps.includes(step) || complete[step]) return;
    complete[step] = true;
    store();
    const count = tally();
    const announcement = '✦ ' + names[step] + ' stamp collected! ' +
      (count === 3
        ? 'You completed Pip’s Dream Passport! Your certificate is unlocked below. ♡'
        : count + ' of 3 stamps collected.');
    render(announcement);
    if (count === 3 && typeof window.pipReact === 'function') {
      window.pipReact('You collected every stamp! I made you a very important certificate. ♡');
    }
  });

  function cleanName() {
    const trimmed = nameInput.value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 24);
    return trimmed || 'Little Dreamer';
  }
  function drawStar(ctx, x, y, radius) {
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const a = -Math.PI / 2 + p * Math.PI / 5;
      const r = p % 2 === 0 ? radius : radius * .43;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawCertificate(ctx, person) {
    const w = 1000, h = 700;
    ctx.fillStyle = '#fff8f1';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fbe4eb';
    ctx.fillRect(30, 30, w - 60, h - 60);
    ctx.fillStyle = '#fffdf9';
    ctx.fillRect(51, 51, w - 102, h - 102);
    ctx.strokeStyle = '#a34063';
    ctx.lineWidth = 6;
    ctx.strokeRect(51, 51, w - 102, h - 102);
    ctx.setLineDash([7, 10]);
    ctx.strokeStyle = '#d6af8d';
    ctx.lineWidth = 2;
    ctx.strokeRect(69, 69, w - 138, h - 138);
    ctx.setLineDash([]);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#a34063';
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('✦  THE MIDNIGHT NURSERY  ✦', w / 2, 150);
    ctx.fillStyle = '#5c4033';
    ctx.font = '46px Georgia, serif';
    ctx.fillText('Certificate of Tiny Bravery', w / 2, 226);
    ctx.font = '22px Georgia, serif';
    ctx.fillText('This very official piece of moon-paper belongs to', w / 2, 290);

    ctx.fillStyle = '#a34063';
    ctx.font = person.length > 19 ? 'bold 37px Georgia, serif' : 'bold 53px Georgia, serif';
    ctx.fillText(person, w / 2, 369, 805);
    ctx.fillStyle = '#5c4033';
    ctx.font = '24px Georgia, serif';
    ctx.fillText('Honorary Dream Engineer', w / 2, 425);
    ctx.font = '19px Georgia, serif';
    ctx.fillText('For making a melody, lighting the night, and delivering a dream.', w / 2, 470);

    ctx.fillStyle = '#e5b66e';
    for (const [x, y, r] of [[123, 125, 21], [878, 126, 20], [146, 512, 13],
      [856, 509, 15], [245, 194, 9], [755, 190, 10]]) drawStar(ctx, x, y, r);
    ctx.fillStyle = '#a34063';
    ctx.font = 'italic 28px Georgia, serif';
    ctx.fillText('With sleepy pride, Pip ♡', w / 2, 551);
    ctx.font = '17px Georgia, serif';
    ctx.fillText('pip’s dream desk  ·  a keepsake made just for you', w / 2, 597);
  }

  saveButton.addEventListener('click', () => {
    if (tally() !== 3) return;
    const person = cleanName();
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      awardStatus.textContent = 'Image downloads are unavailable here. You can still read your certificate above.';
      return;
    }
    drawCertificate(ctx, person);
    try {
      canvas.toBlob((blob) => {
        if (!blob) {
          awardStatus.textContent = 'Could not save the picture. Your certificate is still shown here.';
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'pips-dream-engineer-certificate.png';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 10000);
        awardStatus.textContent = '♡ Your Dream Engineer certificate is ready in your downloads!';
      }, 'image/png');
    } catch (_) {
      awardStatus.textContent = 'Image export was blocked. Your certificate is still shown here.';
    }
  });

  nameInput.addEventListener('input', () => {
    awardName.textContent = cleanName();
  });

  resetButton.addEventListener('click', () => {
    if (!window.confirm('Start a new Dream Passport? Your collected stamps will reset on this device.')) return;
    complete = { melody: false, lantern: false, delivery: false };
    store();
    render('Your new passport is ready for another journey. ♡');
  });

  awardName.textContent = cleanName();
  render();
})();
