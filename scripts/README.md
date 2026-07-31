# Scripts

- `seed-demo-pages.js` — seeds the four demo game pages (Hades, Stardew
  Valley, Hollow Knight, Celeste) into the storage backend through the API.
  Fetches screenshots/details live from the Steam store API.

  ```bash
  # backend must be running (npm run dev:backend)
  node scripts/seed-demo-pages.js            # -> http://localhost:8080
  API_URL=https://your-demo.vercel.app/api node scripts/seed-demo-pages.js
  ```
