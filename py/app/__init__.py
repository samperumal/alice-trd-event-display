from flask import Flask, g, jsonify, redirect, url_for
from flask_socketio import SocketIO, emit, join_room, leave_room
import os

socketio = SocketIO()

def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True, 
        static_url_path="/", 
        static_folder="../..")
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )
    
    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    from . import root, events
    app.register_blueprint(root.bp)

    socketio.init_app(app)
    return app

