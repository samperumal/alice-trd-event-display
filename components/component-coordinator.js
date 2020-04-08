class ComponentCoordinator {
    constructor(data) {
        this.components = []

        this.event = null
        this.track = null
        this.trklt = null

        if (data != null)
            this.setData(data)
    }

    setData(data) {
        this.data = data
        this.dataMap = this.mapData(this.data)
    }

    mapData(data) {
        const dataMap = {};
        for (const ev of data) {
            dataMap[ev.id] = ev;
            for (const track of ev.tracks) {
                dataMap[track.id] = track;
            }

            for (const tracklet of ev.trklts) {
                dataMap[tracklet.id] = tracklet;
            }
        }

        return dataMap;
    }

    addComponent(component) {
        this.components.push(component);
    }

    treeSelect(ev, eventData) {
        let event = null;
        let track = null;

        if (ev.type == "dehover_node") {
            event = this.event;
            track = this.track;
        }
        else {
            const ids = eventData.node.id.split("_");

            if (ids[0] !== null)
                event = this.dataMap[ids[0]];

            if (ids[1] !== null)
                track = this.dataMap[ids[0] + "_" + ids[1]];

            if (ev.type == "select_node") {
                this.event = event;
                this.track = track;
            }
        }

        const drawData = {
            event,
            track,
            type: (ev.type == "select_node" || ev.type == "dehover_node") ? "select" : (ev.type == "hover_node" ? "hover" : "hover")
        };

        for (const component of this.components) {
            component.draw(drawData);
        }
    }

    showEvent(eventData, eventId, trackId, trkltId, rawData) {
        const event = this.event = eventData
        const track = this.track = eventData != null ? eventData.tracks.find(d => d.id == trackId) : null
        const trklt = this.trklt = eventData != null ? eventData.trklts.find(d => d.id == trkltId) : null

        const drawData = {
            event,
            track,
            trklt,
            rawData,
            type: "select"
        };

        for (const component of this.components) {
            component.draw(drawData);
        }
    }

    padSelect(data) {
        for (const component of this.components) {
            if (component.updatePad != null)
                component.updatePad(data);
        }
    }
}

