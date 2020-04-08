from app import create_app, socketio, session
import sys

app = create_app()
    
if __name__ == '__main__':
    
    host = sys.argv[1] if len(sys.argv) > 1 else '0.0.0.0'
    port = sys.argv[2] if len(sys.argv) > 2 else 5001
    raw_data_path = sys.argv[3] if len(sys.argv) > 3 else '../data/pPb'

    session.Session.raw_data_path = raw_data_path
    
    socketio.run(app, host = host, port = port)