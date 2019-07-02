// JSTree conversion functions
function trdTrackToJSTreeNode(t) {
    return {
        id: t.id,
        text: "TrdTrack " + t.id.substring(4) + ": (Sector " + t.sector + ", Stack " + t.stack + ")",
        data: t,
        type: "TrdTrack"
    };
}

function eventToJSTreeNode(e) {
    e.trdTracks.sort((a,b) => a.sector != b.sector ? a.sector - b.sector : a.stack - b.stack);

    return {
        id: e.id,
        text: "Event " + e.evno,
        type: "Event",
        data: e,
        state: {
            opened: false,
        },
        children:
            e.trdTracks.map(trdTrackToJSTreeNode)
    };
}

class EventTree {
    constructor(id, data, treeSelect) {
        this.treeData = data.map(eventToJSTreeNode);

        $(id)
            .on("hover_node.jstree", treeSelect)
            .on("select_node.jstree", treeSelect)
            .jstree({
                'core': {
                    'themes': {
                        'name': 'proton',
                        'responsive': true
                    },
                    'data': this.treeData
                }
            });
    }
}