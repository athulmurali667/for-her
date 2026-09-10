/* ========================================
   BIRTHDAY WISH — INTERACTIVE SCRIPT
   Elegant & Dreamy Experience
   Mobile-Optimized + Working Replay
   ======================================== */

(function () {
  'use strict';

  // ========== UTILITY ==========
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ========== STATE ==========
  let currentScene = 'scene-intro';
  let currentMsg = 0;
  let candlesOut = 0;
  const totalCandles = 3;
  let bgMusic = null;
  let musicPlaying = false;

  // Track animation frame IDs so we can cancel on replay
  const animationFrames = {
    starfield: null,
    particlesName: null,
    particlesMsg: null,
    particlesQual: null,
    confetti: null,
  };

  // Track intervals
  const intervals = [];

  // Detect mobile
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
                    || ('ontouchstart' in window);

  // ========== SCENE TRANSITIONS ==========
  function goToScene(id) {
    const current = $(`#${currentScene}`);
    const next = $(`#${id}`);
    if (!next || currentScene === id) return;

    current.classList.remove('active');
    next.classList.add('active');
    currentScene = id;

    // Trigger scene-specific init
    if (id === 'scene-name') initNameScene();
    if (id === 'scene-messages') initMessagesScene();
    if (id === 'scene-qualities') initQualitiesScene();
    if (id === 'scene-cake') initCakeScene();
    if (id === 'scene-finale') initFinaleScene();
  }

  // ========== RESTART ANIMATION HELPER ==========
  // CSS animations only play once. To replay, we remove the animate class,
  // force a browser reflow, then re-add it.
  function restartAnimation(element) {
    if (!element) return;
    element.classList.remove('animate');
    // Force reflow so browser registers the class removal
    void element.offsetWidth;
    element.classList.add('animate');
  }

  function triggerAnimate(selector, delay = 0) {
    const el = typeof selector === 'string' ? $(selector) : selector;
    if (!el) return;
    setTimeout(() => {
      el.classList.add('animate');
    }, delay);
  }

  // ========== STARFIELD (Intro) ==========
  function initStarfield() {
    const canvas = $('#starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const stars = [];
    const shootingStars = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Fewer stars on mobile for performance
    const starCount = isMobile ? 100 : 200;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // Occasional shooting star
    function addShootingStar() {
      shootingStars.push({
        x: Math.random() * w * 0.7,
        y: Math.random() * h * 0.3,
        len: Math.random() * 80 + 40,
        speed: Math.random() * 6 + 4,
        alpha: 1,
        angle: Math.PI / 6 + Math.random() * 0.2,
      });
    }
    const ssInterval = setInterval(addShootingStar, isMobile ? 5000 : 4000);
    intervals.push(ssInterval);

    let time = 0;
    function draw() {
      ctx.clearRect(0, 0, w, h);
      time += 0.016;

      // Stars
      for (const s of stars) {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed * 60 + s.twinkleOffset));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(230, 220, 255, ${a})`;
        ctx.fill();
      }

      // Shooting stars
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.012;

        if (ss.alpha <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x - Math.cos(ss.angle) * ss.len,
          ss.y - Math.sin(ss.angle) * ss.len
        );
        const gradient = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - Math.cos(ss.angle) * ss.len,
          ss.y - Math.sin(ss.angle) * ss.len
        );
        gradient.addColorStop(0, `rgba(232, 193, 112, ${ss.alpha})`);
        gradient.addColorStop(1, `rgba(232, 193, 112, 0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animationFrames.starfield = requestAnimationFrame(draw);
    }
    draw();
  }

  // ========== FLOATING PARTICLES (reusable) ==========
  function initParticles(canvasId, colors, count, frameKey) {
    // Cancel previous animation on this canvas
    if (animationFrames[frameKey]) {
      cancelAnimationFrame(animationFrames[frameKey]);
      animationFrames[frameKey] = null;
    }

    const canvas = $(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;
    const particles = [];

    // Reduce count on mobile
    const actualCount = isMobile ? Math.floor(count * 0.6) : count;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < actualCount; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: -Math.random() * 0.5 - 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('1)', `${p.alpha})`);
        ctx.fill();
      }
      animationFrames[frameKey] = requestAnimationFrame(draw);
    }
    draw();
  }

  // ========== CONFETTI ==========
  function launchConfetti() {
    const canvas = $('#confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });

    const confetti = [];
    const colors = ['#e8c170', '#d4a0b9', '#b8a9d4', '#f2d0e0', '#fff7a8', '#a0d4c0', '#ff8888'];

    // Fewer confetti on mobile
    const burstCount = isMobile ? 80 : 150;
    const fallCount = isMobile ? 30 : 60;

    // Burst from center
    for (let i = 0; i < burstCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      confetti.push({
        x: w / 2,
        y: h / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.12,
        drag: 0.98,
        alpha: 1,
      });
    }

    // Slow falling from top
    for (let i = 0; i < fallCount; i++) {
      confetti.push({
        x: Math.random() * w,
        y: -Math.random() * 200,
        vx: (Math.random() - 0.5) * 2,
        vy: Math.random() * 1.5 + 0.5,
        w: Math.random() * 8 + 4,
        h: Math.random() * 5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 5,
        gravity: 0.03,
        drag: 0.995,
        alpha: 1,
        delay: Math.random() * 3000,
        startTime: performance.now(),
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const now = performance.now();
      let alive = false;

      for (const c of confetti) {
        if (c.delay && (now - c.startTime) < c.delay) { alive = true; continue; }

        c.vy += c.gravity;
        c.vx *= c.drag;
        c.vy *= c.drag;
        c.x += c.vx;
        c.y += c.vy;
        c.rotation += c.rotSpeed;

        if (c.y > h + 20) {
          c.alpha -= 0.02;
        }

        if (c.alpha <= 0) continue;
        alive = true;

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate((c.rotation * Math.PI) / 180);
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      if (alive) {
        animationFrames.confetti = requestAnimationFrame(draw);
      }
    }
    draw();
  }

  // ========== SCENE INITS ==========

  function initNameScene() {
    initParticles('#particles-name', [
      'rgba(232, 193, 112, 1)',
      'rgba(212, 160, 185, 1)',
      'rgba(184, 169, 212, 1)',
    ], 50, 'particlesName');

    // Trigger CSS animations with .animate class
    triggerAnimate('.happy-text', 0);
    triggerAnimate('.name-text', 0);
    triggerAnimate('.sparkle-line', 0);
    triggerAnimate('.subtitle-text', 0);

    // The continue button in name scene
    const nameBtn = $('#scene-name .continue-btn');
    if (nameBtn) triggerAnimate(nameBtn, 0);
  }

  function initMessagesScene() {
    initParticles('#particles-msg', [
      'rgba(232, 193, 112, 1)',
      'rgba(242, 208, 224, 1)',
    ], 25, 'particlesMsg');
    showMessage(0);

    // Animate the next button
    const msgBtn = $('#msg-continue');
    if (msgBtn) triggerAnimate(msgBtn, 0);
  }

  function showMessage(idx) {
    const cards = $$('.msg-card');
    const dots = $$('.msg-dot');

    cards.forEach((c, i) => {
      c.classList.remove('active', 'exit');
      if (i === idx) {
        // Small delay so exit animation can play
        setTimeout(() => c.classList.add('active'), 50);
      }
    });

    dots.forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    currentMsg = idx;

    // Update button text
    const btn = $('#msg-continue');
    if (idx === cards.length - 1) {
      btn.textContent = 'continue →';
    } else {
      btn.textContent = 'next →';
    }
  }

  function initQualitiesScene() {
    initParticles('#particles-qual', [
      'rgba(184, 169, 212, 1)',
      'rgba(232, 193, 112, 1)',
    ], 30, 'particlesQual');

    const title = $('.qual-title');
    const cards = $$('.qual-card');

    setTimeout(() => title.classList.add('visible'), 200);

    cards.forEach((card, i) => {
      setTimeout(() => card.classList.add('visible'), 500 + i * 200);
    });

    // Animate continue button
    const qualBtn = $('#scene-qualities .continue-btn');
    if (qualBtn) triggerAnimate(qualBtn, 0);
  }

  function initCakeScene() {
    candlesOut = 0;
    $$('.flame').forEach(f => {
      f.classList.remove('out');
    });
    $$('.flame-glow').forEach(g => {
      g.classList.remove('out');
    });

    // Animate cake scene elements
    triggerAnimate('.cake-title', 0);
    triggerAnimate('.cake-subtitle', 0);

    const blowBtn = $('#blow-btn');
    if (blowBtn) {
      blowBtn.classList.remove('hidden');
      triggerAnimate(blowBtn, 0);
    }

    const blowHint = $('.blow-hint');
    if (blowHint) triggerAnimate(blowHint, 0);
  }

  function blowCandle(flameEl) {
    if (flameEl.classList.contains('out')) return;
    flameEl.classList.add('out');
    flameEl.closest('.candle').querySelector('.flame-glow').classList.add('out');

    // Add smoke
    const container = flameEl.closest('.flame-container');
    for (let i = 0; i < 3; i++) {
      const smoke = document.createElement('div');
      smoke.className = 'smoke';
      smoke.style.left = `${Math.random() * 10 - 5}px`;
      smoke.style.animationDelay = `${i * 0.15}s`;
      container.appendChild(smoke);
      setTimeout(() => smoke.remove(), 1500);
    }

    // Haptic feedback on mobile
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }

    candlesOut++;
    if (candlesOut >= totalCandles) {
      // Haptic pattern for all candles out
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
      setTimeout(() => goToScene('scene-finale'), 1200);
    }
  }

  function initFinaleScene() {
    // Clear confetti canvas first
    const canvas = $('#confetti-canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Trigger finale animations
    triggerAnimate('.finale-small', 0);
    triggerAnimate('.finale-text', 0);
    triggerAnimate('.finale-divider', 0);
    triggerAnimate('.finale-message:not(.secondary)', 0);
    triggerAnimate('.finale-message.secondary', 0);
    triggerAnimate('.finale-signature', 0);
    triggerAnimate('#restart-btn', 0);

    // Launch confetti
    setTimeout(launchConfetti, 300);
    setTimeout(launchConfetti, 2500);
  }

  // ========== BACKGROUND MUSIC (Web Audio API - gentle tone) ==========
  function createBgMusic() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create a gentle, dreamy ambient pad
      const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
      const oscillators = [];
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = 0.03; // Very quiet
      gainNode.connect(audioCtx.destination);

      notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        
        const oscGain = audioCtx.createGain();
        oscGain.gain.value = 0.4 - i * 0.08;
        
        osc.connect(oscGain);
        oscGain.connect(gainNode);
        osc.start();
        oscillators.push({ osc, gain: oscGain });
      });

      // Slowly modulate for dreamy feel
      let time = 0;
      function modulate() {
        time += 0.016;
        oscillators.forEach((o, i) => {
          const base = notes[i];
          o.osc.frequency.value = base + Math.sin(time * 0.3 + i) * 2;
          o.gain.gain.value = (0.4 - i * 0.08) * (0.7 + 0.3 * Math.sin(time * 0.2 + i * 0.5));
        });
        if (musicPlaying) requestAnimationFrame(modulate);
      }

      return {
        play() {
          if (audioCtx.state === 'suspended') audioCtx.resume();
          musicPlaying = true;
          modulate();
        },
        pause() {
          musicPlaying = false;
        },
        toggle() {
          if (musicPlaying) {
            this.pause();
          } else {
            this.play();
          }
          return musicPlaying;
        }
      };
    } catch (e) {
      return { play() {}, pause() {}, toggle() { return false; } };
    }
  }

  // ========== FULL RESET (for replay) ==========
  function fullReset() {
    // Reset state
    currentMsg = 0;
    candlesOut = 0;

    // Cancel all particle animations (prevents memory leak / stacking)
    Object.keys(animationFrames).forEach(key => {
      if (key !== 'starfield' && animationFrames[key]) {
        cancelAnimationFrame(animationFrames[key]);
        animationFrames[key] = null;
      }
    });

    // Clear particle canvases
    ['#particles-name', '#particles-msg', '#particles-qual', '#confetti-canvas'].forEach(id => {
      const c = $(id);
      if (c) {
        const ctx = c.getContext('2d');
        ctx.clearRect(0, 0, c.width, c.height);
      }
    });

    // Reset envelope
    const envelope = $('#envelope');
    if (envelope) envelope.classList.remove('opened');

    // Reset candles
    $$('.flame').forEach((f) => {
      f.classList.remove('out');
    });
    $$('.flame-glow').forEach((g) => {
      g.classList.remove('out');
    });

    // Reset blow btn
    const bb = $('#blow-btn');
    if (bb) {
      bb.classList.remove('hidden', 'animate');
    }

    // Remove all .animate classes to reset CSS animations
    const animatedEls = [
      '.happy-text', '.name-text', '.sparkle-line', '.subtitle-text',
      '.cake-title', '.cake-subtitle', '.blow-hint',
      '.finale-small', '.finale-text', '.finale-divider',
      '.finale-message', '.finale-message.secondary',
      '.finale-signature', '#restart-btn'
    ];
    animatedEls.forEach(sel => {
      $$(sel).forEach(el => el.classList.remove('animate'));
    });

    // Reset all continue buttons
    $$('.continue-btn').forEach(btn => {
      btn.classList.remove('animate');
      btn.style.opacity = '';
      btn.style.transform = '';
    });

    // Reset qualities
    const qualTitle = $('.qual-title');
    if (qualTitle) qualTitle.classList.remove('visible');
    $$('.qual-card').forEach((c) => c.classList.remove('visible'));

    // Reset messages
    $$('.msg-card').forEach((c) => c.classList.remove('active', 'exit'));

    // Remove any leftover smoke elements
    $$('.smoke').forEach(s => s.remove());

    // Go to intro
    goToScene('scene-intro');
  }

  // ========== EVENT LISTENERS ==========

  // Envelope click (works for both click and touch)
  const envelope = $('#envelope');
  if (envelope) {
    envelope.addEventListener('click', async () => {
      if (envelope.classList.contains('opened')) return;
      envelope.classList.add('opened');

      // Start music (must be triggered by user gesture on mobile)
      if (!bgMusic) {
        bgMusic = createBgMusic();
        bgMusic.play();
        $('#audio-icon-off').style.display = 'none';
        $('#audio-icon-on').style.display = '';
      }

      await wait(1200);
      goToScene('scene-name');
    });
  }

  // Audio toggle
  const audioToggle = $('#audio-toggle');
  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      if (!bgMusic) {
        bgMusic = createBgMusic();
      }
      const playing = bgMusic.toggle();
      $('#audio-icon-on').style.display = playing ? '' : 'none';
      $('#audio-icon-off').style.display = playing ? 'none' : '';
    });
  }

  // Continue buttons (for name scene and qualities scene)
  $$('.continue-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = btn.dataset.next;
      if (next) goToScene(next);
    });
  });

  // Message navigation
  const msgContinueBtn = $('#msg-continue');
  if (msgContinueBtn) {
    msgContinueBtn.addEventListener('click', () => {
      const totalMsgs = $$('.msg-card').length;
      if (currentMsg < totalMsgs - 1) {
        showMessage(currentMsg + 1);
      } else {
        goToScene('scene-qualities');
      }
    });
  }

  // Message dots
  $$('.msg-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.dataset.msg);
      showMessage(idx);
    });
  });

  // Blow candles button
  const blowBtn = $('#blow-btn');
  if (blowBtn) {
    blowBtn.addEventListener('click', async () => {
      const flames = $$('.flame');
      for (let i = 0; i < flames.length; i++) {
        blowCandle(flames[i]);
        await wait(300);
      }
      blowBtn.classList.add('hidden');
    });
  }

  // Tap individual candles
  $$('.candle').forEach((candle) => {
    candle.addEventListener('click', (e) => {
      e.stopPropagation();
      const flame = candle.querySelector('.flame');
      if (flame) blowCandle(flame);
    });
  });

  // Swipe support for messages
  let touchStartX = 0;
  let touchStartY = 0;
  const messagesSection = $('#scene-messages');
  if (messagesSection) {
    messagesSection.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    messagesSection.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = Math.abs(touchStartY - touchEndY);

      // Only register horizontal swipes (not vertical scrolls)
      if (Math.abs(diffX) > 50 && diffY < 100) {
        const totalMsgs = $$('.msg-card').length;
        if (diffX > 0 && currentMsg < totalMsgs - 1) {
          // Swipe left → next
          showMessage(currentMsg + 1);
        } else if (diffX < 0 && currentMsg > 0) {
          // Swipe right → prev
          showMessage(currentMsg - 1);
        }
      }
    }, { passive: true });
  }

  // ========== RESTART (REPLAY) BUTTON ==========
  const restartBtn = $('#restart-btn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      fullReset();
    });
  }

  // ========== INIT ==========
  initStarfield();

  // Prevent pull-to-refresh and bounce on iOS
  document.addEventListener('touchmove', (e) => {
    // Allow scrolling in qualities section
    if (e.target.closest('#scene-qualities .qualities-content')) return;
    e.preventDefault();
  }, { passive: false });

  // Prevent double-tap zoom on iOS
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });

})();
