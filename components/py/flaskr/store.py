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
        self.__sessions.append(session)

    def get_sessions(self):
        return self.__sessions

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
