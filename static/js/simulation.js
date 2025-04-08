// simulation.js - Handles simulation control functions

document.addEventListener('DOMContentLoaded', function() {
    console.log('Simulation control panel initialized');
    
    // Set up UI event listeners
    document.getElementById('connectBtn').addEventListener('click', connectSimulation);
    document.getElementById('disconnectBtn').addEventListener('click', disconnectSimulation);
    document.getElementById('startBtn').addEventListener('click', () => controlSimulation('start'));
    document.getElementById('stopBtn').addEventListener('click', () => controlSimulation('stop'));
    document.getElementById('pauseBtn').addEventListener('click', () => controlSimulation('pause'));
    document.getElementById('resumeBtn').addEventListener('click', () => controlSimulation('resume'));
    document.getElementById('applyParamsBtn').addEventListener('click', applySimulationParameters);
    
    // Check simulation status on page load
    checkSimulationStatus();
    
    // Initialize Socket.IO for real-time updates
    initializeSocket();
});

// Connect to the simulation
function connectSimulation() {
    // Get connection parameters
    const host = document.getElementById('simulationHost').value || 'localhost';
    const port = parseInt(document.getElementById('simulationPort').value || '4242');
    
    // Update UI to show connecting state
    updateSimulationStatus('connecting');
    
    // Send connection request
    fetch('/api/simulation/connect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ host, port })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Connected to simulation successfully', 'success');
            updateSimulationStatus('connected');
            updateControlButtonStates(true);
        } else {
            showAlert('Failed to connect: ' + data.message, 'danger');
            updateSimulationStatus('disconnected');
        }
    })
    .catch(error => {
        console.error('Error connecting to simulation:', error);
        showAlert('Error connecting to simulation', 'danger');
        updateSimulationStatus('error');
    });
}

// Disconnect from the simulation
function disconnectSimulation() {
    fetch('/api/simulation/disconnect', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Disconnected from simulation', 'success');
            updateSimulationStatus('disconnected');
            updateControlButtonStates(false);
        } else {
            showAlert('Failed to disconnect: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error disconnecting from simulation:', error);
        showAlert('Error disconnecting from simulation', 'danger');
    });
}

// Send control command to the simulation
function controlSimulation(command) {
    fetch('/api/simulation/control', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert(`Simulation ${command} command sent successfully`, 'success');
        } else {
            showAlert(`Failed to send ${command} command: ${data.message}`, 'danger');
        }
    })
    .catch(error => {
        console.error(`Error sending ${command} command:`, error);
        showAlert(`Error sending ${command} command`, 'danger');
    });
}

// Apply simulation parameters
function applySimulationParameters() {
    // Get parameter values from form
    const mobilitySpeed = parseFloat(document.getElementById('mobilitySpeed').value || '0');
    const nodeCount = parseInt(document.getElementById('nodeCount').value || '0');
    const packetSize = parseInt(document.getElementById('packetSize').value || '0');
    const txPower = parseFloat(document.getElementById('txPower').value || '0');
    
    // Prepare parameters object
    const params = {
        mobility_speed: mobilitySpeed,
        node_count: nodeCount,
        packet_size: packetSize,
        tx_power: txPower
    };
    
    // Send command to apply parameters
    fetch('/api/simulation/control', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            command: 'set_params',
            params: params
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showAlert('Simulation parameters applied successfully', 'success');
        } else {
            showAlert('Failed to apply parameters: ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error applying simulation parameters:', error);
        showAlert('Error applying simulation parameters', 'danger');
    });
}

// Check the current simulation status
function checkSimulationStatus() {
    fetch('/api/simulation/status')
        .then(response => response.json())
        .then(data => {
            updateSimulationStatus(data.status);
            updateControlButtonStates(data.status === 'connected');
        })
        .catch(error => {
            console.error('Error checking simulation status:', error);
            updateSimulationStatus('error');
            updateControlButtonStates(false);
        });
}

// Update the simulation status display
function updateSimulationStatus(status) {
    const statusElement = document.getElementById('simulationStatus');
    const statusBadge = document.getElementById('statusBadge');
    
    if (statusElement && statusBadge) {
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        
        // Update badge color based on status
        statusBadge.className = 'badge';
        switch (status) {
            case 'connected':
                statusBadge.classList.add('bg-success');
                break;
            case 'disconnected':
                statusBadge.classList.add('bg-secondary');
                break;
            case 'error':
                statusBadge.classList.add('bg-danger');
                break;
            case 'connecting':
                statusBadge.classList.add('bg-warning');
                break;
            default:
                statusBadge.classList.add('bg-secondary');
        }
    }
}

// Update the state of control buttons
function updateControlButtonStates(connected) {
    const controlButtons = [
        'startBtn', 'stopBtn', 'pauseBtn', 'resumeBtn', 'applyParamsBtn'
    ];
    
    controlButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.disabled = !connected;
        }
    });
    
    // Toggle connect/disconnect buttons
    const connectBtn = document.getElementById('connectBtn');
    const disconnectBtn = document.getElementById('disconnectBtn');
    
    if (connectBtn) {
        connectBtn.disabled = connected;
    }
    
    if (disconnectBtn) {
        disconnectBtn.disabled = !connected;
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts');
    if (alertsContainer) {
        const alertId = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        alertsContainer.innerHTML += alertHtml;
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.remove();
            }
        }, 5000);
    }
}
