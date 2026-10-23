# Physics-Conditioned Video Diffusion for Fusion Capsule Polishing — project page

Project page for the NeurIPS 2026 paper *Physics-Conditioned Video Diffusion with
Kinematic Priors for Fusion Capsule Polishing*.

Live page: https://shashankgalla.github.io/phy-cond-video-diff-icf-capsule-polishing-page/

## Local preview

```bash
python3 -m http.server 8000
```

then open `http://localhost:8000`, or just open `index.html` directly in a browser
(all asset paths are relative).

## Structure

- `index.html`, `style.css`, `script.js` — the page and its scroll-reveal /
  stat-counter / methodology-stepper interactions
- `assets/img/` — figures
- `assets/video/` — generated-video clips (H.264 mp4) and a tracking-demo GIF
- `assets/paper/` — the camera-ready PDF, linked from the page directly
  (the page repo does not reference the research repo, so this must stay a
  real local copy, not a relative path out of this repo)
