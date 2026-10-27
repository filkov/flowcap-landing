(() => {
  const scene = document.querySelector('.hero-scene');
  const navigation = document.querySelector('.landing-page .nav-wrap');
  if (navigation) {
    let navigationFrame = 0;
    const syncNavigation = () => {
      navigationFrame = 0;
      navigation.classList.toggle('is-at-top', window.scrollY <= 32);
    };
    window.addEventListener('scroll', () => {
      if (!navigationFrame) navigationFrame = requestAnimationFrame(syncNavigation);
    }, { passive: true });
    window.addEventListener('pageshow', syncNavigation);
    syncNavigation();
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
