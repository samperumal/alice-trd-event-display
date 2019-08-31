class TrackInformationComponent {
    constructor(id, config) {
        const div = this.div = d3.select(id);
        this.info_event = div.select("div.info-event");

        this.elements = {};

        // this.addElements({
        //     "ID:": "id",
        //     "Stack:": "stk",
        //     "Sector:": "sec"
        // });
    }

    addElements(elements) {
        for (const el in elements) {
            const tr = this.div.append("tr");
            tr.append("td").text(el);
            this.elements[elements[el]] = tr.append("td");
        }
    }

    draw(eventData) {
        if (eventData.event != null) {
            const ev = eventData.event;

            if (ev.b != null) {
                const collision_system = "a proton and a lead nuclei";
                const energy = ev.b.e + " GeV";
                this.info_event.html(`Collision between ${collision_system} at an energy of ${energy}`);
            }
            else this.info_event.html("");
        }

        if (eventData.track != null) {
            const track = eventData.track;
            const info = track.i;
            // for (const el in this.elements) {
            //     if (track[el] != null)
            //         this.elements[el].text(track[el]);
            //     else this.elements[el].text("");
            // }
        }
        else {
            // for (const el in this.elements) {
            //     this.elements[el].text("");
            // }
        }
    }
}
