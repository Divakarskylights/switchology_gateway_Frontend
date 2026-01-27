import socketClient from '../../../client/socketClient';
import { toast } from 'react-toastify';

export const initializeSocket = () => {
    socketClient.connect();
};

export const controlRelay = (relayNumber, action) => {
    if (!socketClient.isConnected) {
        toast.error("Socket not connected");
        return;
    }
    socketClient.toggleRelay(relayNumber, action);
};

export const disconnectSocket = () => {
    if (socketClient.isConnected) {
        socketClient.disconnect();
    }
};
