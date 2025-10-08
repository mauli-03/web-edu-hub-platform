import { io } from 'https://cdn.socket.io/4.4.1/socket.io.esm.min.js';

export class SocketManager {
    static #socket = null;
    static #instance = null;
    
    // Socket configuration with multiple fallback options
    static config = {
        serverUrls: [
            'http://localhost:5000',
            'http://127.0.0.1:5000',
            'http://localhost:3000'
        ],
        namespace: '/global-chat',
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 15000, // 15 seconds timeout
        fallbackMode: false
    };

    // Default anonymous user details
    static anonymousUser = {
        name: `Guest_${Math.random().toString(36).substring(7)}`,
        email: `guest_${Math.random().toString(36).substring(7)}@educationhub.com`
    };

    constructor() {
        if (SocketManager.#instance) {
            return SocketManager.#instance;
        }

        SocketManager.#instance = this;
    }

    // Comprehensive socket initialization method
    static initializeSocket(options = {}) {
        // Disconnect any existing socket
        this.disconnectSocket();

        // Merge provided options with default configuration
        const socketConfig = {
            ...this.config,
            ...options
        };

        // Attempt connection with multiple fallback URLs
        for (const serverUrl of socketConfig.serverUrls) {
            try {
                // Determine authentication method
                const authOptions = this.getAuthOptions(serverUrl);

                // Construct full URL with namespace
                const fullUrl = `${serverUrl}${socketConfig.namespace}`;

                this.#socket = io(fullUrl, {
                    ...authOptions,
                    reconnection: true,
                    reconnectionAttempts: socketConfig.reconnectionAttempts,
                    reconnectionDelay: socketConfig.reconnectionDelay,
                    timeout: socketConfig.timeout,
                    transports: ['websocket', 'polling']
                });

                // Setup comprehensive event listeners
                this.setupSocketListeners(fullUrl);

                // Break if socket is successfully created
                break;
            } catch (error) {
                console.warn(`Failed to connect to ${serverUrl}:`, error);
                continue;
            }
        }

        // If no connection could be established, enter fallback mode
        if (!this.#socket) {
            this.enterFallbackMode();
        }

        return this.#socket;
    }

    // Determine authentication options
    static getAuthOptions(serverUrl) {
        const token = localStorage.getItem('authToken');
        
        // Prioritize authenticated connection
        if (token) {
            return {
                auth: { token }
            };
        }

        // Fallback to anonymous connection
        return {
            auth: {
                token: 'anonymous_token',
                user: this.anonymousUser
            }
        };
    }

    // Setup comprehensive socket event listeners
    static setupSocketListeners(serverUrl) {
        if (!this.#socket) return;

        // Connection established and log received data
        this.#socket.on('connect', () => {
            console.log(`Socket connected successfully to ${serverUrl}`);
            console.log('Connection ID:', this.#socket.id);
            
            // Reset fallback mode if connection is successful
            this.config.fallbackMode = false;
        });

        // Connection errors
        this.#socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            this.handleConnectionError(error, serverUrl);
        });

        // Disconnection handling
        this.#socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            
            // Attempt reconnection or enter fallback mode
            if (reason === 'io server disconnect') {
                this.initializeSocket();
            } else {
                this.enterFallbackMode();
            }
        });

        // Reconnection handling
        this.#socket.io.on('reconnect', (attemptNumber) => {
            console.log(`Reconnected successfully after ${attemptNumber} attempts`);
            this.config.fallbackMode = false;
        });

        // Reconnection attempts
        this.#socket.io.on('reconnect_attempt', (attemptNumber) => {
            console.log(`Attempting to reconnect (Attempt ${attemptNumber})`);
        });

        // Reconnection error
        this.#socket.io.on('reconnect_error', (error) => {
            console.error('Reconnection error:', error);
        });

        // Reconnection failed
        this.#socket.io.on('reconnect_failed', () => {
            console.error('Failed to reconnect after multiple attempts');
            this.enterFallbackMode();
        });
    }

    // Handle connection errors with advanced fallback
    static handleConnectionError(error, serverUrl) {
        console.error('Detailed Connection Error:', error);

        // Specific error handling
        if (error.message.includes('xhr poll error')) {
            console.warn('Network connectivity issue detected');
        }

        // Remove the failed URL from potential connections
        this.config.serverUrls = this.config.serverUrls.filter(url => url !== serverUrl);

        // If no more URLs to try, enter fallback mode
        if (this.config.serverUrls.length === 0) {
            this.enterFallbackMode();
        } else {
            // Try next available URL
            this.initializeSocket();
        }
    }

    // Enter fallback mode with minimal functionality
    static enterFallbackMode() {
        console.warn('Entering socket fallback mode');
        
        // Set fallback flag
        this.config.fallbackMode = true;

        // Create a mock socket-like object
        this.#socket = {
            on: (event, callback) => {
                if (event === 'connect') {
                    // Simulate connection
                    setTimeout(callback, 100);
                }
            },
            emit: (event, data) => {
                console.warn(`[Fallback] Emitting ${event}:`, data);
            },
            connected: false
        };

        // Notify user about connection issues
        this.notifyConnectionError();
    }

    // Notify user about connection errors
    static notifyConnectionError() {
        // Create a notification element
        const notification = document.createElement('div');
        notification.className = 'alert alert-danger fixed-top text-center';
        notification.innerHTML = `
            <strong>Connection Error!</strong> 
            Unable to connect to the server. 
            Some features may be limited.
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // Add to body
        document.body.insertAdjacentElement('afterbegin', notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Disconnect socket
    static disconnectSocket() {
        if (this.#socket) {
            try {
                this.#socket.disconnect();
                this.#socket = null;
            } catch (error) {
                console.error('Error disconnecting socket:', error);
            }
        }
    }

    // Getter for socket instance
    static getSocket() {
        // If no socket exists, initialize
        if (!this.#socket) {
            return this.initializeSocket();
        }

        return this.#socket;
    }

    // Generate a unique guest name
    static generateGuestName() {
        const adjectives = ['Happy', 'Curious', 'Brave', 'Smart', 'Creative'];
        const nouns = ['Learner', 'Explorer', 'Student', 'Thinker', 'Innovator'];
        
        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        const randomNumber = Math.floor(Math.random() * 1000);
        
        return `${randomAdjective} ${randomNoun} #${randomNumber}`;
    }
}

// Optional: Automatically initialize socket on import
new SocketManager();
