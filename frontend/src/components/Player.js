import React from 'react';
import '../App.css';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, ListVideo, Music, Activity } from 'lucide-react';

export default function Player({ currentSong, isPlaying, togglePlay, handleNext, handlePrev, audioRef, onTimeUpdate, duration, currentTime, handleSeek, playbackSpeed, setPlaybackSpeed, volume, setVolume, isRemixMode, toggleRemixMode }) {

    const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

    const formatTime = (time) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const calculateProgressPercent = () => {
        if (!duration || !currentTime) return 0;
        return (currentTime / duration) * 100;
    };

    return (
        <div className="player-container glass-panel">
            {/* Track Info */}
            <div className="player-info">
                <div className="album-art-placeholder">
                    <Music size={24} color="#8b949e" />
                </div>
                <div className="track-details">
                    <div className="track-title">{currentSong ? currentSong.title : 'No track selected'}</div>
                    <div className="track-artist">{currentSong ? 'Unknown Artist' : '--'}</div>
                </div>
            </div>

            {/* Controls & Progress */}
            <div className="player-controls-wrapper">
                <div className="control-buttons">
                    <button
                        className={`icon-btn remix-btn ${isRemixMode ? 'active' : ''}`}
                        onClick={toggleRemixMode}
                        title="Remix Mode"
                    >
                        <Activity size={18} />
                    </button>
                    <button className="icon-btn" onClick={handlePrev} disabled={!currentSong || isRemixMode}>
                        <SkipBack size={20} />
                    </button>
                    <button className="icon-btn play-btn" onClick={togglePlay} disabled={!currentSong}>
                        {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="play-icon-offset" />}
                    </button>
                    <button className="icon-btn" onClick={handleNext} disabled={!currentSong || isRemixMode}>
                        <SkipForward size={20} />
                    </button>
                    {/* Placeholder for shuffle or repeat if needed */}
                    <div style={{ width: 32 }}></div>
                </div>

                <div className="progress-container">
                    <span className="time-text">{formatTime(currentTime)}</span>
                    <div className="progress-bar-bg" onClick={handleSeek}>
                        <div className="progress-bar-fill" style={{ width: `${calculateProgressPercent()}%` }}>
                            <div className="progress-thumb"></div>
                        </div>
                    </div>
                    <span className="time-text">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Auxiliary Controls (Volume etc placeholder) */}
            <div className="player-aux">
                <div className="speed-control" title="Playback Speed">
                    <select
                        className="speed-select"
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                    >
                        {[0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(speed => (
                            <option key={speed} value={speed}>{speed}x</option>
                        ))}
                    </select>
                </div>
                <VolumeIcon
                    size={18}
                    className="aux-icon"
                    onClick={() => setVolume(volume === 0 ? 1 : 0)}
                    style={{ cursor: 'pointer' }}
                />
                <div className="volume-slider-container">
                    <div className="volume-slider-bg">
                        <div className="volume-fill" style={{ width: `${volume * 100}%` }}></div>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="volume-input-overlay"
                        title="Volume"
                    />
                </div>
            </div>
        </div>
    );
}
