document.querySelectorAll('#examples-clips .clip-controls').forEach(controls => {
  const video = controls.parentElement.querySelector('video');
  if (!video) return;
  const buttons = controls.querySelectorAll('button[data-src]');
  buttons.forEach(button => button.addEventListener('click', () => {
    if (video.getAttribute('src') !== button.dataset.src) video.src = button.dataset.src;
    buttons.forEach(option => option.setAttribute('aria-pressed', String(option === button)));
    video.play().catch(() => {});
  }));
  controls.hidden = false;
});
