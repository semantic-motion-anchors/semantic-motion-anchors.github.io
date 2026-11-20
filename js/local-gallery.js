(() => {
  document.querySelectorAll('[data-carousel]').forEach(panel => {
    const slides = [...panel.querySelectorAll('.example-slide')];
    const pager = panel.querySelector('.examples-pager');
    const count = panel.querySelector('.examples-count');
    const status = panel.querySelector('.examples-status');
    const album = panel.classList.contains('method-album');
    const loop = panel.dataset.loop !== 'false';
    const dots = [...pager.querySelectorAll('[data-to]')];
    let index = 0;
    function show(target, announce) {
      const from = slides[index];
      from.querySelectorAll('video').forEach(video => { if (!video.paused) video.pause(); });
      index = loop ? (target + slides.length) % slides.length : Math.max(0, Math.min(target, slides.length - 1));
      const previous = loop ? (index + slides.length - 1) % slides.length : index - 1;
      const next = loop ? (index + 1) % slides.length : index + 1;
      slides.forEach((slide, j) => {
        if (!album) {
          slide.hidden = j !== index;
          return;
        }
        let position = 'back';
        if (j === index) position = 'front';
        else if (j === previous) position = 'left';
        else if (j === next) position = 'right';
        slide.dataset.position = position;
        slide.inert = j !== index;
        slide.setAttribute('aria-hidden', String(j !== index));
        dots[j].setAttribute('aria-current', String(j === index));
      });
      count.textContent = (index + 1) + ' / ' + slides.length;
      if (!loop) pager.querySelectorAll('[data-step]').forEach(button => {
        button.disabled = Number(button.dataset.step) < 0 ? index === 0 : index === slides.length - 1;
      });
      if (from !== slides[index]) {
        panel.dispatchEvent(new CustomEvent('carouselchange', {detail: {from, to: slides[index]}}));
      }
      if (announce) {
        const active = slides[index];
        status.textContent = (panel.dataset.itemName || 'Example') + ' ' + (index + 1) + ' of ' + slides.length + '.' + (active.dataset.label ? ' ' + active.dataset.label : '');
      }
    }
    pager.querySelectorAll('[data-step]').forEach(button => {
      button.addEventListener('click', () => show(index + Number(button.dataset.step), true));
    });
    dots.forEach((button, j) => button.addEventListener('click', () => show(j, true)));
    // Arrow keys on the pager change examples. Native video controls keep their own shortcuts.
    pager.addEventListener('keydown', event => {
      if (event.target.matches('select')) return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      show(index + (event.key === 'ArrowLeft' ? -1 : 1), true);
      if (event.target.matches('[data-to]')) dots[index].focus();
    });
    show(0, false);
    pager.hidden = slides.length < 2;
    if (album) panel.classList.add('is-ready');
  });

  // Earlier local preview links now lead to the collections' new locations.
  function followMovedClips() {
    if (location.hash === '#examples-clips' && document.querySelector('.study-album')) {
      location.replace('dataset.html#examples');
    }
  }
  followMovedClips();
  window.addEventListener('hashchange', followMovedClips);
})();
