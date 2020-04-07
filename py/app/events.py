from flask import session, request
from flask_socketio import emit, join_room, leave_room
from . import store
from . import socketio

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
def join_session(session_id):
    print("Client [", request.sid, "] joined session ", session_id)

    join_room(str(session_id))

    emit('info', '{} joined session {}'.format(request.sid, session_id), room = str(session_id))
    
    # When a client joins a session, send the current event summary and selection only to them
    emit('session-summary-changed', store.Store().get_summary(session_id))        
    emit('session-selection-changed', store.Store().get_session_selection(session_id))

@socketio.on('leave-sessions')
def leave_session(session_id):
    # Remove 
    pass

@socketio.on('update-session-selection')
def update_session_selection(selection):
    if selection is not None and "sessionId" in selection and selection["sessionId"] is not None:
        new_selection = store.Store().update_session_selection(selection)
        print("Selection changed for session {} by {}".format(str(selection["sessionId"]), request.sid))
        socketio.emit('session-selection-changed', new_selection, room = str(selection["sessionId"]))