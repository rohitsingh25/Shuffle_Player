import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Player from './components/Player';
import Library from './components/Library';
import Queue from './components/Queue';
import { Music2, FolderOpen, ShieldCheck, RefreshCw } from 'lucide-react';

const isFSASupported = typeof window !== 'undefined' && 'showDirectoryPicker' in window;

function WelcomeScreen({ onBrowse, isScanning }) {
    return (
        <div className="welcome-overlay">
            <div className="welcome-card">
                <div className="welcome-logo">
                    <div className="welcome-logo-ring">
                        <Music2 size={40} className="welcome-logo-icon" />
                    </div>
                </div>

                <h1 className="welcome-title">RoSY Music Player</h1>
                <p className="welcome-subtitle">Your personal music — beautifully played.</p>

                <div className="welcome-permission-box">
                    <ShieldCheck size={18} className="permission-icon" />
                    <div>
                        <div className="permission-title">Folder Access Required</div>
                        <div className="permission-desc">
                            The browser will ask you to grant <strong>read-only</strong> access
                            to your music folder. Your files never leave your device.
                        </div>
                    </div>
                </div>

                <div className="welcome-features">
                    <div className="feature-item">🎵 Plays MP3 files from any folder</div>
                    <div className="feature-item">📂 Scans sub-folders automatically</div>
                    <div className="feature-item">🔀 Remix mode for shuffle playback</div>
                    <div className="feature-item">🔒 100% local — no uploads, no cloud</div>
                </div>

                {!isFSASupported ? (
                    <div className="browser-warning">
                        ⚠️ Your browser doesn't support the File System Access API.
                        Please use <strong>Chrome</strong> or <strong>Edge</strong> for full functionality.
                    </div>
                ) : (
                    <button
                        className="browse-btn"
                        onClick={onBrowse}
                        disabled={isScanning}
                        id="browse-music-folder-btn"
                    >
                        {isScanning ? (
                            <>
                                <RefreshCw size={20} className="spin" />
                                Scanning folder…
                            </>
                        ) : (
                            <>
                                <FolderOpen size={20} />
                                Browse Music Folder
                            </>
                        )}
                    </button>
                )}

                <p className="welcome-hint">
                    A system dialog will open — select your music folder to continue.
                </p>
            </div>

            {/* Animated background */}
            <div className="welcome-bg-blob blob-1"></div>
            <div className="welcome-bg-blob blob-2"></div>
            <div className="welcome-bg-blob blob-3"></div>
        </div>
    );
}

function PermissionModal({ onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="permission-modal glass-panel">
                <div className="modal-header">
                    <ShieldCheck size={36} className="modal-shield-icon" />
                    <h3>Grant Directory Access</h3>
                </div>
                <div className="modal-body">
                    <p className="modal-intro">
                        To load and play your local audio files, RoSY Music Player requires permission to read directories.
                    </p>
                    <div className="modal-info-cards">
                        <div className="info-card">
                            <span className="info-card-icon">📂</span>
                            <div className="info-card-text">
                                <strong>Directory Scanning</strong>
                                <p>Lists and registers .mp3 files inside the folder and subfolders.</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <span className="info-card-icon">🔒</span>
                            <div className="info-card-text">
                                <strong>100% Local Privacy</strong>
                                <p>Files are read locally in your browser. Absolutely no data is uploaded.</p>
                            </div>
                        </div>
                        <div className="info-card">
                            <span className="info-card-icon">🛡️</span>
                            <div className="info-card-text">
                                <strong>Read-Only Access</strong>
                                <p>The app will never edit, rename, or delete any of your files.</p>
                            </div>
                        </div>
                    </div>
                    <p className="modal-system-notice">
                        Clicking <strong>Grant & Browse</strong> will open your browser's folder selector. Please approve the browser's permission prompt if asked.
                    </p>
                </div>
                <div className="modal-footer">
                    <button className="modal-btn secondary-btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="modal-btn primary-btn" onClick={onConfirm} id="confirm-permission-btn">
                        Grant & Browse
                    </button>
                </div>
            </div>
        </div>
    );
}

