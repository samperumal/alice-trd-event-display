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
        self.__sessions.append(session)

    def get_sessions(self):
        return self.__sessions

    def get_summary(self, session_id):
        index = int(session_id)
        session = self.__sessions[index]

        return {
            "id": session["id"],
            "name": session["name"],
            "events": [
                { "id": "E15", "tracks": [{"id": "E15_T1"}], "trklts": []},
                { "id": "E20", "tracks": [], "trklts": []},
                { "id": "E98", "tracks": [], "trklts": []}
            ]
        }

    def update_session_selection(self, selection):
        if "sessionId" in selection and selection["sessionId"] is not None:
            sessionIndex = int(selection["sessionId"])
            session = self.__sessions[sessionIndex]
            
            if "eventId" in selection:
                session["selectedEventId"] = selection["eventId"]
            else: session["selectedEventId"] = None

            if "trackId" in selection:
                session["selectedTrackId"] = selection["trackId"]
            else: session["selectedTrackId"] = None

            print(session)

            return {
                "sessionId": sessionIndex,
                "selectedEventId": session["selectedEventId"],
                "selectedTrackId": session["selectedTrackId"]
            }

    def UpdateValue(self, key, value):
        self._cache[key] = value
        #if self.onUpdate: onUpdate(self._cache)

    def GetValue(self, key):
        if key in self._cache: return self._cache[key]
        else: return None

    def GetValues(self):
        return self._cache

    def GetState(self):
        # from . import actions
        # available_actions = []
        # current_state = self.GetValue("state")
        # if current_state != None:
        #     available_actions = actions.available_actions(current_state)
        return {
            "services": self.GetValues(),
            "sessions": []
        }   
