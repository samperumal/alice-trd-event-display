class SupermoduleViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const layerData = this.layerData = getDimensions();

        const stackData = this.stackData = getDimensions().filter(d => d.layer == 5);

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-350, 350]);
        yscale.domain([400, 0]);

        this.line = d3.line().x(d => xscale(-d.z)).y(d => yscale(Math.sqrt(d.y * d.y + d.x * d.x)));

        this.container
            .attr("class", "supermodule-view-component");

        this.zoomBox = this.container.append("rect");

        this.detectors = this.container
            .append("g")
            .attr("class", "detectors")
            .selectAll("g.detector")
            .data(layerData)
            .enter()
            .append("g")
            .attr("class", "detector");

        this.detectors
            .selectAll("line.bin")
            .data(d => d3.range(1, d.zegments).map(z => ({
                x: xscale(d.minZ + z * d.zsize),
                y1: yscale(d.minR),
                y2: yscale(d.maxR)
            })))
            .enter()
            .append("line")
            .attr("class", "bin")
            .attr("x1", d => d.x)
            .attr("x2", d => d.x)
            .attr("y1", d => d.y1)
            .attr("y2", d => d.y2);

        this.detectors
            .append("rect")
            .attr("class", "detector")
            .attr("x", d => xscale(d.minZ))
            .attr("width", d => xscale(d.maxZ) - xscale(d.minZ))
            .attr("y", d => yscale(d.maxR))
            .attr("height", d => yscale(d.minR) - yscale(d.maxR));

        this.stackTexts = this.container
            .append("g")
            .attr("class", "stack-texts")
            .selectAll("text.stack-text")
            .data(stackData)
            .enter()
            .append("text")
            .attr("class", "stack-text")
            .text(d => d.stack)
            .attr("x", d => xscale((d.minZ + d.maxZ) / 2))
            .attr("y", d => yscale(d.maxR + 10));

        this.tracklets = this.container.append("g")
            .attr("class", "tracklets");

        this.tracks = this.container.append("g")
            .attr("class", "tracks");

        this.setViewBox(null, 750);
    }

    draw(eventData) {
        const xscale = this.xscale, yscale = this.yscale;
        const line = this.line;
        const layerData = this.layerData;

        const selectedTrack = eventData.trdTrack != null ? eventData.trdTrack.id : null;

        if (this.selectedEventId != eventData.event.id) {
            this.selectedEventId = eventData.event.id;
            let tracks = this.tracks
                .selectAll("g.track")
                .data(eventData.event.trdTracks.filter(d => d.track != null && d.track.path != null), d => d.id);

            tracks.exit().remove();

            tracks.enter()
                .append("g")
                .attr("class", "track")
                .attr("data-trackid", d => d.id)
                .append("path")
                .attr("class", "track")
                .attr("d", d => line(d.track.path));
        }

        this.tracks.selectAll("g.track")
            .classed("not-selected", d => eventData.trdTrack != null && d.id != selectedTrack)
            .filter(d => d.id == selectedTrack)
            .raise();

        this.detectors
            .classed("not-selected", d => eventData.trdTrack != null && d.stack != eventData.trdTrack.stack);

        if (eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null) {
            let tracklets = this.tracklets
                .selectAll(".tracklet")
                .data(eventData.trdTrack.trdTracklets, d => d.id);

            tracklets.exit().remove();

            tracklets.enter()
                .append("g")
                .append("circle")
                .attr("class", "tracklet")
                .attr("cy", d => {
                    const layer = layerData.filter(l => l.layer == d.layer && l.stack == d.stack)[0];
                    return yscale(layer.midR);
                })
                .attr("cx", d => {
                    const layer = layerData.filter(l => l.layer == d.layer && l.stack == d.stack)[0];
                    return xscale(layer.minZ + (d.binZ + 0.5) * layer.zsize);
                })
                .attr("r", this.r);

            this.setViewBox(eventData.trdTrack.stack);
        }
        else {
            this.setViewBox();
        }
    }

    setViewBox(stack, transitionDuration) {
        let zoomBoxClass = "zoom-box ";
        if (stack == null) {
            stack = 2;
            zoomBoxClass += "hidden";
        }

        if (transitionDuration == null)
            transitionDuration = 750;

        const xscale = this.xscale, yscale = this.yscale;

        const thisStack = this.layerData.filter(d => d.stack == stack);
        const minZ = d3.min(thisStack, d => d.minZ), maxZ = d3.max(thisStack, d => d.maxZ);
        const minR = d3.min(thisStack, d => d.minR) * 0.9;

        if (this.config.zoom) {
            this.svg
                .transition().duration(transitionDuration)
                .attr("viewBox", (xscale(minZ)) + " " + (yscale.range()[0]) + " " + (dist(minZ, maxZ, xscale)) + " " + (dist(yscale.domain()[0], minR, yscale)));
        }
        else this.zoomBox
            .transition().duration(transitionDuration)
            .attr("class", zoomBoxClass)
            .attr("x", xscale(minZ))
            .attr("y", yscale.range()[0])
            .attr("width", (dist(minZ, maxZ, xscale)))
            .attr("height", dist(yscale.domain()[0], minR, yscale));
    }
}