(() => {
  const scene = document.querySelector('.hero-scene');
  const setupLoop = (video, target) => {
    if (!video || !target) return;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let inView = true;
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
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.play()?.catch(() => video.classList.remove('is-playing'));
    };
    video.addEventListener('playing', () => {
      if (!motionPreference.matches && !navigator.connection?.saveData && inView && !document.hidden) video.classList.add('is-playing');
      else syncPlayback();
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
  setupLoop(document.querySelector('.hero-video'), scene);
  setupLoop(document.querySelector('.hero-demo'), document.querySelector('.hero-phone'));
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
