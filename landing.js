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
  const syncMotion = () => motionItems.forEach(item => {
    item.classList.toggle('motion-active', visibleItems.has(item) && !document.hidden && !motionPreference.matches && !navigator.connection?.saveData);
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? visibleItems.add(entry.target) : visibleItems.delete(entry.target));
      syncMotion();
    }, { threshold: 0.2 });
    motionItems.forEach(item => observer.observe(item));
  }
  motionPreference.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);

  const tabs = [...document.querySelectorAll('[data-handoff]')];
  const activateTab = tab => {
    tabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
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
