/* Small local interactions; no visitor tracking. */
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const source = document.getElementById(button.dataset.copy);
    const status = document.getElementById('copy-status');
    if (!source) return;
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(source.textContent);
        copied = true;
      }
    } catch (_) { /* Fall back to text selection below. */ }
    if (!copied) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(source);
      selection.removeAllRanges();
      selection.addRange(range);
      try { copied = document.execCommand('copy'); } catch (_) { copied = false; }
      if (copied) selection.removeAllRanges();
    }
    button.textContent = copied ? 'Copied!' : 'Text selected';
    if (status) status.textContent = copied ? 'BibTeX copied to clipboard.' : 'Press Command+C or Ctrl+C to copy the selected citation.';
    window.setTimeout(() => { button.textContent = 'Copy BibTeX'; }, 2400);
  });
});
