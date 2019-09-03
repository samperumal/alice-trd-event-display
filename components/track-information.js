class TrackInformationComponent {
    constructor(id, config) {
        const div = this.div = d3.select(id);
        this.info_event = div.select("div.info-event");
        this.info_track = div.select("div.info-track");

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
        let event_text = "";

        if (eventData.event != null) {
            const ev = eventData.event;

            if (ev.i != null) {
                if (ev.i.be != null && ev.i.bt != null) {
                    const collision_system = "a proton and a lead nuclei";
                    const energy = (ev.i.be / 1000) + " TeV";
                    event_text = `Collision between ${collision_system} at an energy of ${energy}`;
                }
            }            
        }
        this.info_event.html(event_text);

        let track_text = "";
        if (eventData.track != null) {
            const track = eventData.track;
            const info = track.i;
            
            track_text = `${track.typ} track ${track.id} traverses Sector ${track.sec}, Stack ${track.stk} of the TRD`;
            if (info.pT != null) track_text += ` with a transverse momentum of ${info.pT} eV.`; else track_text += ".";

            if (info.pid != null) track_text += ` The calculated PID value of ${info.pid} indicates this is likely ${info.pid >= 100 ? "an electron" : "a pion"} track.`;
        }
        this.info_track.html(track_text);
    }
}
