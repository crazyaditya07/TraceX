import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

function NotificationDropdown({ onClose }) {
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'productMinted': return '📦';
            case 'productTransferred': return '🔄';
            case 'checkpointAdded': return '📍';
            case 'roleGranted': return '👤';
            default: return '🔔';
        }
    };

    return (
        <div
            className="notification-dropdown"
            style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '360px',
                zIndex: 1000,
            }}
        >
            <div className="notification-header">
                <h4 style={{ margin: 0, fontSize: '1rem' }}>
                    Notifications {unreadCount > 0 && `(${unreadCount})`}
                </h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--primary-400)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            Mark all read
                        </button>
                    )}
                    {notifications.length > 0 && (
                        <button
                            onClick={clearAll}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-tertiary)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div style={{
                        padding: 'var(--spacing-8)',
                        textAlign: 'center',
                        color: 'var(--text-tertiary)'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔔</div>
                        <p style={{ margin: 0 }}>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                            style={{ display: 'flex', alignItems: 'flex-start' }}
                        >
                            <div className="notification-icon">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                <div className="notification-title">
                                    {getNotificationTitle(notification)}
                                </div>
                                <div className="notification-time">
                                    {formatTime(notification.createdAt || notification.timestamp)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function getNotificationTitle(notification) {
    switch (notification.type) {
        case 'productMinted':
            return `New product created: ${notification.data?.productId || 'Unknown'}`;
        case 'productTransferred':
            return `Product ${notification.data?.productId || ''} transferred`;
        case 'checkpointAdded':
            return `Checkpoint added: ${notification.data?.stage || ''}`;
        case 'roleGranted':
            return `Role assigned: ${notification.data?.role || ''}`;
        case 'productUpdate':
            return `Product update: ${notification.data?.productId || ''}`;
        default:
            return 'New notification';
    }
}

export default NotificationDropdown;
