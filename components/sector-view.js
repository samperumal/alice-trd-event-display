class SectorViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5));

        const sectorToRotationAngle = this.sectorToRotationAngle;

        const layerData = this.layerData = getDimensions().filter(d => d.stack == 2);
        this.detectorData = d3.range(18)
            .map(s => ({
                sector: s,
                rot: sectorToRotationAngle(s),
                layerData: layerData.map(l => Object.assign({ sector: s, rot: sectorToRotationAngle(s) }, l))
            }));

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-450, 450]);
        yscale.domain([-450, 450]);

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(-d.y));

        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[-this.displayWidth / 2, -this.displayHeight / 2], [this.displayWidth / 2, this.displayHeight / 2]])
            .extent([[-this.displayWidth / 2, -this.displayHeight / 2], [this.displayWidth / 2, this.displayHeight / 2]])
            .on("zoom", this.zoomed.bind(this));

        this.container.append("rect")
            .attr("class", "zoom")
            .attr("width", this.displayWidth)
            .attr("height", this.displayHeight)
            .attr("transform", "translate(" + (-this.displayWidth / 2) + "," + (-this.displayHeight / 2) + ")");

        this.zoomBox = this.container
            .append("g")
            .attr("class", "zoom-box-group")
            .attr("transform", "rotate(-80)");

        const zoomPath = [
            [xscale(0), yscale(0)],
            [xscale.range()[1], yscale(0)],
            [xscale.range()[1] * Math.cos(20 / 180 * Math.PI), -xscale.range()[1] * Math.sin(20 / 180 * Math.PI)],
            [xscale(0), yscale(0)]
        ];

        this.zoomBox.append("path")
            .attr("class", "zoom-box")
            .attr("d", d3.line()(zoomPath));

        this.rotatingContainer = this.container
            .classed("sector-view-component", true)
            .append("g")
            .attr("class", "rotating");

        this.sectors = this.rotatingContainer
            .append("g")
            .attr("class", "sectors")
            .selectAll("g.sector")
            .data(this.detectorData)
            .enter()
            .append("g")
            .attr("class", "sector")
            .attr("transform", d => "rotate(" + d.rot + ")");

        this.detectors = this.sectors
            .selectAll("g.detector")
            .data(d => d.layerData)
            .enter()
            .append("g")
            .attr("class", "detector")
            .attr("transform", d => "translate(" + xscale(d.minR) + ", 0)");

        this.detectors
            .append("rect")
            .attr("class", "detector")
            .attr("y", d => yscale(d.minLocalY))
            .attr("height", d => dist(d.minLocalY, d.maxLocalY, yscale))
            .attr("width", d => dist(d.minR, d.maxR, xscale));

        this.layerNumbers = this.detectors
            .append("g")
            .append("text")
            .attr("class", "layer-number")
            .text(d => d.layer)
            .attr("transform", d => "translate(0," + yscale(d.minLocalY - 2) + ")rotate(" + (-d.rot) + ")");

        this.detectors
            .append("line")
            .attr("class", "half-chamber-div")
            .attr("x1", 0)
            .attr("x2", d => xscale(d.maxR) - xscale(d.minR))
            .attr("y1", yscale(0))
            .attr("y2", yscale(0));

        this.sectorNumbers = this.rotatingContainer
            .append("g")
            .attr("class", "sector-number")
            .selectAll("g")
            .data(d3.range(18))
            .enter()
            .append("g")
            .attr("transform", d => "rotate(" + sectorToRotationAngle(d) + ")translate(" + (xscale(d3.max(layerData, d2 => d2.maxR) * 1.1)) + ", 0)")
            .append("text")
            .attr("class", "sector-number")
            .text(d => d)
            .attr("transform", d => "rotate(" + (-sectorToRotationAngle(d)) + ")")
            ;

        this.tracks = this.rotatingContainer.append("g")
            .attr("class", "tracks");

        this.trackletPlanes = this.rotatingContainer.append("g")
            .attr("class", "trackletPlanes");

        if (viewBox != null)
            this.transitionViewBox(viewBox, 750);
    }

    zoomed() {
        console.log(d3.event.transform)
    }

    sectorToRotationAngle(sector) {
        return -10 - 20 * sector;
    }

    draw(eventData) {
        const xscale = this.xscale, yscale = this.yscale;
        const line = this.line;
        const layerData = this.layerData;

        const sectorToRotationAngle = this.sectorToRotationAngle;
        const transitionDuration = 750;

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
                .append("path")
                .attr("class", "track")
                .attr("d", d => line(d.track.path));

            let trackletPlanes = this.trackletPlanes
                .selectAll("g.tracklet-plane")
                .data(eventData.event.trdTracklets, d => d.id);

            trackletPlanes.exit().remove();

            trackletPlanes.enter()
                .append("g")
                .attr("class", "tracklet-plane")
                .attr("data-trackletid", d => d.id)
                .attr("transform", d => "rotate(" + (sectorToRotationAngle(d.sector)) + ")")
                .append("line")
                .attr("class", "tracklet-plane")
                .attr("y1", d => yscale(-d.localY))
                .attr("y2", d => yscale(-d.localY + (d.dyDx * Math.abs(d.layer.maxR - d.layer.minR))))
                .attr("x1", d => xscale(d.layer.maxR))
                .attr("x2", d => xscale(d.layer.minR))
                ;
        }

        this.tracks.selectAll("path.track")
            .classed("not-selected", d => eventData.trdTrack != null && d.id != selectedTrack);

        if (eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null) {
            const trackletIds = eventData.trdTrack.trdTracklets.map(d => d.id);

            this.trackletPlanes.selectAll(".tracklet-plane")
                .classed("not-selected", d => !trackletIds.includes(d.id));

            this.trackletPlanes.selectAll(".tracklet-plane")
                .classed("selected", d => trackletIds.includes(d.id));

            const sector = eventData.trdTrack.sector;

            if (this.config.rotate) {
                this.rotatingContainer
                    .transition().duration(transitionDuration)
                    .attr("transform", "rotate(" + ((sector - 4) * 20) + ")");

                this.sectorNumbers
                    .transition().duration(transitionDuration)
                    .attr("transform", d => "rotate(" + (-sectorToRotationAngle(d) - ((sector - 4) * 20)) + ")");

                this.layerNumbers
                    .transition().duration(transitionDuration)
                    .attr("transform", d => "translate(0," + yscale(d.minLocalY - 2) + ")rotate(" + (-d.rot - ((sector - 4) * 20)) + ")");
            }
            else {
                this.zoomBox
                    .transition().duration(transitionDuration)
                    .attr("transform", "rotate(" + (-sector * 20) + ")");
            }

            this.detectors.classed("not-selected", d => d.sector != sector);
        }
        else {
            if (this.config.rotate) {
                this.rotatingContainer
                    .transition().duration(transitionDuration)
                    .attr("transform", "rotate(0)");

                this.sectorNumbers
                    .transition().duration(transitionDuration)
                    .attr("transform", d => "rotate(" + (-sectorToRotationAngle(d)) + ")");

                this.layerNumbers
                    .transition().duration(transitionDuration)
                    .attr("transform", d => "translate(0," + yscale(d.minLocalY - 2) + ")rotate(" + (-d.rot) + ")");
            }
            else {
                this.zoomBox
                    .transition().duration(transitionDuration)
                    .attr("transform", "rotate(" + (-4 * 20) + ")");
            }

            this.trackletPlanes.selectAll(".tracklet-plane")
                .classed("selected", false)
                .classed("not-selected", false);

            this.detectors.classed("not-selected", false);
        }
    }
}