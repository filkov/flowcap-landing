(() => {
  const scene = document.querySelector('.hero-scene');
  const backgroundVideo = document.querySelector('.hero-video');
  if (scene && backgroundVideo) {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
    const syncBackground = () => {
      if (motionPreference.matches || navigator.connection?.saveData) {
        backgroundVideo.pause();
        backgroundVideo.classList.remove('is-playing');
        return;
      }
      if (!inView || document.hidden) {
        backgroundVideo.pause();
        return;
      }
      if (!backgroundVideo.getAttribute('src')) backgroundVideo.src = backgroundVideo.dataset.src;
      backgroundVideo.play()?.catch(() => backgroundVideo.classList.remove('is-playing'));
    };
    backgroundVideo.addEventListener('playing', () => {
      if (!motionPreference.matches) backgroundVideo.classList.add('is-playing');
    });
    backgroundVideo.addEventListener('error', () => backgroundVideo.classList.remove('is-playing'));
    document.addEventListener('visibilitychange', syncBackground);
    motionPreference.addEventListener('change', syncBackground);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        syncBackground();
      });
      observer.observe(scene);
    }
    syncBackground();
  }
  // Decorative motion only runs while its content is visible. Static content is
  // always readable, including with reduced motion, no JavaScript or save-data.
  const motionItems = [...document.querySelectorAll('[data-motion]')];
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
  const visibleItems = new Set();
  const syncMotion = () => {
    const enabled = !motionPreference.matches && !navigator.connection?.saveData;
    document.documentElement.classList.toggle('motion-enabled', enabled);
    motionItems.forEach(item => {
      const active = visibleItems.has(item) && !document.hidden && enabled;
      item.classList.toggle('motion-active', active);
      if (active) item.classList.add('motion-seen');
    });
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleItems.add(entry.target) : visibleItems.delete(entry.target));
      syncMotion();
    }, { threshold: 0 });
    motionItems.forEach(item => observer.observe(item));
  }
  motionPreference.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();

  // Scroll entrances are progressive enhancement: content is never pre-hidden.
  // Once revealed, a section stays in place on every subsequent visit.
  const canAnimate = () => !motionPreference.matches && !navigator.connection?.saveData;
  const entranceItems = document.querySelectorAll('.workflow-steps li, .story-heading, .story-copy, .detail-card, .privacy-story header, .faq-side, .closing');
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
  // A single short product story, then a quiet, complete flow map.
  // Manual selection cancels playback. Visibility pauses the remaining time.
  const flowScene = document.querySelector('[data-flow-scene]');
  if (flowScene) {
    const controls = flowScene.querySelector('.flow-controls');
    const buttons = [...flowScene.querySelectorAll('[data-flow-select]')];
    const views = [...flowScene.querySelectorAll('[data-flow-view]')];
    const steps = ['recording', 'screens', 'map'];
    let seen = false;
    let inView = false;
    let ready = false;
    let automatic = false;
    let index = 0;
    let timer = 0;
    let startedAt = 0;
    let remaining = 2800;
    let transition;
    const selectStep = step => {
      transition?.cancel();
      flowScene.dataset.flowStep = step;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.flowSelect === step)));
      views.forEach(view => {
        const selected = view.dataset.flowView === step;
        view.hidden = !selected;
        if (selected && canAnimate()) transition = view.animate([
          { opacity: .55, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 360, easing: 'cubic-bezier(.22,1,.36,1)' });
      });
    };
    const pause = () => {
      if (!timer) return;
      clearTimeout(timer);
      timer = 0;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };
    const sync = () => {
      if (!canAnimate()) {
        transition?.cancel();
        pause();
        if (automatic) selectStep('map');
        automatic = false;
        return;
      }
      if (!inView || document.hidden) { pause(); return; }
      if (!seen) {
        if (!ready) return;
        seen = true;
        automatic = true;
        index = 0;
        selectStep(steps[index]);
      }
      if (!automatic || timer) return;
      startedAt = performance.now();
      timer = window.setTimeout(() => {
        timer = 0;
        index += 1;
        selectStep(steps[index]);
        remaining = 2800;
        if (index === steps.length - 1) automatic = false;
        sync();
      }, remaining);
    };
    controls.hidden = false;
    buttons.forEach(button => button.addEventListener('click', () => {
      pause();
      seen = true;
      automatic = false;
      selectStep(button.dataset.flowSelect);
    }));
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        ready = entry.intersectionRatio >= .45;
        sync();
      }, { threshold: [0, .45] });
      observer.observe(flowScene);
    }
    motionPreference.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
  }
  const tabs = [...document.querySelectorAll('[data-handoff]')];
  const exportViews = [...document.querySelectorAll('[data-export-view]')];
  const destinations = document.querySelector('.export-destinations');
  if (destinations) {
    destinations.querySelectorAll('.handoff-panel').forEach(panel => {
      panel.setAttribute('aria-hidden', String(panel.hidden));
      panel.inert = panel.hidden;
    });
    destinations.classList.add('destinations-ready');
  }
  let exportTransition;
  motionPreference.addEventListener('change', () => { if (!canAnimate()) exportTransition?.cancel(); });
  const activateTab = tab => {
    exportTransition?.cancel();
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(`panel-${item.dataset.handoff}`);
      panel.hidden = !selected;
      panel.setAttribute('aria-hidden', String(!selected));
      panel.inert = !selected;
    });
    exportViews.forEach(view => {
      const selected = view.dataset.exportView === tab.dataset.handoff;
      view.setAttribute('aria-hidden', String(!selected));
      view.inert = !selected;
      if (selected && canAnimate()) exportTransition = view.animate([
        { opacity: .6, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 280, easing: 'ease-out' });
    });
  };
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', event => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      activateTab(tabs[nextIndex]);
      tabs[nextIndex].focus();
    });
  });
})();
