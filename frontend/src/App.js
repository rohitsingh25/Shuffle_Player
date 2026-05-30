import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Player from './components/Player';
import Library from './components/Library';
import Queue from './components/Queue';
// RemixPanel import removed (not used)
import { Music2 } from 'lucide-react';

function App() {
    const [songs, setSongs] = useState([]);
    const [currentSong, setCurrentSong] = useState(null);
    const [queue, setQueue] = useState([]);
    const [localSongs, setLocalSongs] = useState([]);
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

    // Store latest songs to avoid stale closure in refs
    const latestSongsRef = useRef(songs);
    useEffect(() => {
        latestSongsRef.current = songs;
    }, [songs]);

    const audioRef = useRef(new Audio());

    // Load persisted local songs from localStorage
    useEffect(() => {
        const persisted = localStorage.getItem('localSongs');
        if (persisted) {
            try {
                setLocalSongs(JSON.parse(persisted));
            } catch (e) {
                console.error('Failed to parse persisted songs', e);
            }
        }
    }, []);

    // Persist local songs when they change
    useEffect(() => {
        if (localSongs.length > 0) {
            localStorage.setItem('localSongs', JSON.stringify(localSongs));
        }
    }, [localSongs]);

    // Fetch songs from backend (fallback when no local songs)
    useEffect(() => {
        if (localSongs.length === 0) {
            fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/songs`)
                .then(res => res.json())
                .then(data => setSongs(data))
                .catch(err => console.error("Error fetching songs:", err));
        }
    }, [localSongs]);

    // Handle Audio Object Events
    useEffect(() => {
        const audio = audioRef.current;

        const setAudioData = () => setDuration(audio.duration);
        const setAudioTime = () => {
            setCurrentTime(audio.currentTime);

            if (remixStateRef.current.isActive && audio.currentTime >= remixStateRef.current.targetTime && !audio.paused && remixStateRef.current.queue.length > 0) {
                // Time's up for this remix segment
                const state = remixStateRef.current;
                const currentId = state.queue[state.currentIndex];
                state.positions[currentId] = audio.currentTime;

                state.currentIndex = (state.currentIndex + 1) % state.queue.length;
                playNextRemixSegment();
            }
        };

        const handleEnded = () => {
            if (remixStateRef.current.isActive) {
                const state = remixStateRef.current;
                if (state.queue.length > 0) {
                    state.queue.splice(state.currentIndex, 1);
                    if (state.currentIndex >= state.queue.length) {
                        state.currentIndex = 0;
                    }
                    if (state.queue.length > 0) {
                        playNextRemixSegment();
                    } else {
                        // All ended
                        toggleRemixMode(); // turns it off
                    }
                }
            } else {
                handleNext();
            }
        };

        audio.addEventListener('loadeddata', setAudioData);
        audio.addEventListener('timeupdate', setAudioTime);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('loadeddata', setAudioData);
            audio.removeEventListener('timeupdate', setAudioTime);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [currentSong, queue]);

    // Handle Playback Speed & Volume
    useEffect(() => {
        audioRef.current.playbackRate = playbackSpeed;
    }, [playbackSpeed]);

    useEffect(() => {
        audioRef.current.volume = volume;
    }, [volume]);

    // Handle Play/Pause
    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.log(e));
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying, currentSong]);

    const playSong = (song) => {
        setCurrentSong(song);
        audioRef.current.src = song.url;
        setIsPlaying(true);
    };

    const togglePlay = () => {
        if (!currentSong && songs.length > 0) {
            playSong(songs[0]);
        } else if (currentSong) {
            setIsPlaying(!isPlaying);
        }
    };

    const handleNext = () => {
        if (queue.length > 0) {
            // Play from queue
            const nextSong = queue[0];
            setQueue(queue.slice(1));
            playSong(nextSong);
        } else {
            // Play next in library
            const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
            if (currentIndex !== -1 && currentIndex < songs.length - 1) {
                playSong(songs[currentIndex + 1]);
            } else if (songs.length > 0) {
                // Loop back to start
                playSong(songs[0]);
            }
        }
    };

    const handlePrev = () => {
        if (isRemixMode) return; // Disable prev in remix mode
        const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
        if (currentIndex > 0) {
            playSong(songs[currentIndex - 1]);
        } else if (songs.length > 0) {
            playSong(songs[songs.length - 1]);
        }
    };

    const addToQueue = (song) => {
        setQueue([...queue, song]);
    };

    const removeFromQueue = (index) => {
        const newQueue = [...queue];
        newQueue.splice(index, 1);
        setQueue(newQueue);
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

    const playNextRemixSegment = () => {
        const state = remixStateRef.current;
        const currentSongs = latestSongsRef.current;

        if (state.queue.length === 0 || currentSongs.length === 0) {
            if (isRemixMode) toggleRemixMode();
            return;
        }

        if (state.currentIndex >= state.queue.length) {
            state.currentIndex = 0;
        }

        const songId = state.queue[state.currentIndex];
        const songToPlay = currentSongs.find(s => s.id === songId);

        if (!songToPlay) {
            // Failsafe, shouldn't happen
            state.queue.splice(state.currentIndex, 1);
            playNextRemixSegment();
            return;
        }

        const startPos = state.positions[songId] || 0;
        const durationSegment = Math.floor(Math.random() * 11) + 5; // 5 to 15 seconds
        state.targetTime = startPos + durationSegment;

        const speedLevel = Math.floor(Math.random() * 7) + 2; // 2 to 8
        const speed = speedLevel * 0.25; // 0.5x to 2.0x

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
            const currentSongs = latestSongsRef.current;
            if (currentSongs.length === 0) {
                setIsRemixMode(false);
                remixStateRef.current.isActive = false;
                return;
            }
            // Populate temporary list
            remixStateRef.current.queue = currentSongs.map(s => s.id);
            // Shuffle temporary list randomly
            remixStateRef.current.queue.sort(() => Math.random() - 0.5);
            remixStateRef.current.currentIndex = 0;
            remixStateRef.current.positions = {};
            playNextRemixSegment();
        } else {
            // Disable remix mode
            remixStateRef.current.queue = [];
            remixStateRef.current.positions = {};
            setPlaybackSpeed(1.0);
            if (!currentSong && songs.length > 0) {
                playSong(songs[0]);
            } else if (currentSong) {
                // Keep playing current from where it was
                setIsPlaying(true);
            }
        }
    };

    // Determine which song list to use (local scanned or backend)
    const librarySongs = localSongs.length > 0 ? localSongs : songs;

    // Folder picker to scan user-selected folder for mp3 files
    const handleFolderPick = async () => {
        try {
            const dirHandle = await window.showDirectoryPicker();
            const songsArray = [];
            let idCounter = 1;
            const walk = async (handle) => {
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file') {
                        if (entry.name.toLowerCase().endsWith('.mp3')) {
                            const file = await entry.getFile();
                            const dataUrl = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = () => resolve(reader.result);
                                reader.onerror = reject;
                                reader.readAsDataURL(file);
                            });
                            songsArray.push({ id: idCounter++, title: entry.name, url: dataUrl });
                        }
                    } else if (entry.kind === 'directory') {
                        await walk(entry);
                    }
                }
            };
            await walk(dirHandle);
            setLocalSongs(songsArray);
        } catch (e) {
            console.error('Folder selection cancelled or failed', e);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
    <div className="logo">
        <Music2 size={28} className="logo-icon" />
        <h1>RoSY Music Player</h1>
    </div>
    <button className="icon-btn" onClick={handleFolderPick} title="Select Music Folder">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 3a.5.5 0 0 1 .5-.5h4.293l1 1H15a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5H1a.5.5 0 0 1-.5-.5V3z"/></svg>
    </button>
</header>

            <main className="main-content">
                <div className="left-panel">
                    <Library
                        songs={librarySongs}
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
                    {isRemixMode && <RemixPanel />}
                    <Queue
                        queue={queue}
                        removeFromQueue={removeFromQueue}
                        playFromQueue={playFromQueue}
                    />
                </div>
            </main>

            {/* Background generic shapes for dynamic feel */}
            <div className="bg-shape shape-1"></div>
            <div className="bg-shape shape-2"></div>
            <div className="bg-shape shape-3"></div>
        </div>
    );
}

export default App;
