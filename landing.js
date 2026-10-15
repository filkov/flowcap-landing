(() => {
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
  const gallery = document.querySelector('.gallery');
  const cards = [...gallery.children];
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const counter = document.querySelector('.gallery-count');
  let index = 0;
  const syncGallery = () => {
    const max = gallery.scrollWidth - gallery.clientWidth;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    document.querySelector(".gallery-actions").hidden = max <= 2;
    gallery.tabIndex = max > 2 ? 0 : -1;
    gallery.setAttribute("aria-label", max > 2 ? "Flow Capture screens. Scroll to explore four features." : "Flow Capture screens: library, map, comments, and versions.");
    index = Math.max(0, Math.min(cards.length - 1, Math.round(gallery.scrollLeft / step)));
    prev.disabled = gallery.scrollLeft < 2;
    next.disabled = gallery.scrollLeft >= max - 2;
    counter.textContent = `${String(index + 1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  };
  const move = delta => {
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    gallery.scrollBy({left:delta*step,behavior:reducedMotion()?'instant':'smooth'});
  };
  prev.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  gallery.addEventListener('scroll',syncGallery,{passive:true});
  gallery.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight'?1:-1); }
  });
  window.addEventListener('resize',syncGallery);
  syncGallery();
  const dialog = document.querySelector('.art-dialog');
  const enlarged = dialog.querySelector('img');
  const artTitle = document.querySelector('#art-title');
  const titles = {capture:'From recording to a clear flow',map:'Every step. Connected.',voice:'Your voice. In context.',versions:'Every version. One flow.',library:'All your flows. One library.',handoff:'Ready for Figma & AI'};
  document.querySelectorAll('[data-art]').forEach(button => button.addEventListener('click', () => {
    enlarged.src = `assets/campaign/${button.dataset.art}-1320.webp`;
    enlarged.alt = button.querySelector('img').alt;
    artTitle.textContent = titles[button.dataset.art];
    dialog.showModal();
    dialog.scrollTop = 0;
  }));
  dialog.querySelector('[data-close-art]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();} });
})();
