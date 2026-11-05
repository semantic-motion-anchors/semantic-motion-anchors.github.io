# Qualitative retrieval example clips

The "Qualitative retrieval examples" carousel on the project page currently uses polished placeholders.
Drop the paper-figure videos here (mp4 + optional poster jpg), then wire them into `index.html` by replacing each `.clip-slot` with a `<video>` (same pattern as the SEMANTIX clips on `dataset.html`).

Suggested filenames:

## Example 1 · Emotion (4 cards)
- `emotion-gt.mp4` (+ `emotion-gt.jpg`)
- `emotion-text-contrastive.mp4` (+ `.jpg`)
- `emotion-random-anchor.mp4` (+ `.jpg`)
- `emotion-ours.mp4` (+ `.jpg`)

## Example 2 · Self-reference (3 cards)
- `selfref-gt.mp4` (+ `selfref-gt.jpg`)
- `selfref-text-contrastive.mp4` (+ `.jpg`)  # shared Text contrastive / Random anchor card
- `selfref-ours.mp4` (+ `.jpg`)

These clips are **not** the same as `media/retrieved/*` or `media/0N-*.mp4`, which belong to the downstream generation comparison section.
