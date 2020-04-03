from flask import Flask, g, jsonify, redirect, url_for, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flaskr import store, create_app, updateState
import sys

if __name__ == '__main__':
    app = create_app()
    socketio = SocketIO(app)

    @socketio.on('connect')
    def connect():
        print("Client connection: ", request.sid)
        #update_client()
        # When a client connects, send a list of current sessions only to them
        emit('session-list', store.Store().get_sessions())

    @socketio.on('create-session')
    def create_session(session):
        store.Store().add_session(session)
        # When a session is created, send a list of current sessions to all clients
        socketio.emit('session-list', store.Store().get_sessions())

    @socketio.on('join-session')
    def request_data(session_id):
        # When a client joins a session, send the current event summary only to them
        #emit('event-summary', store.Store().get_summary(session_id))
        print("Client [", request.sid, "] joined session ", session_id)
        join_room(session_id)
        emit('info', '{} joined session {}'.format(request.sid, session_id), room = session_id)
        return store.Store().get_summary(session_id)
        pass

    @socketio.on('leave-sessions')
    def leave_session(session_id):
        # Remove 
        pass

    @socketio.on('update-session-selection')
    def update_session_selection(selection):
        print(selection)
        if selection is not None and "sessionId" in selection and selection["sessionId"] is not None:
            new_selection = store.Store().update_session_selection(selection)
            emit('session-selection-changed', new_selection, room = selection["sessionId"])
    
    host = sys.argv[1] if len(sys.argv) > 1 else 'localhost'
    port = sys.argv[2] if len(sys.argv) > 2 else 5001
    
    socketio.run(app, host = host, port = port)