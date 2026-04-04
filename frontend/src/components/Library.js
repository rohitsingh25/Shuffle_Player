import React from 'react';
import { Plus, Play } from 'lucide-react';

export default function Library({ songs, currentSong, playSong, addToQueue, isRemixMode }) {
    return (
        <div className="library-container glass-panel">
            <h2 className="panel-title">Library</h2>
            <div className="song-list-wrapper">
                {isRemixMode ? (
                    <div className="remix-bubble-container">
                        <div className="remix-glow-bg"></div>
                        <div className="remix-message">
                            <h3>Remix Mode Active</h3>
                            <p>Enjoying the random vibes</p>
                        </div>
                        {/* Generate generic bubbles */}
                        {[...Array(12)].map((_, i) => (
                            <div key={`bubble-${i}`} className={`remix-bubble bubble-${i + 1}`}></div>
                        ))}
                    </div>
                ) : (
                    <div className="song-list">
                        {songs.length === 0 ? (
                            <div className="empty-state">No songs found. Place mp3 files in the backend/music directory.</div>
                        ) : (
                            songs.map((song) => (
                                <div
                                    key={song.id}
                                    className={`song-item ${currentSong?.id === song.id ? 'active' : ''}`}
                                >
                                    <div className="song-item-info" onClick={() => playSong(song)}>
                                        <div className="song-idx">{song.id}</div>
                                        <div className="song-title-list">{song.title}</div>
                                    </div>
                                    <div className="song-item-actions">
                                        <button className="icon-btn mini" onClick={() => playSong(song)} title="Play Now">
                                            <Play size={14} />
                                        </button>
                                        <button className="icon-btn mini" onClick={() => addToQueue(song)} title="Add to Queue">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
