// JSTree conversion functions
function trdTrackToJSTreeNode(t) {
    return {
        id: t.id,
        text: `Track ${t.id.split("_")[1].substring(1)}  [Stack ${t.stk}, Sector ${t.sec}]`,
        data: t,
        type: "Track"
    };
}

function eventToJSTreeNode(e) {
    e.tracks
        .sort((a,b) => {
            if (a.typ == b.typ)
                return a.stk != b.stk ? a.stk - b.stk : a.sec - b.sec;
            else if (a.typ == "Esd")
                return 1;
            else return -1;
        });

    return {
        id: e.id,
        text: "Event " + e.id.substring(1),
        type: "Event",
        data: e,
        state: {
            opened: false,
        },
        children:
            e.tracks
            .filter(a => a.typ == "Trd")
            .map(trdTrackToJSTreeNode)
    };
}

class EventTree {
    constructor(id, data, treeSelect) {
        this.treeData = data.map(eventToJSTreeNode);
        this.treeSelect = treeSelect;
        this.tree = $(id);

        this.tree
            .on("hover_node.jstree", ((ev, eventData) => {
                this.tree.jstree("deselect_all", true);  
                this.tree.jstree("select_node", eventData.node);  
            }).bind(this))
            //.on("dehover_node.jstree", this.treeSelectChanged.bind(this))
            .on("select_node.jstree", this.treeSelectChanged.bind(this))
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

    treeSelectChanged(ev, eventData) {
        this.treeSelect(ev, eventData);
    }

    changeSelection() {
        this.tree.jstree("open_all");

        const currentArray = this.tree.jstree("get_selected");
        if (currentArray != null && currentArray.length > 0) {
            const current = this.tree.jstree("get_node", currentArray[0]);
            const next = this.tree.jstree("get_next_dom", current);
            if (next != null && next.length > 0) {
                this.tree.jstree("select_node", next);  
                next[0].scrollIntoView();              
            }
            else {
                this.tree.jstree("select_node", this.treeData[0]);
            }
            this.tree.jstree("deselect_node", current);
        }
        else {
            this.tree.jstree("select_node", this.treeData[0]);
        }

        window.setTimeout(this.changeSelection.bind(this), 5000);
    }
}