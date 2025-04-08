// socket.js - Manages WebSocket connections for real-time updates

let socket;

// Initialize Socket.IO connection
function initializeSocket() {
    console.log('Initializing Socket.IO connection');
    
    // Connect to the Socket.IO server
    socket = io.connect(window.location.origin, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
    });
    
    // Connection established
    socket.on('connect', function() {
        console.log('Socket.IO connected');
    });
    
    // Connection error
    socket.on('connect_error', function(error) {
        console.error('Socket.IO connection error:', error);
        updateSimulationStatus('error');
    });
    
    // Disconnected
    socket.on('disconnect', function() {
        console.log('Socket.IO disconnected');
    });
    
    // Handle connection status updates
    socket.on('connection_status', function(data) {
        console.log('Simulation status update:', data);
        updateSimulationStatus(data.status);
    });
    
    // Handle new data from the server
    socket.on('new_data', function(data) {
        console.log('New simulation data received:', data);
        
        // Update charts with new data
        updateCharts(data);
        
        // Update metric displays
        updateMetrics(data);
    });
}

// Disconnect Socket.IO when page is unloaded
window.addEventListener('beforeunload', function() {
    if (socket) {
        socket.disconnect();
    }
});
