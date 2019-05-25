class SectorViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5));

        const sectorToRotationAngle = this.sectorToRotationAngle;

        const layerData = this.layerData = getDimensions().filter(d => d.stack == 2);
        this.detectorData = d3.range(18)
            .map(s => layerData.map(l => Object.assign({ sector: s, rot: sectorToRotationAngle(s) }, l)))
            .reduce((a, b) => a.concat(b));

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

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
            .attr("transform", "translate(" + (-this.displayWidth / 2) + "," + (-this.displayHeight / 2) + ")")
            //.call(zoom)
            ;

        this.rotatingContainer = this.container
            .classed("sector-view-component", true)
            .append("g")
            .attr("class", "rotating")
            ;

        this.detectors = this.rotatingContainer
            .append("g")
            .attr("class", "detectors")
            .selectAll("g.detector")
            .data(this.detectorData)
            .enter()
            .append("g")
            .attr("class", "detector")
            .attr("transform", d => "rotate(" + d.rot + ")translate(" + xscale(d.minR) + ",0)");

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
            .attr("x1", xscale(0))
            .attr("x2", d => xscale(d.maxR))
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

        this.zoomBox = this.container
            .append("g")
            .attr("class", "zoom-box")
            .attr("transform", "rotate(-80)");
            
        this.zoomBox.append("line")
            .attr("class", "zoom-box")
            .attr("x1", xscale(0)).attr("y1", yscale(0))
            .attr("x2", xscale.range()[1]).attr("y2", yscale(0));

        this.zoomBox.append("line")
            .attr("class", "zoom-box")
            .attr("transform", "rotate(-20)")
            .attr("x1", xscale(0)).attr("y1", yscale(0))
            .attr("x2", xscale.range()[1]).attr("y2", yscale(0));

        this.tracklets = this.rotatingContainer.append("g")
            .attr("class", "tracklets");

        this.tracks = this.rotatingContainer.append("g")
            .attr("class", "tracks");

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

        const sectorToRotationAngle = this.sectorToRotationAngle;
        const transitionDuration = 750;

        if (eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null) {
            let tracklets = this.tracklets
                .selectAll(".tracklet")
                .data(eventData.trdTrack.trdTracklets, d => d.id);

            tracklets.exit().remove();

            tracklets.enter()
                .append("g")
                .attr("transform", d => "rotate(" + (sectorToRotationAngle(d.sector)) + ")")
                .append("circle")
                .attr("class", "tracklet")
                .attr("cy", d => yscale(-d.localY))
                .attr("cx", d => xscale(layerData[d.layer].midR))
                .attr("r", this.r);

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

            this.tracklets
                .selectAll(".tracklet")
                .remove();

            this.detectors.classed("not-selected", false);
        }
    }
}