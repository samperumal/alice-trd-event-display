from app import create_app, socketio
import sys

app = create_app()
    
if __name__ == '__main__':
    
    host = sys.argv[1] if len(sys.argv) > 1 else 'localhost'
    port = sys.argv[2] if len(sys.argv) > 2 else 5001
    
    socketio.run(app, host = host, port = port)