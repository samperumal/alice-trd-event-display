class ComponentCoordinator {
    constructor(data) {
        this.data = data;
        this.dataMap = this.mapData(this.data);
        this.components = [];

        this.event = null;
        this.track = null;
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

    padSelect(data) {
        for (const component of this.components) {
            if (component.updatePad != null)
                component.updatePad(data);
        }
    }
}

export { ComponentCoordinator };