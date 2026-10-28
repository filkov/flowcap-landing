(() => {
  const scene = document.querySelector('.hero-scene');
  const navigation = document.querySelector('.landing-page .nav-wrap');
  if (navigation) {
    let navigationFrame = 0;
    const syncNavigation = () => {
      navigationFrame = 0;
      navigation.classList.toggle('is-floating', !!scene && scene.getBoundingClientRect().bottom <= 0);
    };
    window.addEventListener('scroll', () => {
      if (!navigationFrame) navigationFrame = requestAnimationFrame(syncNavigation);
    }, { passive: true });
    window.addEventListener('pageshow', syncNavigation);
    window.addEventListener('resize', syncNavigation);
    syncNavigation();
  }
  // Keep the connectors attached to the real chip edges, including translations.
  const ribbon = document.querySelector('.flow-ribbon-track');
  if (ribbon) {
    const line = ribbon.querySelector('.flow-ribbon-line');
    const chips = [...ribbon.querySelectorAll('.feature-label')].map(element => ({ element, x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0 }));
    const paths = chips.slice(1).map(() => document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    paths.forEach(path => path.setAttribute('vector-effect', 'non-scaling-stroke'));
    line.replaceChildren(...paths);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
    let frame = 0, lastTime = 0, dashRate = 1, dashTarget = 1;
    const draw = () => {
      paths.forEach((path, i) => {
        const a = chips[i], b = chips[i + 1];
        const sx = a.left + a.width + a.x, sy = a.top + a.height / 2 + a.y;
        const ex = b.left + b.x, ey = b.top + b.height / 2 + b.y;
        const gap = Math.max(12, ex - sx), mx = (sx + ex) / 2, my = (sy + ey) / 2;
        const r = Math.min(22, gap * .17);
        // A horizontal tangent meets each side cleanly. Alternate links loop back.
        const d = i % 2 === 0
          ? `M${sx} ${sy} C${sx + gap * .4} ${sy} ${mx + r} ${my + 48} ${mx + r} ${my} C${mx + r} ${my - 44} ${mx - r} ${my - 44} ${mx - r} ${my} C${mx - r} ${my + 42} ${ex - gap * .35} ${ey} ${ex} ${ey}`
          : `M${sx} ${sy} C${sx + gap * .5} ${sy} ${ex - gap * .5} ${ey} ${ex} ${ey}`;
        path.setAttribute('d', d);
      });
    };
    const measure = () => {
      const rect = ribbon.getBoundingClientRect();
      line.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      chips.forEach(chip => {
        const box = chip.element.getBoundingClientRect();
        chip.left = box.left - rect.left - chip.x;
        chip.top = box.top - rect.top - chip.y;
        chip.width = box.width;
        chip.height = box.height;
      });
      draw();
    };
    const tick = time => {
      const dt = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
      lastTime = time;
      dashRate += (dashTarget - dashRate) * (1 - Math.exp(-7 * dt));
      if (Math.abs(dashTarget - dashRate) < .005) dashRate = dashTarget;
      // Change playback rate without restarting the dash phase.
      paths.forEach(path => path.getAnimations().forEach(animation => animation.updatePlaybackRate(dashRate)));
      let moving = dashRate !== dashTarget;
      chips.forEach(chip => {
        chip.vx += ((chip.tx - chip.x) * 110 - chip.vx * 20) * dt;
        chip.vy += ((chip.ty - chip.y) * 110 - chip.vy * 20) * dt;
        chip.x += chip.vx * dt;
        chip.y += chip.vy * dt;
        if (Math.abs(chip.tx - chip.x) + Math.abs(chip.ty - chip.y) + Math.abs(chip.vx) + Math.abs(chip.vy) > .025) moving = true;
        else { chip.x = chip.tx; chip.y = chip.ty; chip.vx = chip.vy = 0; }
        chip.element.style.transform = `translate3d(${chip.x}px, ${chip.y}px, 0)`;
      });
      draw();
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(tick); }
    };
    const release = () => { dashTarget = 1; chips.forEach(chip => { chip.tx = chip.ty = 0; }); start(); };
    chips.forEach(({ element }) => {
      element.addEventListener('pointerenter', event => {
        if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
        dashTarget = 4; start();
      });
      element.addEventListener('pointerleave', () => { dashTarget = 1; start(); });
    });
    ribbon.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = ribbon.getBoundingClientRect();
      chips.forEach(chip => {
        const dx = event.clientX - rect.left - chip.left - chip.width / 2;
        const dy = event.clientY - rect.top - chip.top - chip.height / 2;
        const attraction = Math.pow(Math.max(0, 1 - Math.hypot(dx, dy) / 200), 2) * .55;
        chip.tx = Math.max(-22, Math.min(22, dx * attraction));
        chip.ty = Math.max(-22, Math.min(22, dy * attraction));
      });
      start();
    }, { passive: true });
    ribbon.addEventListener('pointerleave', release);
    ribbon.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      cancelAnimationFrame(frame); frame = 0;
      dashRate = dashTarget = 1;
      paths.forEach(path => path.getAnimations().forEach(animation => animation.updatePlaybackRate(1)));
      chips.forEach(chip => {
        chip.x = chip.y = chip.vx = chip.vy = chip.tx = chip.ty = 0;
        chip.element.style.transform = '';
      });
      draw();
    });
    new ResizeObserver(measure).observe(ribbon);
    document.fonts?.ready.then(measure);
    measure();
  }
  // One visible video plays at a time, including the decorative hero background.
  const playbackPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mediaItems = [...document.querySelectorAll('.hero-video, .product-demo')].map(video => ({
    video,
    target: video.classList.contains('product-demo') ? video.closest('figure') : scene,
    button: video.closest('figure')?.querySelector('.demo-restart'),
    framePending: false,
    playPending: false
  })).filter(item => item.target);
  let activeMedia = null, manualMedia = null, playbackFrame = 0;
  const mayPlay = item => activeMedia === item && !document.hidden &&
    (manualMedia === item || (!playbackPreference.matches && !navigator.connection?.saveData));
  const revealVideo = item => {
    item.framePending = false;
    if (mayPlay(item) && !item.video.paused && item.video.readyState >= 2) item.video.classList.add('is-playing');
  };
  const applyPlayback = next => {
    activeMedia = next;
    mediaItems.forEach(item => {
      item.target.classList.toggle('is-active-demo', mayPlay(item));
      if (!mayPlay(item) && !item.video.paused) item.video.pause();
    });
    if (!next || !mayPlay(next)) return;
    if (next.playPending) { next.resumePending = next.video.paused; return; }
    if (!next.video.paused) return;
    const { video } = next;
    if (!video.getAttribute('src')) {
      video.src = window.innerWidth <= 760 && video.dataset.srcMobile ? video.dataset.srcMobile : video.dataset.src;
    }
    next.playPending = true;
    next.resumePending = false;
    const attempt = video.play();
    Promise.resolve(attempt).catch(() => {
      if (activeMedia === next && video.readyState < 2) video.classList.remove('is-playing');
    }).finally(() => {
      next.playPending = false;
      if (next.resumePending && mayPlay(next)) { next.resumePending = false; queuePlayback(); }
    });
  };
  const selectVisibleMedia = () => {
    playbackFrame = 0;
    const top = navigation?.classList.contains('is-floating') ? (innerWidth <= 760 ? 84 : 104) : 0;
    const height = Math.max(1, innerHeight - top), center = top + height / 2;
    let best = null, bestScore = 0;
    mediaItems.forEach(item => {
      const rect = item.target.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, innerHeight) - Math.max(rect.top, top));
      if (visible < Math.min(64, rect.height * .25) || rect.right <= 0 || rect.left >= innerWidth) return;
      const score = visible / Math.min(rect.height, height) - Math.abs((rect.top + rect.bottom) / 2 - center) / height * .05;
      if (score > bestScore) { bestScore = score; best = item; }
    });
    // A click may restart a visible card; scrolling restores automatic selection.
    if (manualMedia && best !== manualMedia) manualMedia = null;
    applyPlayback(best);
  };
  const queuePlayback = () => {
    if (!playbackFrame) playbackFrame = requestAnimationFrame(selectVisibleMedia);
  };
  mediaItems.forEach(item => {
    const { video, button } = item;
    video.addEventListener('playing', () => {
      // Ignore a late play event from a card that was passed during rapid scrolling.
      if (!mayPlay(item)) { video.pause(); return; }
      if (item.framePending) return;
      item.framePending = true;
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(() => revealVideo(item));
      else requestAnimationFrame(() => revealVideo(item));
    });
    video.addEventListener('error', () => video.classList.remove('is-playing'));
    if (button) {
      button.hidden = false;
      button.addEventListener('click', () => {
        manualMedia = item;
        try { video.currentTime = 0; } catch { /* An unloaded video already starts at zero. */ }
        applyPlayback(item);
      });
    }
  });
  window.addEventListener('scroll', () => { manualMedia = null; queuePlayback(); }, { passive: true });
  window.addEventListener('resize', queuePlayback);
  window.addEventListener('pageshow', queuePlayback);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) applyPlayback(null);
    else queuePlayback();
  });
  const resetPlaybackPreference = () => { manualMedia = null; queuePlayback(); };
  playbackPreference.addEventListener('change', resetPlaybackPreference);
  navigator.connection?.addEventListener?.('change', resetPlaybackPreference);
  if ('ResizeObserver' in window) {
    const mediaResize = new ResizeObserver(queuePlayback);
    mediaItems.forEach(item => mediaResize.observe(item.target));
  }
  selectVisibleMedia();
  // End exclusive video playback.
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  // A small scroll-only background offset; foreground content stays in place.
  const landscape = document.querySelector('.hero-landscape');
  let parallaxFrame = 0;
  const syncParallax = () => {
    parallaxFrame = 0;
    if (!scene || !landscape) return;
    const enabled = !motionPreference.matches && !navigator.connection?.saveData && !document.hidden;
    const distance = Math.max(0, -scene.getBoundingClientRect().top);
    const limit = window.innerWidth <= 760 ? 18 : 32;
    const offset = enabled ? Math.min(limit, distance * .055) : 0;
    landscape.style.setProperty('--hero-parallax', `${offset.toFixed(2)}px`);
  };
  const queueParallax = () => {
    if (!parallaxFrame) parallaxFrame = requestAnimationFrame(syncParallax);
  };
  if (landscape) {
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax);
    motionPreference.addEventListener('change', queueParallax);
    document.addEventListener('visibilitychange', queueParallax);
    syncParallax();
  }
  // Scroll entrances are progressive enhancement: content is never pre-hidden.
  // Once revealed, a section stays in place on every subsequent visit.
  const canAnimate = () => !motionPreference.matches && !navigator.connection?.saveData;
  const entranceItems = document.querySelectorAll('.workflow-steps li, .faq-side, .closing');
  const entrances = new Map();
  const reveal = item => {
    if (!canAnimate()) return;
    const entrance = item.animate([
      { opacity: 0.7, transform: 'translateY(12px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 560, easing: 'cubic-bezier(.22,1,.36,1)' });
    entrances.set(item, entrance);
    entrance.finished.then(() => entrances.delete(item)).catch(() => {});
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    entranceItems.forEach(item => observer.observe(item));
  }
  motionPreference.addEventListener('change', () => {
    if (!motionPreference.matches) return;
    entrances.forEach(animation => animation.cancel());
    entrances.clear();
  });
})();
