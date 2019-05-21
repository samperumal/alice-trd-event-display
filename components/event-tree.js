// JSTree conversion functions
function trdTrackToJSTreeNode(t) {
    return {
        id: t.id,
        text: "TrdTrack " + t.id + " Stack: " + t.stack + " Sector: " + t.sector,
        data: t,
        type: "TrdTrack"
    };
}

function eventToJSTreeNode(e) {
    return {
        id: e.id,
        text: "Event " + e.id,
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