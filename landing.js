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
  const entranceItems = document.querySelectorAll('.workflow-steps li, .story-heading, .story-copy, .detail-card, .handoff-heading, .export-board, .privacy-story header, .faq-side, .closing');
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
    document.querySelectorAll('.handoff-panel, .request-example').forEach(item => item.getAnimations().forEach(animation => animation.cancel()));
  });
  const animateChange = item => {
    item.getAnimations().forEach(animation => animation.cancel());
    if (canAnimate()) item.animate([
      { opacity: 0.55, transform: 'translateY(0)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)' });
  };

  const tabs = [...document.querySelectorAll('[data-handoff]')];
  const activateTab = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      panel.hidden = !selected;
      if (selected) animateChange(panel);
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
  const requests = {
    review: 'Review this flow and its linked comments. Identify confusing steps and suggest improvements.',
    friction: 'Follow this journey screen by screen. Where could someone get stuck, and what would make the next step clearer?',
    changes: 'Use these screens and comments to propose a focused improvement plan. Explain what to change and why.'
  };
  const requestOptions = [...document.querySelectorAll('[data-request]')];
  const requestExample = document.querySelector('.request-example');
  requestOptions.forEach(option => option.addEventListener('click', () => {
    requestOptions.forEach(item => item.setAttribute('aria-pressed', String(item === option)));
    requestExample.textContent = `“${requests[option.dataset.request]}”`;
    animateChange(requestExample);
  }));
})();
