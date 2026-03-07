import React from 'react';

function Timeline({ checkpoints, animate = true }) {
    if (!checkpoints || checkpoints.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-icon">📍</div>
                <h3 className="empty-state-title">No Checkpoints</h3>
                <p className="empty-state-description">
                    This product has no recorded checkpoints yet.
                </p>
            </div>
        );
    }

    const getStageIcon = (stage) => {
        switch (stage?.toLowerCase()) {
            case 'manufactured': return '🏭';
            case 'indistribution': return '🚚';
            case 'inretail': return '🏪';
            case 'sold': return '✅';
            default: return '📍';
        }
    };

    const getStageColor = (stage) => {
        switch (stage?.toLowerCase()) {
            case 'manufactured': return 'var(--primary-500)';
            case 'indistribution': return 'var(--accent-cyan)';
            case 'inretail': return 'var(--accent-emerald)';
            case 'sold': return 'var(--secondary-500)';
            default: return 'var(--text-tertiary)';
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Unknown';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatLocation = (location) => {
        if (!location) return 'Unknown location';
        if (typeof location === 'string') return location;
        if (location.address) {
            return `${location.address}${location.city ? `, ${location.city}` : ''}${location.country ? `, ${location.country}` : ''}`;
        }
        return 'Unknown location';
    };

    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="timeline">
            {checkpoints.map((checkpoint, index) => (
                <div
                    key={index}
                    className="timeline-item"
                    style={{
                        animationDelay: animate ? `${index * 0.1}s` : '0s',
                        opacity: animate ? 0 : 1
                    }}
                >
                    <div
                        className="timeline-marker completed"
                        style={{
                            borderColor: getStageColor(checkpoint.stage),
                            background: `linear-gradient(135deg, ${getStageColor(checkpoint.stage)}, ${getStageColor(checkpoint.stage)}dd)`
                        }}
                    >
                        {getStageIcon(checkpoint.stage)}
                    </div>
                    <div className="timeline-content">
                        <div className="timeline-date">
                            {formatDate(checkpoint.timestamp)}
                        </div>
                        <div className="timeline-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                                className={`stage-badge ${checkpoint.stage?.toLowerCase().replace('in', 'in-')}`}
                            >
                                {checkpoint.stage}
                            </span>
                        </div>
                        <div className="timeline-location">
                            <span>📍</span>
                            <span>{formatLocation(checkpoint.location)}</span>
                        </div>
                        {checkpoint.handler && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-tertiary)'
                            }}>
                                <span>Handler: </span>
                                <code style={{
                                    background: 'var(--glass-bg)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {checkpoint.handlerName || formatAddress(checkpoint.handler)}
                                </code>
                            </div>
                        )}
                        {checkpoint.notes && (
                            <div style={{
                                marginTop: '8px',
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic'
                            }}>
                                "{checkpoint.notes}"
                            </div>
                        )}
                        {checkpoint.transactionHash && (
                            <div style={{ marginTop: '8px' }}>
                                <a
                                    href={`https://sepolia.etherscan.io/tx/${checkpoint.transactionHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        fontSize: 'var(--font-size-xs)',
                                        color: 'var(--primary-400)'
                                    }}
                                >
                                    View on Etherscan →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Timeline;
