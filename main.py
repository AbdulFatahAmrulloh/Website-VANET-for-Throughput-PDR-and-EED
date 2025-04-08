from app import app, socketio
import logging

if __name__ == "__main__":
    logging.basicConfig(level=logging.DEBUG)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True, allow_unsafe_werkzeug=True)
