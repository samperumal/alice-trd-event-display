class TrackInformationComponent {
    constructor(id, config) {
        const div = this.div = d3.select(id);

        this.elements = {};

        this.addElements({
            "ID: ": "id",
            "pT: ": "pt",
            "PID: ": "pid",
            "Stack:": "stack",
            "Sector:": "sector",
            "Alpha:": "alpha",
            "Lambda:" : "lambda"
        });
    }

    addElements(elements) {
        for (const el in elements) {
            const tr = this.div.append("tr");
            tr.append("td").text(el);
            this.elements[elements[el]] = tr.append("td");
        }
    }

    draw(eventData) {
        if (eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null) {
            for (const el in this.elements) {
                this.elements[el].text(eventData.trdTrack[el]);
            }
        }
        else {
            for (const el in this.elements) {
                this.elements[el].text("");
            }
        }
    }
}
