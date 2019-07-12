class ComponentCoordinator {
    constructor(data) {
        this.data = data;
        this.dataMap = this.mapData(this.data);
        this.components = [];
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
        const ids = eventData.node.id.split("_");
        
        let event = null;
        if (ids[0] !== null)
            event = this.dataMap[ids[0]];

        let track = null;
        if (ids[1] !== null)
            track = this.dataMap[ids[0] + "_" + ids[1]];

        const drawData = {
            event,
            track,
            type: ev.type == "select_node" ? "select" : (ev.type == "hover_node" ? "hover" : "hover")
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

