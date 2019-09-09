class SectorZoomViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const padRowDimensionData = this.padRowDimensionData = getPadrowDimensions();
        const moduleDimensionData = this.moduleDimensionData = getModuleDimensions();
        const stackDimensionData = this.stackDimensionData = getStackDimensions();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain(getSectorDimensions().bbX);
        yscale.domain(getSectorDimensions().bbY);

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        this.container
            .attr("class", "sector-view-component");

        this.zoomBox = this.container.append("rect");

        this.pads = this.container
            .append("path")
            .attr("class", "pad")
            .attr("display", "none")
            .attr("d", geomZoomSectorXYPlanePads()
                .map(d => this.line(d.d) + " Z ").join(" ")
            );

        this.modules = this.container
            .append("path")
            .attr("class", "module")
            .attr("display", "none")
            .attr("d", geomZoomSectorXYPlaneModules()
                .map(d => this.line(d.d) + " Z ").join(" ")
            );

        this.otherTracks = this.container
            .append("path")
            .attr("class", "other track");
        
        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");

        this.otherTracklets = this.container
            .append("path")
            .attr("class", "tracklet zoom other");

        this.matchedTracklets = this.container
            .append("path")
            .attr("class", "tracklet zoom matched");

        this.selectedTracklet = this.container
            .append("path")
            .attr("class", "tracklet zoom selected");

        this.stackText = this.container
            .append("text")
            .attr("class", "sector-number")
            .attr("x", 0)
            .attr("y", -this.displayHeight / 2 + this.margin.top * 3)
            .text("No track selected");
    }

    draw(eventData) {
        function rotateToSector(path, sector) {
            return path.map(d => {
                const rot = rotate(d.x, d.y, -20 * (4 - sector));
                return { x: rot[0], y: rot[1] };
            });
        }

        const line = this.line;

        if (eventData.track != null) {
            const track = eventData.track;

            this.selectedTrack.attr("d", line(rotateToSector(eventData.track.path, track.sec)));
            const filteredOtherTracks = eventData.event.tracks.filter(d => d.typ == "Trd" && d.id != track.id && d.sec == track.sec && d.stk == track.stk); 
            this.otherTracks.attr("d", filteredOtherTracks.map(d => line(rotateToSector(d.path, d.sec))));

            this.selectedTracklet.attr("d", track.trklts.map(d => line(rotateToSector(d.path, track.sec))).join(" "));

            const otherTracklets = eventData.event.trklts.filter(t => t.stk == track.stk && t.sec == track.sec);

            this.otherTracklets.attr("d", otherTracklets.filter(d => d.trk == null).map(d => line(rotateToSector(d.path, track.sec))).join(" "));
            this.matchedTracklets.attr("d", otherTracklets.filter(d => d.trk != null).map(d => line(rotateToSector(d.path, track.sec))).join(" "));

            this.modules.attr("display", "default");
            this.pads.attr("display", "default");

            this.stackText.text(`Sector ${eventData.track.sec}`);
        }
        else {
            this.selectedTrack.attr("d", null);
            this.otherTracks.attr("d", null);
            this.selectedTracklet.attr("d", null);
            this.matchedTracklets.attr("d", null);
            this.otherTracklets.attr("d", null);

            this.modules.attr("display", "none");
            this.pads.attr("display", "none");

            this.stackText.text("No track selected");
        }
    }
}