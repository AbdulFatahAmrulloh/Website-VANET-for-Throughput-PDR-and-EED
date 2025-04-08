import socket
import threading
import json
import time
import logging
import random  # For demonstration purposes only

logger = logging.getLogger(__name__)

# Configuration
DEFAULT_HOST = 'localhost'
DEFAULT_PORT = 4242
BUFFER_SIZE = 1024

# Global variables
_connection = None
_collector_thread = None
_collecting = False
_callback = None

class OMNeTPPConnection:
    """Connection handler for OMNeT++/Veins simulation."""
    
    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.socket = None
        self.connected = False
    
    def connect(self):
        """Connect to the OMNeT++/Veins simulation."""
        try:
            # In a real implementation, this would establish a connection to OMNeT++
            # For this demonstration, we'll simulate a connection
            logger.info(f"Connecting to OMNeT++ at {self.host}:{self.port}")
            
            # Simulate connection attempt
            # In a real implementation, this would use socket.connect()
            # self.socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            # self.socket.connect((self.host, self.port))
            
            # Simulate successful connection
            self.connected = True
            logger.info("Connected successfully to OMNeT++")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to OMNeT++: {e}")
            self.connected = False
            return False
    
    def disconnect(self):
        """Disconnect from the OMNeT++/Veins simulation."""
        try:
            if self.connected:
                # In a real implementation, this would close the socket
                # if self.socket:
                #     self.socket.close()
                
                self.connected = False
                logger.info("Disconnected from OMNeT++")
            return True
        except Exception as e:
            logger.error(f"Error disconnecting from OMNeT++: {e}")
            return False
    
    def send_command(self, command, params=None):
        """Send a command to the OMNeT++/Veins simulation."""
        if not self.connected:
            raise ConnectionError("Not connected to OMNeT++")
        
        try:
            # In a real implementation, this would send a command to OMNeT++
            # command_data = json.dumps({"command": command, "params": params})
            # self.socket.sendall(command_data.encode())
            # response = self.socket.recv(BUFFER_SIZE).decode()
            
            # Simulate command response
            logger.info(f"Sending command: {command} with params: {params}")
            
            # Simulate different command responses
            if command == "start":
                response = {"status": "started"}
            elif command == "stop":
                response = {"status": "stopped"}
            elif command == "pause":
                response = {"status": "paused"}
            elif command == "resume":
                response = {"status": "resumed"}
            elif command == "set_params":
                response = {"status": "params_set", "params": params}
            else:
                response = {"status": "unknown_command"}
            
            logger.info(f"Received response: {response}")
            return response
        except Exception as e:
            logger.error(f"Error sending command to OMNeT++: {e}")
            raise

    def receive_data(self):
        """Receive data from the OMNeT++/Veins simulation."""
        if not self.connected:
            raise ConnectionError("Not connected to OMNeT++")
        
        try:
            # In a real implementation, this would receive data from OMNeT++
            # data = self.socket.recv(BUFFER_SIZE).decode()
            
            # Simulate received data
            # Generate random values for demonstration
            timestamp = time.time()
            throughput = random.uniform(0.5, 10.0)  # Mbps
            pdr = random.uniform(0.6, 1.0)  # 60-100%
            eed = random.uniform(5, 100)  # ms
            
            data = {
                "timestamp": timestamp,
                "metrics": {
                    "throughput": throughput,
                    "pdr": pdr,
                    "eed": eed
                },
                "node_info": {
                    "id": random.randint(1, 10),
                    "position": {
                        "x": random.uniform(0, 1000),
                        "y": random.uniform(0, 1000)
                    }
                }
            }
            
            return data
        except Exception as e:
            logger.error(f"Error receiving data from OMNeT++: {e}")
            raise

def connect(host=DEFAULT_HOST, port=DEFAULT_PORT):
    """Connect to the OMNeT++/Veins simulation."""
    global _connection
    
    if _connection and _connection.connected:
        logger.warning("Already connected to OMNeT++")
        return True
    
    _connection = OMNeTPPConnection(host, port)
    return _connection.connect()

def disconnect():
    """Disconnect from the OMNeT++/Veins simulation."""
    global _connection, _collecting, _collector_thread
    
    if not _connection or not _connection.connected:
        logger.warning("Not connected to OMNeT++")
        return True
    
    # Stop data collection
    _collecting = False
    if _collector_thread:
        _collector_thread.join(2.0)  # Wait for the collector thread to finish
    
    return _connection.disconnect()

def send_command(command, params=None):
    """Send a command to the OMNeT++/Veins simulation."""
    global _connection
    
    if not _connection or not _connection.connected:
        raise ConnectionError("Not connected to OMNeT++")
    
    return _connection.send_command(command, params)

def _data_collector():
    """Thread function to collect data from the simulation."""
    global _connection, _collecting, _callback
    
    logger.info("Starting data collection")
    
    while _collecting:
        try:
            if _connection and _connection.connected:
                data = _connection.receive_data()
                if _callback:
                    _callback(data)
            
            # Sleep to avoid overwhelming the system
            # In a real implementation, this would depend on the data rate
            time.sleep(1.0)
        except Exception as e:
            logger.error(f"Error in data collection: {e}")
            time.sleep(5.0)  # Wait before retrying
    
    logger.info("Data collection stopped")

def start_data_collection(callback):
    """Start collecting data from the simulation."""
    global _connection, _collecting, _collector_thread, _callback
    
    if not _connection or not _connection.connected:
        raise ConnectionError("Not connected to OMNeT++")
    
    if _collecting:
        logger.warning("Data collection already started")
        return
    
    _callback = callback
    _collecting = True
    _collector_thread = threading.Thread(target=_data_collector)
    _collector_thread.daemon = True
    _collector_thread.start()
    
    logger.info("Data collection started")

def stop_data_collection():
    """Stop collecting data from the simulation."""
    global _collecting, _collector_thread
    
    if not _collecting:
        logger.warning("Data collection not started")
        return
    
    _collecting = False
    if _collector_thread:
        _collector_thread.join(2.0)
