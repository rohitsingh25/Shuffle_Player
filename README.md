# RoSY Music Player

A full-stack local music player built with React and Django. It features a modern, premium glassmorphic user interface and automatically scans your directories for `.mp3` files to play.

## Features
- **Modern UI:** Glassmorphism design and dark aesthetic with visually pleasant Remix bubble animations.
- **Auto-Discovery:** Scans the `backend/music` directory for MP3 files and streams them dynamically.
- **Queue System:** Set tracks to 'Play Next' in a non-destructive queue.
- **Custom Player:** Fully functional audio controls, progress bar, interactive volume slider overlay, and playback speed controls (0.5x to 2.0x).
- **Remix Mode:** A special playback mode that creates a temporary playlist of all songs, playing each for a random duration (5-15s) at a randomized speed. It remembers paused timestamps, allowing precise segment resuming when looping back!

## Assets & Branding
The application uses a custom-designed branding package:
- **Branding Icon:** A sleek glowing neon music note combined with elegant shuffle arrows on a deep dark blue background.
- **Multi-Resolution Favicons:** Includes optimized `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, and a 180x180 `apple-touch-icon.png` for iOS bookmarking.
- **Web App Manifest (`manifest.json`):** Declares application name, theme colors (`#0d1117`), and app launcher icons (`android-chrome-192x192.png`, `android-chrome-512x512.png`) for Progressive Web App support.
- **Clean Console Output:** Build and dev servers utilize Node's `--no-warnings` flag to suppress dependency deprecation warnings (e.g. `fs.F_OK` warning) on newer Node.js releases.

## Project Structure
- `backend/`: Python Django application to discover local MP3s and stream them dynamically.
- `frontend/`: React application containing all UI components and playback logic.

## Prerequisites
- Node.js (for frontend)
- Python 3.8+ (for backend)

## Quickstart

### 1. Start the Backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd backend
python manage.py runserver 5000
```
The backend runs on http://localhost:5000.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm start
```
The frontend application will launch at http://localhost:3000.

## Note on `.mp3` Files
To add music, place standard `.mp3` files into the `backend/music` directory. The application also automatically detects supported files from your system's `Music` and `Downloads` folders (Linux/macOS defaults).

## Deployment

### Vercel
1. Commit and push the repository to GitHub.
2. In Vercel dashboard, import the GitHub repo.
3. Vercel automatically detects the `frontend` folder as the project root.
4. Ensure the **Build Command** is `npm install && npm run build` and **Output Directory** is `frontend/build`.
5. The `vercel.json` file rewrites all routes to `index.html` for SPA support.
6. After the first deploy, the site will be live at `<your-project>.vercel.app`.

### Render
1. In Render dashboard, create a **Static Site**.
2. Connect your GitHub repository and select the `frontend` directory.
3. Set **Build Command** to `npm install && npm run build`.
4. Set **Publish Directory** to `frontend/build`.
5. Add the `render.yaml` file (already present) to configure automatic deploys.
6. Deploy and your site will be accessible via the provided Render URL.

Both platforms serve the built static files; the client‑side scanning runs in the browser, so no additional backend setup is required.
