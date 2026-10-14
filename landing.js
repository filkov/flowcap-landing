(() => {
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menu = document.querySelector('#mobile-menu');
  const opener = document.querySelector('[aria-controls="mobile-menu"]');
  const background = [...document.querySelectorAll('.nav-wrap,main,.closing,.footer')];
  const closeMenu = () => {
    background.forEach(el => { el.inert = false; });
    menu.hidden = true;
    opener.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open');
    opener.focus({preventScroll:true});
  };
  opener.addEventListener('click', () => {
    menu.hidden = false;
    background.forEach(el => { el.inert = true; });
    opener.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    menu.querySelector('[data-close]').focus();
  });
  menu.querySelectorAll('a, [data-close]').forEach(el => el.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (menu.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); }
    if (e.key === 'Tab') {
      const links = [...menu.querySelectorAll('a,button')];
      const first = links[0], last = links[links.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Reset the mobile overlay when changing to a desktop viewport.
  window.matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches && !menu.hidden) closeMenu(); });
  const gallery = document.querySelector('.gallery');
  const cards = [...gallery.children];
  const prev = document.querySelector('[data-prev]');
  const next = document.querySelector('[data-next]');
  const counter = document.querySelector('.gallery-count');
  let index = 0;
  const syncGallery = () => {
    const max = gallery.scrollWidth - gallery.clientWidth;
    const step = cards[1].offsetLeft - cards[0].offsetLeft;
    index = Math.max(0, Math.min(cards.length - 1, Math.round(gallery.scrollLeft / step)));
    prev.disabled = gallery.scrollLeft < 2;
    next.disabled = gallery.scrollLeft >= max - 2;
    const visibleEnd = Math.min(cards.length, Math.round((gallery.scrollLeft + gallery.clientWidth - parseFloat(getComputedStyle(gallery).paddingRight)) / step));
    counter.textContent = `${String(index + 1).padStart(2,'0')}–${String(Math.max(index + 1, visibleEnd)).padStart(2,'0')} / 04`;
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
