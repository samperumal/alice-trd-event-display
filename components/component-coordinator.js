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
            for (const trdTrack of ev.trdTracks) {
                dataMap[trdTrack.id] = trdTrack;
            }

            for (const trdTracklet of ev.trdTracklets) {
                dataMap[trdTracklet.id] = trdTracklet;
            }
        }

        return dataMap;
    }

    addComponent(component) {
        this.components.push(component);
    }

    treeSelect() {
        const fn = function treeMap(ev, eventData) {
            const obj = ev.handleObj.handler.obj;
            const ids = eventData.node.id.split("_");
            let event = null;
            if (ids[0] !== null)
                event = obj.dataMap[ids[0]];

            let trdTrack = null;
            if (ids[1] !== null)
                trdTrack = obj.dataMap[ids[0] + "_" + ids[1]];

            const drawData = {
                event: event,
                trdTrack: trdTrack
            };

            for (const component of obj.components) {
                component.draw(drawData);
            }
        };

        fn.obj = this;
        
        return fn;
    }
}

