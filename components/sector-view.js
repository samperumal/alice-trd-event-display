class SectorViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(15, 15, 25, 5));

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
        yscale.domain([450, -450]);

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        this.container.append("rect")
            .attr("class", "zoom")
            .attr("width", this.displayWidth)
            .attr("height", this.displayHeight)
            .attr("transform", "translate(" + (-this.displayWidth / 2) + "," + (-this.displayHeight / 2) + ")");

        this.zoomBox = this.container
            .append("g")
            .attr("class", "zoom-box-group");

        const zoomPath = [
            [xscale(0), yscale(0)],
            [xscale(460), yscale(0)],
            rotateC(xscale(0), yscale(0), xscale(460), yscale(0), 20)
        ];

        this.zoomBox.append("path")
            .attr("class", "zoom-box")
            .attr("d", d3.line()(zoomPath) + "Z");

        this.container.append("path")
            .attr("class", "module")
            .attr("d", geomSectorXYPlane()
                .map(d => this.line(d.d) + " Z ").join(" ")
            )

        this.container.classed("sector-view-component", true);

        this.tracks = this.container.append("g")
            .attr("class", "tracks");

        this.allTracks = this.tracks
            .append("path")
            .attr("class", "track");

        this.selectedTrack = this.tracks
            .append("path")
            .attr("class", "selected track");

        this.tracklets = this.container.append("g")
            .attr("class", "tracklets");

        this.allTracklets = this.tracklets
            .append("path").attr("class", "tracklet");

        this.selectedTracklet = this.tracklets
            .append("path").attr("class", "selected tracklet");

        const doRotate = this.config.rotate;

        this.sectorNumbers = this.container
            .append("g")
            .attr("class", "sector-number");

        this.sectorNumbers
            .selectAll("text")
            .data(d3.range(18).map(d => {
                const [x, y] = rotateC(xscale(0), yscale(0), xscale(420), yscale(0), 10 + 20 * d);

                return {
                    sector: d,
                    x: x,
                    y: y
                }
            }))
            .enter()
            .append("text")
            .attr("class", "sector-number")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.sector);

        this.defs = this.svg.append("defs");

        const pc = [xscale(0), -this.componentHeight / 2 + this.margin.top / 2];
        const pr = rotateC(xscale(0), -this.componentHeight / 4, pc[0], pc[1], -25);
        const pl = rotateC(xscale(0), -this.componentHeight / 4, pc[0], pc[1], 24);

        this.defs.append("path")
            .attr("id", "sectors-text-path")
            .attr("d", `M ${pl[0]},${pl[1]} S ${pc[0]},${pc[1]} ${pr[0]},${pr[1]}`);

        this.sectorNumbers
            .append("text")
            .attr("class", "sector-number-title")
            .append("textPath")
            .attr("href", "#sectors-text-path")
            .attr("method", "stretch")
            .text("Sectors");

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
        const transitionDuration = 500;

        const selectedTrack = eventData.track != null ? eventData.track.id : null;

        if (this.selectedEventId != eventData.event.id) {
            this.selectedEventId = eventData.event.id;

            const allTrackData = eventData.event.tracks;
            this.allTracks.attr("d", eventData.event.tracks.map(d => line(d.path)).join(" "));
            this.allTracklets.attr("d", eventData.event.trklts.map(d => line(d.path)).join(" "));
        }

        if (eventData.track != null) {
            this.allTracks.classed("fade", true);
            this.allTracklets.classed("fade", true);

            this.selectedTrack.attr("d", line(eventData.track.path));
            this.selectedTracklet.attr("d", eventData.track.trklts.map(d => line(d.path)).join(" "));

            const sector = eventData.track.sec;

            if (this.config.rotate && sector != null) {
                // this.rotatingContainer
                //     .transition().duration(transitionDuration)
                //     .attr("transform", "rotate(" + ((sector - 4) * 20) + ")");

                // this.sectorNumbers
                //     .transition().duration(transitionDuration)
                //     .attr("transform", d => "rotate(" + (-sectorToRotationAngle(d) - ((sector - 4) * 20)) + ")");

                // this.layerNumbers
                //     .transition().duration(transitionDuration)
                //     .attr("transform", this.layerNumberPosition.bind(this, sector));
            }
            else {
                this.zoomBox
                    .transition().duration(transitionDuration)
                    .attr("transform", `rotate(${-sector * 20} ${xscale(0)} ${yscale(0)})`);
            }
        }
        else {
            this.allTracks.classed("fade", false);
            this.allTracklets.classed("fade", false);

            this.selectedTrack.attr("d", null);

            if (this.config.rotate) {
                // this.rotatingContainer
                //     .transition().duration(transitionDuration)
                //     .attr("transform", "rotate(0)");

                // this.sectorNumbers
                //     .transition().duration(transitionDuration)
                //     .attr("transform", d => "rotate(" + (-sectorToRotationAngle(d)) + ")");

                // this.layerNumbers
                //     .transition().duration(transitionDuration)
                //     .attr("transform", this.layerNumberPosition.bind(this, 4));
            }
            else {
                this.zoomBox
                    .transition().duration(transitionDuration)
                    .attr("transform", "rotate(" + (-4 * 20) + ")");
            }

            // this.trackletPlanes.selectAll(".tracklet-plane")
            //     .classed("selected", false)
            //     .classed("not-selected", false);

            // this.detectors.classed("not-selected", false);
        }
    }

    layerNumberPosition(sector, d) {
        return "translate(" + this.xscale(0) + "," + this.yscale(d.minLocalY - 4) + ")rotate(" + (-d.rot - ((sector - 4) * 20)) + ")";
    }
}