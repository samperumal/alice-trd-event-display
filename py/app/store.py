from threading import Lock, Thread
from typing import Optional
from datetime import datetime 

class SingletonMeta(type):
	"""
	This is a thread-safe implementation of Singleton.
	"""

	_instance: None

	_lock: Lock = Lock()
	"""
	We now have a lock object that will be used to synchronize threads during
	first access to the Singleton.
	"""

	def __call__(cls, *args, **kwargs):
		# Now, imagine that the program has just been launched. Since there's no
		# Singleton instance yet, multiple threads can simultaneously pass the
		# previous conditional and reach this point almost at the same time. The
		# first of them will acquire lock and will proceed further, while the
		# rest will wait here.
		with cls._lock:
			# The first thread to acquire the lock, reaches this conditional,
			# goes inside and creates the Singleton instance. Once it leaves the
			# lock block, a thread that might have been waiting for the lock
			# release may then enter this section. But since the Singleton field
			# is already initialized, the thread won't create a new object.
			if not cls._instance:
				cls._instance = super().__call__(*args, **kwargs)
		return cls._instance


class Store():
	_cache = {

	}

	__sessions = []

	
	"""
	We'll use this property to prove that our Singleton really works.
	"""
	
	__instance = None
	def __new__(cls):
		if Store.__instance is None:
			Store.__instance = object.__new__(cls)
			Store.__instance.add_session(session = { "name": "Sam's session", "id": 1, "description": "A Test description" })
			Store.__instance.add_session(session = { "name": "Sean's session", "id": 2, "description": "A Test description" })
		return Store.__instance

	def add_session(self, session):
		session["id"] = len(self.__sessions)
		session["start"] = str(datetime.now())
		session["selectedEventId"] = None
		session["selectedTrackId"] = None
		session["selectedTrkltId"] = None
		
		self.__sessions.append(session)

	def get_sessions(self):
		return self.__sessions

	def get_session(self, session_id):
		index = int(session_id)
		return self.__sessions[index]

	def get_summary(self, session_id):
		session = self.get_session(session_id)

		events = [
				{ "id": "E15", "tracks": [{"id": "E15_T1"}], "trklts": []},
				{ "id": "E20", "tracks": [], "trklts": []},
				{ "id": "E98", "tracks": [], "trklts": []}
			]

		if "events" in session:
			events = session["events"]

		return {
			"id": session["id"],
			"name": session["name"],
			"events": events
		}

	def get_session_selection(self, session_id):
		session = self.get_session(session_id)
		selectedEventId = session["selectedEventId"]
		selectedEvent = None
		if "events" in session:
			selectedEvent = next(ev for ev in session["data"] if ev["id"] == selectedEventId)

		return {
				"sessionId": session["id"],
				"selectedEventId": selectedEventId,
				"selectedTrackId": session["selectedTrackId"],
				"selectedTrkltId": session["selectedTrkltId"],
				"selectedEvent"  : selectedEvent
			}

	def update_session_selection(self, selection):
		if "sessionId" in selection and selection["sessionId"] is not None:
			session = self.get_session(selection["sessionId"])
			
			if "eventId" in selection:
				session["selectedEventId"] = selection["eventId"]
			else: session["selectedEventId"] = None

			if "trackId" in selection:
				session["selectedTrackId"] = selection["trackId"]
			else: session["selectedTrackId"] = None

			if "trkltId" in selection:
				session["selectedTrkltId"] = selection["trkltId"]
			else: session["selectedTrkltId"] = None

			return self.get_session_selection(session["id"])

	def track_map(self, tr):
		return {
			"id": tr["id"]
		}

	def event_map(self, ev):
		return {
			"id": ev["id"],
			"tracks": list(map(self.track_map, filter(lambda tr: tr["typ"] == "Trd", ev["tracks"]))),
			"trklts": list(map(self.track_map, ev["trklts"])),
		}

	def set_session_data(self, session_id, data):
		session = self.get_session(session_id)
		summary = list(map(self.event_map, data))
		session["events"] = summary
		session["data"] = data