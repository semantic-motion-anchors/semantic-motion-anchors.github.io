(() => {
  const album = document.querySelector('#examples-clips');
  for (const card of album.querySelectorAll('article')) {
    const buttons = [...card.querySelectorAll('button.segment')];
    const controls = card.querySelector('.clip-controls');
    const player = card.querySelector('.ted-player');
    const video = card.querySelector('video');
    let end = null;
    function choose(button) {
      buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
      if (player) {
        player.querySelector('iframe')?.remove();
        const frame = document.createElement('iframe');
        frame.title = player.dataset.title;
        frame.allow = 'autoplay; fullscreen; encrypted-media; picture-in-picture';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        frame.src = button.dataset.src;
        player.append(frame);
      } else {
        end = button.dataset.end ? Number(button.dataset.end) : null;
        video.currentTime = Number(button.dataset.begin);
        video.play().catch(() => {});
      }
    }
    for (const button of buttons) button.addEventListener('click', () => choose(button));
    controls.hidden = false;
    if (player) {
      player.querySelector('.ted-cover').addEventListener('click', () => choose(buttons[1]));
      new MutationObserver(() => {
        if (card.inert) player.querySelector('iframe')?.remove();
      }).observe(card, {attributes: true, attributeFilter: ['inert']});
    } else {
      video.addEventListener('timeupdate', () => {
        if (end !== null && video.currentTime >= end) { video.pause(); end = null; }
      });
    }
  }
})();
