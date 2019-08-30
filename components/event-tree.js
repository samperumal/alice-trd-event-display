// JSTree conversion functions
function trdTrackToJSTreeNode(t) {
    return {
        id: t.id,
        text: `${t.typ} track ${t.id.substring(4)} (Sector ${t.sec}, Stack ${t.stk})`,
        data: t,
        type: "Track"
    };
}

function eventToJSTreeNode(e) {
    e.tracks.sort((a,b) => {
        if (a.typ == b.typ)
            return a.sec != b.sec ? a.sec - b.sec : a.stk - b.stk;
        else if (a.typ == "Esd")
            return 1;
        else return -1;
    });

    return {
        id: e.id,
        text: "Event " + e.id,
        type: "Event",
        data: e,
        state: {
            opened: false,
        },
        children:
            e.tracks.map(trdTrackToJSTreeNode)
    };
}

class EventTree {
    constructor(id, data, treeSelect) {
        this.treeData = data.map(eventToJSTreeNode);

        $(id)
            .on("hover_node.jstree", treeSelect)
            .on("dehover_node.jstree", treeSelect)
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