function App() {
    const [localSongs, setLocalSongs] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [scanError, setScanError] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [showPermissionModal, setShowPermissionModal] = useState(false);

    const handleBrowseClick = () => {
        setScanError(null);
        setShowPermissionModal(true);
    };

    const handlePermissionConfirm = () => {
        setShowPermissionModal(false);
        handleFolderPick();
    };

    const handlePermissionCancel = () => {
        setShowPermissionModal(false);
    };

    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [volume, setVolume] = useState(1.0);
    const [isRemixMode, setIsRemixMode] = useState(false);

    const remixStateRef = useRef({
        isActive: false,
        queue: [],
        currentIndex: 0,
        positions: {},
        targetTime: 0
    });

    // Keep latest songs accessible in event callbacks without stale closure
    const latestSongsRef = useRef(localSongs);
    useEffect(() => {
        latestSongsRef.current = localSongs;
    }, [localSongs]);

    const audioRef = useRef(new Audio());

    // Clear any stale localStorage from old version
    useEffect(() => {
        localStorage.removeItem('localSongs');
        localStorage.removeItem('localSongsMeta');
    }, []);

    // ─── Audio Event Listeners ────────────────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;

        const onLoaded = () => setDuration(audio.duration);
        const onTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
            const state = remixStateRef.current;
            if (state.isActive && audio.currentTime >= state.targetTime && !audio.paused && state.queue.length > 0) {
                const currentId = state.queue[state.currentIndex];
                state.positions[currentId] = audio.currentTime;
                state.currentIndex = (state.currentIndex + 1) % state.queue.length;
                playNextRemixSegment();
            }
        };
        const onEnded = () => {
            if (remixStateRef.current.isActive) {
                const state = remixStateRef.current;
                if (state.queue.length > 0) {
                    state.queue.splice(state.currentIndex, 1);
                    if (state.currentIndex >= state.queue.length) state.currentIndex = 0;
                    if (state.queue.length > 0) playNextRemixSegment();
                    else toggleRemixMode();
                }
            } else {
                handleNext();
            }
        };

        audio.addEventListener('loadeddata', onLoaded);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        return () => {
            audio.removeEventListener('loadeddata', onLoaded);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
        };
    }, [currentSong, queue]); // eslint-disable-line

    useEffect(() => { audioRef.current.playbackRate = playbackSpeed; }, [playbackSpeed]);
    useEffect(() => { audioRef.current.volume = volume; }, [volume]);

    useEffect(() => {
        if (isPlaying) audioRef.current.play().catch(e => console.log(e));
        else audioRef.current.pause();
    }, [isPlaying, currentSong]);

    // ─── Playback Controls ────────────────────────────────────────────────────
    const playSong = (song) => {
        setCurrentSong(song);
        audioRef.current.src = song.url;
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (!currentSong && localSongs.length > 0) playSong(localSongs[0]);
        else if (currentSong) setIsPlaying(!isPlaying);
    };

    const handleNext = () => {
        if (queue.length > 0) {
            const nextSong = queue[0];
            setQueue(queue.slice(1));
            playSong(nextSong);
        } else {
            const idx = localSongs.findIndex(s => s.id === currentSong?.id);
            if (idx !== -1 && idx < localSongs.length - 1) playSong(localSongs[idx + 1]);
            else if (localSongs.length > 0) playSong(localSongs[0]);
        }
    };

    const handlePrev = () => {
        if (isRemixMode) return;
        const idx = localSongs.findIndex(s => s.id === currentSong?.id);
        if (idx > 0) playSong(localSongs[idx - 1]);
        else if (localSongs.length > 0) playSong(localSongs[localSongs.length - 1]);
    };

    const addToQueue = (song) => setQueue([...queue, song]);
    const removeFromQueue = (index) => {
        const q = [...queue];
        q.splice(index, 1);
        setQueue(q);
    };
    const playFromQueue = (index) => {
        const song = queue[index];
        removeFromQueue(index);
        playSong(song);
    };

    const handleSeek = (e) => {
        const bounds = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - bounds.left) / bounds.width;
        audioRef.current.currentTime = percent * duration;
        setCurrentTime(percent * duration);
    };

    // ─── Remix Mode ────────────────────────────────────────────────────────────
    const playNextRemixSegment = () => {
        const state = remixStateRef.current;
        const songs = latestSongsRef.current;
        if (state.queue.length === 0 || songs.length === 0) { if (isRemixMode) toggleRemixMode(); return; }
        if (state.currentIndex >= state.queue.length) state.currentIndex = 0;
        const songId = state.queue[state.currentIndex];
        const songToPlay = songs.find(s => s.id === songId);
        if (!songToPlay) { state.queue.splice(state.currentIndex, 1); playNextRemixSegment(); return; }
        const startPos = state.positions[songId] || 0;
        state.targetTime = startPos + Math.floor(Math.random() * 11) + 5;
        const speed = (Math.floor(Math.random() * 7) + 2) * 0.25;
        setPlaybackSpeed(speed);
        setCurrentSong(songToPlay);
        audioRef.current.src = songToPlay.url;
        audioRef.current.currentTime = startPos;
        audioRef.current.defaultPlaybackRate = speed;
        audioRef.current.playbackRate = speed;
        setIsPlaying(true);
    };

    const toggleRemixMode = () => {
        const newMode = !isRemixMode;
        setIsRemixMode(newMode);
        remixStateRef.current.isActive = newMode;
        if (newMode) {
            const songs = latestSongsRef.current;
            if (songs.length === 0) { setIsRemixMode(false); remixStateRef.current.isActive = false; return; }
            remixStateRef.current.queue = songs.map(s => s.id).sort(() => Math.random() - 0.5);
            remixStateRef.current.currentIndex = 0;
            remixStateRef.current.positions = {};
            playNextRemixSegment();
        } else {
            remixStateRef.current.queue = [];
            remixStateRef.current.positions = {};
            setPlaybackSpeed(1.0);
            if (!currentSong && localSongs.length > 0) playSong(localSongs[0]);
            else if (currentSong) setIsPlaying(true);
        }
    };

    // ─── Folder Picker (with permission request via showDirectoryPicker) ───────
    const handleFolderPick = async () => {
        setScanError(null);
        setIsScanning(true);
        try {
            const folderHandle = await window.showDirectoryPicker({ mode: 'read' });
            setSelectedFolder(folderHandle.name);

            const mp3Files = [];
            const scanEntries = async (handle, depth = 0) => {
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.mp3')) {
                        const file = await entry.getFile();
                        const url = URL.createObjectURL(file);
                        mp3Files.push({
                            id: mp3Files.length + 1,
                            title: entry.name.replace(/\.mp3$/i, ''),
                            url,
                        });
                    } else if (entry.kind === 'directory' && depth < 2) {
                        await scanEntries(entry, depth + 1);
                    }
                }
            };

            await scanEntries(folderHandle);

            if (mp3Files.length === 0) {
                setScanError('No MP3 files found in the selected folder.');
                setIsScanning(false);
                return;
            }

            setLocalSongs(mp3Files);
            setShowWelcome(false);
        } catch (e) {
            if (e.name === 'AbortError') {
                // User cancelled — keep welcome screen open
            } else {
                setScanError('Could not access the folder. Please try again.');
                console.error('Folder selection failed', e);
            }
        }
        setIsScanning(false);
    };

    const handleChangeFolder = () => {
        setShowWelcome(true);
        setLocalSongs([]);
        setSelectedFolder(null);
        setScanError(null);
        setCurrentSong(null);
        setIsPlaying(false);
        setQueue([]);
        audioRef.current.src = '';
        remixStateRef.current = { isActive: false, queue: [], currentIndex: 0, positions: {}, targetTime: 0 };
        setIsRemixMode(false);
    };

    // ─── Render ────────────────────────────────────────────────────────────────
    if (showWelcome) {
        return (
            <>
                <WelcomeScreen onBrowse={handleBrowseClick} isScanning={isScanning} />
                {showPermissionModal && (
                    <PermissionModal
                        onConfirm={handlePermissionConfirm}
                        onCancel={handlePermissionCancel}
                    />
                )}
                {scanError && <div className="scan-error-toast">{scanError}</div>}
            </>
        );
    }

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo">
                    <Music2 size={28} className="logo-icon" />
                    <h1>RoSY Music Player</h1>
                </div>
                <div className="folder-controls">
                    <span className="selected-folder" title={selectedFolder}>📁 {selectedFolder}</span>
                    <button className="icon-btn rescan-btn" onClick={handleFolderPick} title="Rescan folder">
                        <RefreshCw size={16} />
                    </button>
                    <button className="icon-btn change-folder-btn" onClick={handleChangeFolder} title="Change folder">
                        <FolderOpen size={16} />
                        <span className="btn-label">Change</span>
                    </button>
                </div>
            </header>

            <main className="main-content">
                <div className="left-panel">
                    <Library
                        songs={localSongs}
                        currentSong={currentSong}
                        playSong={playSong}
                        addToQueue={addToQueue}
                        isRemixMode={isRemixMode}
                    />
                </div>

                <div className="right-panel">
                    <Player
                        currentSong={currentSong}
                        isPlaying={isPlaying}
                        togglePlay={togglePlay}
                        handleNext={handleNext}
                        handlePrev={handlePrev}
                        currentTime={currentTime}
                        duration={duration}
                        handleSeek={handleSeek}
                        playbackSpeed={playbackSpeed}
                        setPlaybackSpeed={setPlaybackSpeed}
                        volume={volume}
                        setVolume={setVolume}
                        isRemixMode={isRemixMode}
                        toggleRemixMode={toggleRemixMode}
                    />
                    <Queue
                        queue={queue}
                        removeFromQueue={removeFromQueue}
                        playFromQueue={playFromQueue}
                    />
                </div>
            </main>

            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
        </div>
    );
}

export default App;
