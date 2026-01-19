import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket = null;

export const initSocket = () => {
    const token = useAuthStore.getState().token;
    const tenant = useAuthStore.getState().tenant;

    if (!token || !tenant) return null;

    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('Socket connected');
        socket.emit('join-tenant', tenant.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};