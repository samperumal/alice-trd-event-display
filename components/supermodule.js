class SuperModuleComponent extends ComponentBase {
    constructor(id, width, height) {
        super(id, width, height, marginDef(20, 20, 20, 20));

        const layerData = this.layerData = getDimensions().filter(d => d.module == 2);
        this.detectorData = d3.range(18)
            .map(s => layerData.map(l => Object.assign({ sector: s, rot: -10 - 20 * s }, l)))
            .reduce((a, b) => a.concat(b));

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-450, 450]);
        yscale.domain([-450, 450]);

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(-d.y));

        this.container
            .classed("supermodule-component", true);

        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[-this.displayWidth / 2, -this.displayHeight / 2],[this.displayWidth / 2, this.displayHeight / 2]])
            .extent([[-this.displayWidth / 2, -this.displayHeight / 2],[this.displayWidth / 2, this.displayHeight / 2]])
            .on("zoom", this.zoomed.bind(this));

        this.container.append("rect")
            .attr("class", "zoom")
            .attr("width", this.displayWidth)
            .attr("height", this.displayHeight)
            .attr("transform", "translate(" + (-this.displayWidth / 2) + "," + (-this.displayHeight / 2) + ")")
            .call(zoom);

        this.detectors = this.container
            .append("g")
            .attr("class", "detectors")
            .selectAll("g.detector")
            .data(this.detectorData)
            .enter()
            .append("g")
            .attr("class", "detector")
            .attr("transform", d => "rotate(" + d.rot + ")translate(" + xscale(d.minR / 10) + ",0)");

        this.detectors
            .append("rect")
            .attr("class", "detector")
            .attr("y", d => yscale(d.minLocalY))
            .attr("height", d => dist(d.minLocalY, d.maxLocalY, yscale))
            .attr("width", d => dist(d.minR / 10, d.maxR / 10, xscale));

        this.container
            .append("g")
            .attr("class", "sector-number")
            .selectAll("g")
            .data(d3.range(18))
            .enter()
            .append("g")
            .attr("transform", d => "rotate(" + (-10 - 20 * d) + ")")
            .append("text")
            .attr("class", "sector-number")
            .text(d => d)
            .attr("transform", d => "translate(" + (xscale(d3.max(layerData, d2 => d2.maxR) * 0.11)) + ", 0)rotate(" + (-(-10 - 20 * d)) + ")")
            ;

        this.tracks = this.container.append("g")
            .attr("class", "tracks");

        this.tracklets = this.container.append("g")
            .attr("class", "tracklets");

        super.draw();
    }

    zoomed() {
        console.log(d3.event.transform)
    }

    draw(eventData) {
        const xscale = this.xscale, yscale = this.yscale;
        const line = this.line;
        const layerData = this.layerData;

        const selectedTrack = eventData.trdTrack != null ? eventData.trdTrack.id : null;

        let tracks = this.tracks
            .selectAll("g.track")
            .data(eventData.event.trdTracks.filter(d => d.track != null && d.track.path != null), d => d.id);

        tracks.exit().remove();

        tracks.enter()
            .append("g")
            .attr("class", "track")
            .append("path")
            .attr("class", "track")
            .attr("d", d => line(d.track.path));

        this.tracks.selectAll("path.track")
            .classed("selected", d => d.id == selectedTrack);

        if (eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null) {
            let tracklets = this.tracklets
                .selectAll(".tracklet")
                .data(eventData.trdTrack.trdTracklets, d => d.id);

            tracklets.exit().remove();

            tracklets.enter()
                .append("g")
                .attr("transform", d => "rotate(" + (-10 - 20 * d.sector) + ")")
                .append("circle")
                .attr("class", "tracklet")
                .attr("cy", d => yscale(-d.localY))
                .attr("cx", d => xscale((layerData[d.layer].minR + layerData[d.layer].maxR) / 2 / 10))
                .attr("r", 2);

        }
    }
}