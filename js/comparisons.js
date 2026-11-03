(() => {
  'use strict';
  const section = document.getElementById('comparisons');
  if (!section) return;

  const select = section.querySelector('#pair-select');
  const prev = section.querySelector('#pair-prev');
  const next = section.querySelector('#pair-next');
  const message = section.querySelector('#pair-status');
  const demo = section.querySelector('#generation-demo');
  const mainVideos = [...section.querySelectorAll(':scope > .video-pair video')];
  const demoVideos = [...demo.querySelectorAll('video')];

  function pairPlayer([left, right], play) {
    let paired = false, revision = 0;
    function pause() {
      revision++;
      paired = false;
      left.pause();
      right.pause();
      play.textContent = 'Play both';
      play.setAttribute('aria-pressed', 'false');
    }
    play.addEventListener('click', async () => {
      if (paired) { pause(); return; }
      const active = ++revision;
      if (left.ended || right.ended) left.currentTime = 0;
      right.currentTime = left.currentTime;
      right.muted = true;
      paired = true;
      play.textContent = 'Pause both';
      play.setAttribute('aria-pressed', 'true');
      try { await Promise.all([left.play(), right.play()]); }
      catch {
        if (active !== revision) return;
        pause();
        message.textContent = 'Use the controls on either video to start playback.';
      }
    });
    for (const video of [left,right]) {
      video.addEventListener('pause', () => { if (paired && video.paused) pause(); });
      video.addEventListener('ended', () => { if (paired) pause(); });
    }
    left.addEventListener('timeupdate', () => {
      if (paired && !right.seeking && Math.abs(left.currentTime-right.currentTime) > .25)
        right.currentTime = left.currentTime;
    });
    play.setAttribute('aria-pressed','false');
    play.closest('.gallery-controls').hidden = false;
    return pause;
  }

  const pauseMain = pairPlayer(mainVideos, section.querySelector('#pair-play'));
  const pauseDemo = pairPlayer(demoVideos, demo.querySelector('#demo-play'));
  // A native play button can start either panel, even without paired playback.
  section.addEventListener('play', event => {
    if (event.target.tagName !== 'VIDEO') return;
    if (demo.contains(event.target)) pauseMain();
    else pauseDemo();
  }, true);

  function setClip(video, source, poster) {
    if (video.getAttribute('src') === source) return;
    video.poster = poster;
    video.src = source;
    video.load();
  }
  function loadDemo() {
    ['baseline','anchors'].forEach((role, i) => {
      const stem = 'media/' + select.value + '-' + role;
      setClip(demoVideos[i], stem + '.mp4', stem + '.jpg');
    });
  }
  function change() {
    pauseMain();
    pauseDemo();
    ['baseline','anchors'].forEach((role, i) => {
      const stem = 'media/retrieved/' + select.value + '-' + role;
      setClip(mainVideos[i], stem + '.mp4', stem + '.jpg');
    });
    if (demo.open) loadDemo();
    prev.disabled = select.selectedIndex === 0;
    next.disabled = select.selectedIndex === select.options.length - 1;
    message.textContent = select.selectedOptions[0].text + ' selected.';
  }

  prev.addEventListener('click', () => { if (select.selectedIndex > 0) { select.selectedIndex--; change(); } });
  next.addEventListener('click', () => { if (select.selectedIndex < select.options.length - 1) { select.selectedIndex++; change(); } });
  select.addEventListener('change', change);
  demo.addEventListener('toggle', () => {
    if (demo.open) { pauseMain(); loadDemo(); }
    else pauseDemo();
  });
  change();

  function followMovedRetrieval() {
    if (['#examples-retrieval', '#examples-source-pairs'].includes(location.hash)) {
      demo.open = false;
      section.scrollIntoView({block: 'start'});
    }
  }
  followMovedRetrieval();
  window.addEventListener('hashchange', followMovedRetrieval);
})();
