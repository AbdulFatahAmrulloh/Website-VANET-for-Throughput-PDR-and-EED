// charts.js - Manages the charts and visualizations

// Chart objects
let throughputChart;
let pdrChart;
let eedChart;

// Maximum number of data points to display
const MAX_DATA_POINTS = 50;

// Data arrays
let throughputData = [];
let pdrData = [];
let eedData = [];
let timeLabels = [];

// Initialize the charts
function initializeCharts() {
    console.log('Initializing charts');
    
    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0 // General animation time
        },
        hover: {
            animationDuration: 0 // Duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // Animation duration after a resize
        elements: {
            line: {
                tension: 0.4 // Smooth curves
            },
            point: {
                radius: 2 // Small points
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxTicksLimit: 10
                }
            },
            y: {
                beginAtZero: true
            }
        },
        plugins: {
            legend: {
                display: false
            }
        }
    };
    
    // Initialize Throughput Chart
    throughputChart = new Chart(
        document.getElementById('throughputChart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Throughput (Mbps)',
                    data: throughputData,
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Mbps'
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Network Throughput'
                    }
                }
            }
        }
    );
    
    // Initialize PDR Chart
    pdrChart = new Chart(
        document.getElementById('pdrChart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'Packet Delivery Ratio (%)',
                    data: pdrData,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        max: 1,
                        title: {
                            display: true,
                            text: 'Ratio (0-1)'
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Packet Delivery Ratio'
                    }
                }
            }
        }
    );
    
    // Initialize EED Chart
    eedChart = new Chart(
        document.getElementById('eedChart').getContext('2d'),
        {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [{
                    label: 'End-to-End Delay (ms)',
                    data: eedData,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true
                }]
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Milliseconds'
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'End-to-End Delay'
                    }
                }
            }
        }
    );
    
    // Load initial data if available
    loadInitialData();
}

// Update charts with new data
function updateCharts(data) {
    // Add new data points
    throughputData.push(data.throughput);
    pdrData.push(data.pdr);
    eedData.push(data.eed);
    timeLabels.push(data.formatted_time);
    
    // Limit the number of data points
    if (throughputData.length > MAX_DATA_POINTS) {
        throughputData.shift();
        pdrData.shift();
        eedData.shift();
        timeLabels.shift();
    }
    
    // Update chart data
    throughputChart.data.labels = timeLabels;
    throughputChart.data.datasets[0].data = throughputData;
    
    pdrChart.data.labels = timeLabels;
    pdrChart.data.datasets[0].data = pdrData;
    
    eedChart.data.labels = timeLabels;
    eedChart.data.datasets[0].data = eedData;
    
    // Update the charts
    throughputChart.update();
    pdrChart.update();
    eedChart.update();
}

// Reset all charts to empty state
function resetCharts() {
    // Clear data arrays
    throughputData = [];
    pdrData = [];
    eedData = [];
    timeLabels = [];
    
    // Update charts
    throughputChart.data.labels = timeLabels;
    throughputChart.data.datasets[0].data = throughputData;
    
    pdrChart.data.labels = timeLabels;
    pdrChart.data.datasets[0].data = pdrData;
    
    eedChart.data.labels = timeLabels;
    eedChart.data.datasets[0].data = eedData;
    
    // Update the charts
    throughputChart.update();
    pdrChart.update();
    eedChart.update();
}

// Load initial data from the server
function loadInitialData() {
    fetch('/api/data/current')
        .then(response => response.json())
        .then(data => {
            if (data && data.throughput && data.throughput.length > 0) {
                // Add initial data points
                throughputData = data.throughput.slice(-MAX_DATA_POINTS);
                pdrData = data.pdr.slice(-MAX_DATA_POINTS);
                eedData = data.eed.slice(-MAX_DATA_POINTS);
                timeLabels = data.timestamps.slice(-MAX_DATA_POINTS);
                
                // Update the charts
                throughputChart.data.labels = timeLabels;
                throughputChart.data.datasets[0].data = throughputData;
                
                pdrChart.data.labels = timeLabels;
                pdrChart.data.datasets[0].data = pdrData;
                
                eedChart.data.labels = timeLabels;
                eedChart.data.datasets[0].data = eedData;
                
                // Update the charts
                throughputChart.update();
                pdrChart.update();
                eedChart.update();
            }
        })
        .catch(error => {
            console.error('Error loading initial data:', error);
        });
}
