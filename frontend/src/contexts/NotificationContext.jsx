import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useWeb3 } from './Web3Context';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function NotificationProvider({ children }) {
    const { account, isConnected } = useWeb3();
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState([]);

    // Connect to WebSocket - works for both wallet and email users
    useEffect(() => {
        // Check if user is authenticated via either method
        const hasAuth = (isConnected && account) || (isAuthenticated && user);

        if (!hasAuth) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
            return;
        }

        const socketInstance = io(API_URL, {
            transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
            console.log('🔌 WebSocket connected');

            // Join room based on available identifier
            // Prefer wallet address, fall back to user email/id
            const roomId = account || user?.email || user?.id;
            if (roomId) {
                socketInstance.emit('join', roomId.toLowerCase?.() || roomId);
                console.log('📍 Joined notification room:', roomId);
            }
        });

        socketInstance.on('notification', (data) => {
            console.log('📬 Notification received:', data);
            addNotification(data);
            showToast(data);
        });

        socketInstance.on('productUpdate', (data) => {
            console.log('📦 Product update:', data);
            addNotification({
                type: 'productUpdate',
                ...data
            });
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 WebSocket disconnected');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [isConnected, account, isAuthenticated, user]);

    // Add notification
    const addNotification = useCallback((notification) => {
        const newNotification = {
            id: Date.now().toString(),
            ...notification,
            read: false,
            createdAt: new Date().toISOString(),
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
    }, []);

    // Mark notification as read
    const markAsRead = useCallback((id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    }, []);

    // Clear all notifications
    const clearAll = useCallback(() => {
        setNotifications([]);
        setUnreadCount(0);
    }, []);

    // Show toast notification
    const showToast = useCallback((data) => {
        const toast = {
            id: Date.now().toString(),
            type: getToastType(data.type),
            title: getToastTitle(data.type),
            message: getToastMessage(data),
        };

        setToasts(prev => [...prev, toast]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeToast(toast.id);
        }, 5000);
    }, []);

    // Remove toast
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // Subscribe to product updates
    const subscribeToProduct = useCallback((productId) => {
        if (socket) {
            socket.emit('subscribeProduct', productId);
        }
    }, [socket]);

    const value = {
        notifications,
        unreadCount,
        toasts,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        showToast,
        removeToast,
        subscribeToProduct,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </NotificationContext.Provider>
    );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    <div className="toast-icon">
                        {toast.type === 'success' && '✓'}
                        {toast.type === 'error' && '✕'}
                        {toast.type === 'info' && 'ℹ'}
                        {toast.type === 'warning' && '⚠'}
                    </div>
                    <div className="toast-content">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                    <button
                        className="toast-close"
                        onClick={() => removeToast(toast.id)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

// Helper functions
function getToastType(eventType) {
    switch (eventType) {
        case 'productMinted':
        case 'productTransferred':
            return 'success';
        case 'checkpointAdded':
            return 'info';
        case 'roleGranted':
            return 'success';
        default:
            return 'info';
    }
}

function getToastTitle(eventType) {
    switch (eventType) {
        case 'productMinted':
            return 'Product Created';
        case 'productTransferred':
            return 'Product Transferred';
        case 'checkpointAdded':
            return 'Checkpoint Added';
        case 'roleGranted':
            return 'Role Assigned';
        default:
            return 'Notification';
    }
}

function getToastMessage(data) {
    switch (data.type) {
        case 'productMinted':
            return `Product ${data.data?.productId || ''} has been created`;
        case 'productTransferred':
            return `Product transferred to new owner`;
        case 'checkpointAdded':
            return `New checkpoint: ${data.data?.stage || ''}`;
        case 'roleGranted':
            return `You have been assigned the ${data.data?.role || ''} role`;
        default:
            return 'New activity in your supply chain';
    }
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

export default NotificationContext;
