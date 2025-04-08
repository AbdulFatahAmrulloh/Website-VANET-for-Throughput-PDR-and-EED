import os
import logging
from flask import Flask, render_template, jsonify, request
from flask_socketio import SocketIO
import data_processor
import omnet_interface

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_key_for_testing")

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")

# Global variables to store simulation data
current_simulation_data = {
    "throughput": [],
    "pdr": [],
    "eed": [],
    "timestamps": [],
    "status": "disconnected"
}

simulation_history = {}

@app.route('/')
def index():
    """Render the main dashboard."""
    return render_template('index.html')

@app.route('/control-panel')
def control_panel():
    """Render the simulation control panel."""
    return render_template('control_panel.html')

@app.route('/history')
def history():
    """Render the historical data comparison page."""
    return render_template('history.html')

@app.route('/api/simulation/status')
def get_simulation_status():
    """Get the current simulation status."""
    return jsonify({"status": current_simulation_data["status"]})

@app.route('/api/simulation/connect', methods=['POST'])
def connect_simulation():
    """Connect to the OMNeT++/Veins simulation."""
    simulation_params = request.json
    try:
        success = omnet_interface.connect(
            simulation_params.get('host', 'localhost'),
            simulation_params.get('port', 4242)
        )
        if success:
            current_simulation_data["status"] = "connected"
            # Start data collection
            omnet_interface.start_data_collection(handle_new_data)
            return jsonify({"success": True, "message": "Successfully connected to simulation"})
        else:
            return jsonify({"success": False, "message": "Failed to connect to simulation"}), 400
    except Exception as e:
        logger.error(f"Error connecting to simulation: {e}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/simulation/disconnect', methods=['POST'])
def disconnect_simulation():
    """Disconnect from the OMNeT++/Veins simulation."""
    try:
        success = omnet_interface.disconnect()
        if success:
            current_simulation_data["status"] = "disconnected"
            return jsonify({"success": True, "message": "Successfully disconnected from simulation"})
        else:
            return jsonify({"success": False, "message": "Failed to disconnect from simulation"}), 400
    except Exception as e:
        logger.error(f"Error disconnecting from simulation: {e}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/simulation/control', methods=['POST'])
def control_simulation():
    """Send control commands to the simulation."""
    command = request.json.get('command')
    params = request.json.get('params', {})
    
    try:
        result = omnet_interface.send_command(command, params)
        return jsonify({"success": True, "result": result})
    except Exception as e:
        logger.error(f"Error controlling simulation: {e}")
        return jsonify({"success": False, "message": f"Error: {str(e)}"}), 500

@app.route('/api/data/current')
def get_current_data():
    """Get the current simulation data."""
    return jsonify(current_simulation_data)

@app.route('/api/data/history')
def get_history_data():
    """Get the historical simulation data."""
    return jsonify(simulation_history)

@app.route('/api/data/save', methods=['POST'])
def save_current_data():
    """Save the current simulation data to history."""
    name = request.json.get('name', f"Simulation {len(simulation_history) + 1}")
    simulation_history[name] = current_simulation_data.copy()
    return jsonify({"success": True, "message": "Data saved"})

@app.route('/api/data/clear')
def clear_current_data():
    """Clear the current simulation data."""
    global current_simulation_data
    current_simulation_data = {
        "throughput": [],
        "pdr": [],
        "eed": [],
        "timestamps": [],
        "status": current_simulation_data["status"]
    }
    return jsonify({"success": True, "message": "Data cleared"})

def handle_new_data(raw_data):
    """Process new data from the simulation and emit to clients."""
    processed_data = data_processor.process_raw_data(raw_data)
    
    # Update current data
    current_simulation_data["throughput"].append(processed_data["throughput"])
    current_simulation_data["pdr"].append(processed_data["pdr"])
    current_simulation_data["eed"].append(processed_data["eed"])
    current_simulation_data["timestamps"].append(processed_data["timestamp"])
    
    # Keep only the last 100 data points for real-time display
    max_data_points = 100
    if len(current_simulation_data["throughput"]) > max_data_points:
        current_simulation_data["throughput"] = current_simulation_data["throughput"][-max_data_points:]
        current_simulation_data["pdr"] = current_simulation_data["pdr"][-max_data_points:]
        current_simulation_data["eed"] = current_simulation_data["eed"][-max_data_points:]
        current_simulation_data["timestamps"] = current_simulation_data["timestamps"][-max_data_points:]
    
    # Emit the processed data to connected clients
    socketio.emit('new_data', processed_data)

@socketio.on('connect')
def handle_connect():
    """Handle client connection."""
    logger.debug("Client connected")
    socketio.emit('connection_status', {"status": current_simulation_data["status"]})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection."""
    logger.debug("Client disconnected")

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
