# RoSY Music Player

A full-stack local music player built with React and Django. It features a modern, premium glassmorphic user interface and automatically scans your directories for `.mp3` files to play.

## Features
- **Modern UI:** Glassmorphism design and dark aesthetic with visually pleasant Remix bubble animations.
- **Auto-Discovery:** Scans the `backend/music` directory for MP3 files and streams them dynamically.
- **Queue System:** Set tracks to 'Play Next' in a non-destructive queue.
- **Custom Player:** Fully functional audio controls, progress bar, interactive volume slider overlay, and playback speed controls (0.5x to 2.0x).
- **Remix Mode:** A special playback mode that creates a temporary playlist of all songs, playing each for a random duration (5-15s) at a randomized speed. It remembers paused timestamps, allowing precise segment resuming when looping back!

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
