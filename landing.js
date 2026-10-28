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
    let frame = 0, lastTime = 0;
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
      let moving = false;
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
    const release = () => { chips.forEach(chip => { chip.tx = chip.ty = 0; }); start(); };
    ribbon.addEventListener('pointermove', event => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const rect = ribbon.getBoundingClientRect();
      chips.forEach(chip => {
        const dx = event.clientX - rect.left - chip.left - chip.width / 2;
        const dy = event.clientY - rect.top - chip.top - chip.height / 2;
        const attraction = Math.pow(Math.max(0, 1 - Math.hypot(dx, dy) / 180), 2) * .2;
        chip.tx = Math.max(-9, Math.min(9, dx * attraction));
        chip.ty = Math.max(-9, Math.min(9, dy * attraction));
      });
      start();
    }, { passive: true });
    ribbon.addEventListener('pointerleave', release);
    ribbon.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    reduced.addEventListener('change', () => {
      if (!reduced.matches) return;
      cancelAnimationFrame(frame); frame = 0;
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
  const setupLoop = (video, target, onFirstFrame, deferUntilVisible = false) => {
    if (!video || !target) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = !deferUntilVisible || !('IntersectionObserver' in window);
    let framePending = false;
    let framePresented = false;
    const revealFrame = () => {
      framePending = false;
      if (video.paused || video.readyState < 2 || !inView || document.hidden || motionPreference.matches || navigator.connection?.saveData) return;
      video.classList.add('is-playing');
      if (!framePresented) {
        framePresented = true;
        onFirstFrame?.();
      }
    };
    const syncPlayback = () => {
      if (motionPreference.matches || navigator.connection?.saveData) {
        video.pause();
        video.classList.remove('is-playing');
        return;
      }
      if (!inView || document.hidden) {
        video.pause();
        return;
      }
      if (!video.getAttribute('src')) {
        video.src = window.innerWidth <= 760 && video.dataset.srcMobile ? video.dataset.srcMobile : video.dataset.src;
      }
      video.play()?.catch(() => video.classList.remove('is-playing'));
    };
    video.addEventListener('playing', () => {
      if (motionPreference.matches || navigator.connection?.saveData || !inView || document.hidden) {
        syncPlayback();
        return;
      }
      if (framePending) return;
      framePending = true;
      // Keep the complete poster visible until a decoded frame is presented.
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(revealFrame);
      else requestAnimationFrame(() => requestAnimationFrame(revealFrame));
    });
    video.addEventListener('error', () => video.classList.remove('is-playing'));
    document.addEventListener('visibilitychange', syncPlayback);
    motionPreference.addEventListener('change', syncPlayback);
    navigator.connection?.addEventListener?.('change', syncPlayback);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      });
      observer.observe(target);
    }
    syncPlayback();
  };
  const background = document.querySelector('.hero-video');
  const demo = document.querySelector('.hero-demo');
  if (demo) {
    let firstFramePresented = false;
    let backgroundScheduled = false;
    const startBackgroundWhenBuffered = () => {
      if (!firstFramePresented || backgroundScheduled || !demo.buffered.length) return;
      const bufferedEnd = demo.buffered.end(demo.buffered.length - 1);
      if (bufferedEnd - demo.currentTime < 8 && bufferedEnd < demo.duration - .1) return;
      backgroundScheduled = true;
      // Give the phone's useful content priority over the decorative lake loop.
      window.setTimeout(() => setupLoop(background, scene), 1000);
    };
    demo.addEventListener('progress', startBackgroundWhenBuffered);
    demo.addEventListener('canplaythrough', startBackgroundWhenBuffered);
    setupLoop(demo, document.querySelector('.hero-phone'), () => {
      firstFramePresented = true;
      startBackgroundWhenBuffered();
    });
  } else setupLoop(background, scene);
  // Feature demos load only as their cards enter the viewport.
  document.querySelectorAll('.product-demo').forEach(video => {
    setupLoop(video, video.closest('figure'), undefined, true);
  });
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
