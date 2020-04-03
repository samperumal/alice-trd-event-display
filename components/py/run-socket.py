from flask_socketio import SocketIO, emit
from flaskr import store, create_app, updateState
import sys

if __name__ == '__main__':
    app = create_app()
    socketio = SocketIO(app)

    def update_clients():
        socketio.emit('state', store.Store().get_sessions())

    @socketio.on('connect')
    def connect():
        print("Client connection")
        update_clients()

    @socketio.on('create-session')
    def create_session(session):
        store.Store().add_session(session)
        update_clients()
    
    host = sys.argv[1] if len(sys.argv) > 1 else 'localhost'
    port = sys.argv[2] if len(sys.argv) > 2 else 5001
    
    socketio.run(app, host = host, port = port)