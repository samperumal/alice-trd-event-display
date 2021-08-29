import { EventData } from "./types"

export function createEventTree(data: EventData) {
	if (data != null)
		return data.map(e => ({
			id: e.id,
			label: `Event ${e.id}`,
			// info: e.i,
			tracks: e.tracks.map(t => ({
				label: `Track ${t.id} [Stack ${t.stk}, Sector ${t.sec}]`
			}))
		}))
	return null
}