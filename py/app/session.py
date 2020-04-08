import os
import pathlib
import json
from datetime import datetime 

class Session:
	id = None
	name = None
	description = None
	start = None
	selectedEventId = None
	selectedTrackId = None
	selectedTrkltId = None
	data = []
	event_summaries = []

	def __init__(self, id, name, description):
		self.id = id 
		self.name = name
		self.description = description
		self.start = str(datetime.now())

	def summary(self):
		return {
			"id": self.id,
			"name": self.name,
			"description": self.description
		}

	def event_summary(self):
		return {
			"id": self.id,
			"name": self.name,
			"events": self.event_summaries
		}

	def track_map(self, tr):
		return { "id": tr["id"] }

	def event_map(self, ev):
		return {
			"id": ev["id"],
			"tracks": list(map(self.track_map, filter(lambda tr: tr["typ"] == "Trd", ev["tracks"]))),
			"trklts": list(map(self.track_map, ev["trklts"])),
		}
	
	def set_data(self, data):
		self.data = data
		self.event_summaries = list(map(self.event_map, data))

	def get_selection(self):
		ev_iterator = (ev for ev in self.data if ev["id"] == self.selectedEventId)
		selected_event = next(ev_iterator, None)

		return {
			"sessionId": self.id,
			"selectedEventId": self.selectedEventId,
			"selectedTrackId": self.selectedTrackId,
			"selectedTrkltId": self.selectedTrkltId,
			"selectedEvent"  : selected_event,
			"rawData"				 : self._get_raw_data(selected_event)
		}

	def _get_raw_data(self, selected_event):
		if selected_event is not None:
			json_path = None

			if self.selectedTrackId is not None:
				track_iterator = (tr for tr in selected_event["tracks"] if "id" in tr and tr["id"] == self.selectedTrackId)
				selected_track = next(track_iterator, None)
				json_path = "..\\data\\pPb\\{0}.{1}.{2}.json".format(selected_event["id"], selected_track["sec"], selected_track["stk"])

			elif self.selectedTrkltId is not None:
				trklt_iterator = (tr for tr in selected_event["trklts"] if "id" in tr and tr["id"] == self.selectedTrkltId)
				selected_trklt = next(trklt_iterator, None)
				json_path = "..\\data\\pPb\\{0}.{1}.{2}.json".format(selected_event["id"], selected_trklt["sec"], selected_trklt["stk"])
				print(json_path)

			if json_path is not None:				
				if os.path.exists(json_path):
					with open(json_path, "r") as json_file:
						return json.load(json_file)
				
		return {}