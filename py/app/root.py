import functools
import json
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import (
    Blueprint, flash, g, redirect, render_template, 
    request, session, url_for, jsonify, send_file
)

from . import store, socketio

bp = Blueprint('index', __name__, url_prefix='')

@bp.route('/')
def index():
    return send_file("../../index.sessions.html")

@bp.route('/sessions')
def sessions():
    return render_template('root/index.html')   

@bp.route('/upload-file', methods=['POST'])
def upload_file():
    print("Uploaded file: ", request.form, request.files)
    if "file" in request.files and "sessionId" in request.form:
        session_id = request.form["sessionId"]
        data = json.load(request.files["file"])
        
        store.Store().set_session_data(session_id, data)

        socketio.emit('session-summary-changed', store.Store().get_summary(session_id), room=session_id)
        return "success"
    else: raise Exception()

def update_session_selection(selection):
    if selection is not None and "sessionId" in selection and selection["sessionId"] is not None:
        new_selection = store.Store().update_session_selection(selection)
        socketio.emit('session-selection-changed', new_selection, room = str(selection["sessionId"]))

@bp.route('/set-selection', methods=["POST"])
def update_session_selection_post():
    print("Selection changed for session {} by {} to {}".format(str(request.json["sessionId"]), request.host_url, request.json))
    update_session_selection(request.json)
    return "success"

@socketio.on('update-session-selection')
def update_session_selection_socketio(selection):
    print("Selection changed for session {} by {} to {}".format(str(selection["sessionId"]), request.sid, selection))
    update_session_selection(selection)
    