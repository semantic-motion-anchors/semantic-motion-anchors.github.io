(() => {
  document.querySelectorAll('.study-album').forEach(album => {
  const jump = album.querySelector('.study-jump');
  const dots = [...album.querySelectorAll('.album-dot')];
  const status = album.querySelector('.examples-status');
  const cards = [...album.querySelectorAll('.study-card')];
  function showPosters(container) {
    container.querySelectorAll('video[data-poster]:not([poster])').forEach(video => { video.poster = video.dataset.poster; });
  }
  function showNearbyPosters(card) {
    const index = cards.indexOf(card);
    for (const offset of [-1, 0, 1]) {
      const neighbor = cards[(index + offset + cards.length) % cards.length];
      showPosters(neighbor);
    }
  }
  showNearbyPosters(cards[0]);

  for (const pair of album.querySelectorAll('.study-pair')) {
    const [left, right] = pair.querySelectorAll('video');
    const button = pair.querySelector('.play-pair');
    let paired = false, revision = 0;
    function pauseBoth() {
      paired = false;
      revision++;
      if (!left.paused) left.pause();
      if (!right.paused) right.pause();
      button.textContent = 'Play both';
      button.setAttribute('aria-pressed', 'false');
    }
    button.addEventListener('click', async () => {
      if (paired) { pauseBoth(); return; }
      const active = ++revision;
      if (left.ended || right.ended) left.currentTime = 0;
      right.currentTime = left.currentTime;
      right.muted = true;
      paired = true;
      button.textContent = 'Pause both';
      button.setAttribute('aria-pressed', 'true');
      try { await Promise.all([left.play(), right.play()]); }
      catch {
        if (revision !== active) return;
        pauseBoth();
        status.textContent = 'Use the controls on either video to start playback.';
      }
    });
    for (const video of [left,right]) {
      video.addEventListener('pause', () => { if (paired && video.paused) pauseBoth(); });
      video.addEventListener('ended', () => { if (paired) pauseBoth(); });
    }
    left.addEventListener('timeupdate', () => {
      if (paired && !right.seeking && Math.abs(left.currentTime - right.currentTime) > .25)
        right.currentTime = left.currentTime;
    });
    button.parentElement.hidden = false;
  }

  album.addEventListener('play', event => {
    if (event.target.tagName !== 'VIDEO') return;
    const video = event.target;
    if (video.paused) return;
    const card = video.closest('.study-card');
    if (card.inert) { video.pause(); return; }
    for (const other of document.querySelectorAll('video')) {
      if (!other.paused && other.closest('.study-pair') !== video.closest('.study-pair')) other.pause();
    }
  }, true);
  album.addEventListener('carouselchange', event => {
    const {to} = event.detail;
    jump.value = to.dataset.example;
    showNearbyPosters(to);
  });
  jump.addEventListener('change', () => dots[jump.selectedIndex].click());

  let start = null;
  album.addEventListener('touchstart', event => {
    start = event.touches.length === 1 && !event.target.closest('video,button,select,summary,a') ? event.touches[0] : null;
  }, {passive: true});
  album.addEventListener('touchcancel', () => { start = null; }, {passive: true});
  album.addEventListener('touchend', event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.clientX;
    const dy = event.changedTouches[0].clientY - start.clientY;
    start = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > 1.5 * Math.abs(dy))
      album.querySelector(dx < 0 ? '[data-step="1"]' : '[data-step="-1"]').click();
  }, {passive: true});

  });
  function followMovedRetrieval() {
    if (['#qualitative', '#examples-retrieval', '#examples-source-pairs'].includes(location.hash))
      document.getElementById('retrieval')?.scrollIntoView({block: 'start'});
  }
  followMovedRetrieval();
  window.addEventListener('hashchange', followMovedRetrieval);
})();
