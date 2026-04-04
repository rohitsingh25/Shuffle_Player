import React from 'react';
import { ListMusic, Trash2 } from 'lucide-react';

export default function Queue({ queue, removeFromQueue, playFromQueue }) {
    return (
        <div className="queue-container glass-panel">
            <div className="panel-header">
                <h2 className="panel-title flex-center gap-2">
                    <ListMusic size={18} /> Play Next
                </h2>
                <span className="queue-count">{queue.length} items</span>
            </div>

            <div className="queue-list">
                {queue.length === 0 ? (
                    <div className="empty-state">Queue is empty</div>
                ) : (
                    queue.map((song, index) => (
                        <div key={`${song.id}-${index}`} className="queue-item">
                            <div className="queue-item-info" onClick={() => playFromQueue(index)}>
                                <div className="song-title-list truncate">{song.title}</div>
                            </div>
                            <button
                                className="icon-btn mini danger-hover"
                                onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                                title="Remove"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
