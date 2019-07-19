class TrackInformationComponent {
    constructor(id, config) {
        const div = this.div = d3.select(id);

        this.elements = {};

        this.addElements({
            "ID: ": "id",
            "pT: ": "pt",
            "PID: ": "pid",
            "Stack:": "stk",
            "Sector:": "sec",
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
        if (eventData.track != null) {
            for (const el in this.elements) {
                this.elements[el].text(eventData.track[el]);
            }
        }
        else {
            for (const el in this.elements) {
                this.elements[el].text("");
            }
        }
    }
}
