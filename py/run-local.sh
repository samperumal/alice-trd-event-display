source venv/scripts/activate
source venv/bin/activate
export FLASK_ENV=development
export FLASK_APP=flaskr
python run-socket.py 0.0.0.0 5001 "../data/pPb"
