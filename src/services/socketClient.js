import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../constants/toastIds';
import { configInit } from '../component/global/globalvariable';

class SocketClient {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
        this.isConnected = false;
    }

    connect() {
        if (this.socket && this.isConnected) { // Check isConnected as well
            // console.log("Socket already connected and initialized.");
            return;
        }
        if (this.socket && !this.isConnected) {
            // console.log("Socket instance exists but not connected, attempting to reconnect listeners.");
            this.socket.connect(); // Attempt to reconnect
            // No need to recreate if it exists, setupSocketListeners should handle re-attaching if necessary on 'connect'
            return;
        }

        const host = configInit.accessURL.includes('localhost') || configInit.accessURL.includes('127.0.0.1')
            ? 'localhost'
            : '192.168.1.2';

        const port = 5555;
        const socketURL = `ws://${host}:${port}`; // <-- Use full host + port (NO `/v1` here)

        this.socket = io(socketURL, {
            path: '/v1',                 // must match backend path
            transports: ['websocket'],
            withCredentials: true,
            reconnection: true,
            reconnectionAttempts: 5,
            timeout: 10000,
        });


        this.setupSocketListeners();
    }

    setupSocketListeners() {
        if (!this.socket) return;

        // Clear existing listeners to avoid duplicates if setupSocketListeners is called multiple times
        this.socket.off('connect');
        this.socket.off('disconnect');
        this.socket.off('relay-response');
        this.socket.off('relay-error');
        this.socket.off('relay-status');
        this.socket.off('power-factor-response');
        this.socket.off('power-factor-error');
        this.socket.off('minmax-current-response');
        this.socket.off('minmax-current-error');

        this.socket.on('connect', () => {
            // console.log('Socket connected');
            this.isConnected = true;
            this.emit('get-relay-status'); // Initial status fetch on connect
        });

        this.socket.on('disconnect', () => {
            // console.log('Socket disconnected');
            this.isConnected = false;
        });

        this.socket.on('relay-response', (data) => {
            this.notifyListeners('relay-response', data);
        });

        this.socket.on('relay-error', (err) => {
            toast.error(`Relay error: ${err.error || 'Unknown socket error'}`, { toastId: TOAST_IDS.RELAY_TOGGLE });
            this.notifyListeners('relay-error', err);
        });

        this.socket.on('relay-status', (statusData) => {
            this.notifyListeners('relay-status', statusData);
        });

        this.socket.on('power-factor-response', (data) => {
            // console.log("SocketClient: Received power-factor-response", data);
            this.notifyListeners('power-factor-response', data);
        });

        this.socket.on('power-factor-error', (err) => {
            toast.error(`Power factor error: ${err.error || 'Unknown socket error'}`, { toastId: TOAST_IDS.GENERIC_ERROR });
            this.notifyListeners('power-factor-error', err);
        });

        this.socket.on('minmax-current-response', (data) => {
            // console.log("SocketClient: Received minmax-current-response", data);
            this.notifyListeners('minmax-current-response', data);
        });

        this.socket.on('minmax-current-error', (err) => {
            toast.error(`Min/Max Current error: ${err.error || 'Unknown socket error'}`, { toastId: TOAST_IDS.GENERIC_ERROR });
            this.notifyListeners('minmax-current-error', err);
        });
    }

    addListener(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    removeListener(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
            if (this.listeners.get(event).size === 0) {
                this.listeners.delete(event);
            }
        }
    }

    notifyListeners(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for event ${event}:`, error);
                }
            });
        }
    }

    emit(event, data) {
        if (this.socket && this.isConnected) {
            this.socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot emit event:', event);
            // Optionally, queue the event or try to connect
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            // this.socket = null; // Keep the instance, but set connected to false
            this.isConnected = false;
            // console.log('Socket explicitly disconnected.');
        }
    }

    // Specific relay control methods
    toggleRelay(relayNumber, action) {
        this.emit('control-relay', {
            relayNumber: relayNumber - 1,
            action: action.toLowerCase()
        });
    }

    getRelayStatus() {
        this.emit('get-relay-status');
    }

    // New method for fetching power factor
    fetchPowerFactor(measurementName, timeFilter = '1h', fields = ['PF_Ave_Inst']) {
        if (!measurementName) {
            console.warn("SocketClient.fetchPowerFactor: measurementName is required.");
            return;
        }

        if (!Array.isArray(fields)) {
            console.warn("SocketClient.fetchPowerFactor: 'fields' must be an array.");
            return;
        }
        // console.log("rerererererere", fields);

        this.emit('get-power-factor', {
            timeFilter,
            measurement: measurementName,
            fields
        });
    }

    // New method for fetching min/max current average
    getminmaxcurrentAve(measurementName) {
        if (!measurementName) {
            console.warn("SocketClient.getminmaxcurrentAve: measurementName is required.");
            return;
        }

        this.emit('getminMaxCurrentAverge', {
            measurement: measurementName
        });
    }
}

// Create a singleton instance
const socketClient = new SocketClient();

export default socketClient;