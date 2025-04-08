// dashboard.js - Manages the main dashboard interface

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard initialized');
    
    // Initialize dashboard components
    initializeMetricCards();
    initializeCharts();
    
    // Connect to WebSocket
    initializeSocket();
    
    // Check simulation status on page load
    checkSimulationStatus();
    
    // Set up UI event listeners
    document.getElementById('clearDataBtn').addEventListener('click', clearCurrentData);
    document.getElementById('saveDataBtn').addEventListener('click', saveCurrentData);
});

// Initialize metric cards with initial values
function initializeMetricCards() {
    updateMetricCard('throughputValue', '0 Mbps', 'Throughput');
    updateMetricCard('pdrValue', '0%', 'Packet Delivery Ratio');
    updateMetricCard('eedValue', '0 ms', 'End-to-End Delay');
}

// Update a metric card with new value
function updateMetricCard(elementId, value, label) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
    }
}

// Check the current simulation status
function checkSimulationStatus() {
    fetch('/api/simulation/status')
        .then(response => response.json())
        .then(data => {
            updateSimulationStatus(data.status);
        })
        .catch(error => {
            console.error('Error checking simulation status:', error);
            updateSimulationStatus('error');
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

// Clear current simulation data
function clearCurrentData() {
    fetch('/api/data/clear')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Data cleared successfully', 'success');
                // Reset charts
                resetCharts();
            } else {
                showAlert('Error clearing data: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error clearing data:', error);
            showAlert('Error clearing data', 'danger');
        });
}

// Save current simulation data
function saveCurrentData() {
    const simulationName = prompt('Enter a name for this simulation run:', 'Simulation ' + (new Date()).toLocaleTimeString());
    
    if (simulationName) {
        fetch('/api/data/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: simulationName })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showAlert('Data saved as "' + simulationName + '"', 'success');
            } else {
                showAlert('Error saving data: ' + data.message, 'danger');
            }
        })
        .catch(error => {
            console.error('Error saving data:', error);
            showAlert('Error saving data', 'danger');
        });
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

// Update metrics with the latest data
function updateMetrics(data) {
    updateMetricCard('throughputValue', data.throughput.toFixed(2) + ' Mbps', 'Throughput');
    updateMetricCard('pdrValue', (data.pdr * 100).toFixed(2) + '%', 'Packet Delivery Ratio');
    updateMetricCard('eedValue', data.eed.toFixed(2) + ' ms', 'End-to-End Delay');
}
