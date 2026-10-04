# Road to Ironman Texas

Aiden Matano's training countdown site for IRONMAN Texas (Apr 24, 2027).
Mirrored from [roadtoimtexas.com](https://roadtoimtexas.com). React + Vite.

Live: https://lundbergscotty.github.io/road-to-ironman-texas/

## Edit athlete details

All personalization lives in the `ATHLETE` block at the top of `src/RoadToTexas.jsx`
(name, wordmark, plan start date, race date).

## Run locally

```
npm install
npm run dev
```

## Deploy

Push to `main`. The GitHub Actions workflow in `.github/workflows/deploy.yml` builds
and publishes to GitHub Pages automatically.

One-time setup: repo Settings → Pages → Source → **GitHub Actions**.
