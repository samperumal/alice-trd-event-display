import functools
import json
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify
)

from . import store, socketio

bp = Blueprint('index', __name__, url_prefix='')

@bp.route('/sessions')
def index():
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