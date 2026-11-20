(() => {
  const album = document.querySelector('#examples-clips');
  if (!album) return;
  const players = new Map();
  const mounted = new WeakSet();
  let apiRequested = false;
  const pending = new Set();
  const stops = new Map();
  const timers = new Map();

  function mount(card) {
    if (!card?.classList.contains('ted-sample')) return;
    const frame = card.querySelector('iframe');
    const params = new URLSearchParams({
      enablejsapi: '1', origin: location.origin, playsinline: '1', rel: '0',
      start: Math.floor(Number(card.dataset.contextStart))
    });
    if (!frame.hasAttribute('src')) frame.src = `https://www.youtube.com/embed/${card.dataset.youtubeId}?${params}`;
    if (!window.YT?.Player) {
      if (!apiRequested) {
        apiRequested = true;
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.append(script);
      }
      return;
    }
    if (mounted.has(card)) return;
    mounted.add(card);
    connect(card);
  }

  function segment(card, mode) {
    return {
      videoId: card.dataset.youtubeId,
      startSeconds: Number(card.dataset[`${mode}Start`])
    };
  }

  function connect(card) {
      const frame = card.querySelector('iframe');
      const controls = card.querySelector('.clip-controls');
      const message = card.querySelector('.ted-player-message');
      new YT.Player(frame.id, {events: {
        onReady(event) {
          players.set(card, event.target);
          stops.set(card, Number(card.dataset.contextEnd));
          event.target.cueVideoById(segment(card, 'context'));
          controls.hidden = false;
          controls.querySelectorAll('[data-mode]').forEach(button => {
            button.addEventListener('click', () => {
              const mode = button.dataset.mode;
              pending.add(card);
              stops.set(card, Number(card.dataset[`${mode}End`]));
              message.hidden = true;
              event.target.loadVideoById(segment(card, mode));
              controls.querySelectorAll('[data-mode]').forEach(option => {
                option.setAttribute('aria-pressed', String(option === button));
              });
              const url = new URL(card.querySelector('.ted-watch').href);
              url.searchParams.set('t', Math.floor(Number(card.dataset[`${mode}Start`])) + 's');
              card.querySelector('.ted-watch').href = url.href;
              const stamp = card.querySelector('.ted-watch-time');
              if (stamp) {
                const seconds = Math.floor(Number(card.dataset[`${mode}Start`]));
                stamp.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
              }
            });
          });
        },
        onStateChange(event) {
          clearInterval(timers.get(card));
          if (event.data === YT.PlayerState.PLAYING) {
            pending.delete(card);
            if (card.dataset.position !== 'front') {
              event.target.pauseVideo();
              return;
            }
            // Pause on the last frame of this excerpt instead of ending the whole talk.
            if (stops.has(card)) timers.set(card, setInterval(() => {
              if (event.target.getCurrentTime() >= stops.get(card)) {
                stops.delete(card);
                clearInterval(timers.get(card));
                event.target.pauseVideo();
              }
            }, 80));
          }
        },
        onError() {
          pending.delete(card);
          clearInterval(timers.get(card));
          message.textContent = 'This video cannot play here. Please use Watch on YouTube.';
          message.hidden = false;
        },
        onAutoplayBlocked() {
          if (!pending.has(card)) return;
          message.textContent = 'Press play in the YouTube player to start.';
          message.hidden = false;
        }
      }});
  }

  window.onYouTubeIframeAPIReady = () => mount(album.querySelector('[data-position="front"]'));

  album.addEventListener('carouselchange', event => {
    const {from, to} = event.detail;
    pending.delete(from);
    clearInterval(timers.get(from));
    players.get(from)?.pauseVideo();
    mount(to);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) players.forEach(player => player.pauseVideo());
  });
  mount(album.querySelector('[data-position="front"]'));
})();
