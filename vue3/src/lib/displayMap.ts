import { EventData, SelectionTreeData } from "./types"

export function createEventTree(data: EventData) : SelectionTreeData {
	if (data != null)
		return data.map(e => ({
			id: e.id,
			label: `Event ${e.id}`,
			selected: false,
			// info: e.i,
			tracks: e.tracks.map(t => ({
				id: t.id,
				label: `Track ${t.id} [Stack ${t.stk}, Sector ${t.sec}]`,
				selected: false
			}))
		}))
	return []
}