import time
import logging

logger = logging.getLogger(__name__)

def process_raw_data(raw_data):
    """
    Process raw data from OMNeT++/Veins simulation.
    
    Args:
        raw_data (dict): Raw data from OMNeT++/Veins simulation
    
    Returns:
        dict: Processed data with metrics
    """
    try:
        # Extract metrics from raw data
        metrics = raw_data.get("metrics", {})
        timestamp = raw_data.get("timestamp", time.time())
        node_info = raw_data.get("node_info", {})
        
        # Process throughput (convert to Mbps if necessary)
        throughput = metrics.get("throughput", 0.0)
        
        # Process PDR (ensure it's a percentage between 0 and 1)
        pdr = metrics.get("pdr", 0.0)
        
        # Process EED (end-to-end delay in milliseconds)
        eed = metrics.get("eed", 0.0)
        
        # Create processed data structure
        processed_data = {
            "timestamp": timestamp,
            "throughput": throughput,
            "pdr": pdr,
            "eed": eed,
            "node_info": node_info
        }
        
        # Add formatted timestamp for display
        processed_data["formatted_time"] = time.strftime("%H:%M:%S", time.localtime(timestamp))
        
        return processed_data
    except Exception as e:
        logger.error(f"Error processing data: {e}")
        # Return empty data structure in case of error
        return {
            "timestamp": time.time(),
            "formatted_time": time.strftime("%H:%M:%S"),
            "throughput": 0.0,
            "pdr": 0.0,
            "eed": 0.0,
            "node_info": {}
        }

def calculate_statistics(data_series):
    """
    Calculate statistics for a series of data points.
    
    Args:
        data_series (list): List of data points
    
    Returns:
        dict: Statistics (min, max, avg, etc.)
    """
    if not data_series:
        return {
            "min": 0,
            "max": 0,
            "avg": 0,
            "median": 0
        }
    
    # Sort the data for median calculation
    sorted_data = sorted(data_series)
    
    # Calculate statistics
    min_val = min(data_series)
    max_val = max(data_series)
    avg_val = sum(data_series) / len(data_series)
    
    # Calculate median
    n = len(sorted_data)
    if n % 2 == 0:
        median_val = (sorted_data[n//2 - 1] + sorted_data[n//2]) / 2
    else:
        median_val = sorted_data[n//2]
    
    return {
        "min": min_val,
        "max": max_val,
        "avg": avg_val,
        "median": median_val
    }

def process_historical_data(simulation_data):
    """
    Process historical simulation data for comparison.
    
    Args:
        simulation_data (dict): Dictionary of simulation runs
    
    Returns:
        dict: Processed data for comparison
    """
    result = {}
    
    for sim_name, sim_data in simulation_data.items():
        throughput_stats = calculate_statistics(sim_data.get("throughput", []))
        pdr_stats = calculate_statistics(sim_data.get("pdr", []))
        eed_stats = calculate_statistics(sim_data.get("eed", []))
        
        result[sim_name] = {
            "throughput": throughput_stats,
            "pdr": pdr_stats,
            "eed": eed_stats,
            "data_points": len(sim_data.get("throughput", []))
        }
    
    return result
