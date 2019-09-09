class SupermoduleZoomViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const stackDimensionData = this.stackDimensionData = getStackDimensions();

        const padData = geomStackZRPlanePads().filter(d => d.d != null && d.d.length > 0);
        const moduleData = geomStackZRPlaneModules();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        const xscale = this.xscale, yscale = this.yscale;

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        // Create map of paths per stack, for efficiency
        this.stackPaths = new Map();

        for (const stack in d3.range(5)) {
            const stackbb = this.stackDimensionData[stack];

            this.xscale.domain(stackbb.bbZ);
            this.yscale.domain(stackbb.bbR);

            const modulePath = moduleData
                .filter(d => d.stk == stack)
                .map(d => this.line(d.d) + " Z ")
                .join(" ");

            const padPath = padData
                .filter(d => d.s == stack && d.d != null && d.d.length > 0)
                .map(d => this.line(d.d) + " Z ")
                .join(" ");

            this.stackPaths.set(+stack, {
                modulePath: modulePath,
                padPath: padPath
            });
        }

        // Create elements
        this.container
            .attr("class", "supermodule-view-component");

        this.pads = this.container
            .append("path")
            .attr("class", "pad");

        this.otherTracklets = this.container
            .append("path")
            .attr("class", "tracklet other");

        this.matchedTracklets = this.container
            .append("path")
            .attr("class", "tracklet matched");

        this.selectedTracklets = this.container
            .append("path")
            .attr("class", "tracklet selected");

        this.modules = this.container
            .append("path")
            .attr("class", "module");

        this.otherTracks = this.container
            .append("path")
            .attr("class", "other track");
        
        this.zoomBox = this.container.append("rect");

        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");

        this.stackText = this.container
            .append("text")
            .attr("class", "stack-number")
            .attr("x", 0)
            .attr("y", -this.displayHeight / 2 + this.margin.top * 3)
            .text("No track selected");
    }

    draw(eventData) {
        function rotateToSector(track) {
            const sector = track.sec;
            return track.path.map(d => {
                const rot = rotate(d.x, d.y, -20 * (4 - sector));
                return { x: -d.z, y: rot[1] };
            });
        }

        const line = this.line;

        if (eventData.track != null) {
            const track = eventData.track;

            const stackbb = this.stackDimensionData[track.stk];

            this.xscale.domain(stackbb.bbZ);
            this.yscale.domain(stackbb.bbR);

            this.pads.attr("d", this.stackPaths.get(track.stk).padPath);

            this.modules.attr("d", this.stackPaths.get(track.stk).modulePath);

            this.selectedTrack.attr("d", line(rotateToSector(track)));

            const filteredOtherTracks = eventData.event.tracks.filter(d => d.typ == "Trd" && d.id != track.id && d.sec == track.sec && d.stk == track.stk); 
            this.otherTracks.attr("d", filteredOtherTracks.map(d => line(rotateToSector(d))));

            const padRowDimensionData = geomStackZRPlanePads();

            this.selectedTracklets.attr("d", track.trklts
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(d => this.line(d.d) + " Z ")
                .join(" ")
            );

            const otherTracklets = eventData.event.trklts.filter(t => t.stk == track.stk && t.sec == track.sec);

            this.otherTracklets.attr("d", otherTracklets
                .filter(d => d.trk == null)    
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(d => this.line(d.d) + " Z ")
                .join(" ")
            );

            this.matchedTracklets.attr("d", otherTracklets
                .filter(d => d.trk != null)    
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(d => this.line(d.d) + " Z ")
                .join(" ")
            );

            this.stackText.text(`Sector ${eventData.track.sec}, Stack ${eventData.track.stk}`);
        }
        else {
            this.selectedTrack.attr("d", null);
            this.otherTracks.attr("d", null);
            this.selectedTracklets.attr("d", null);
            this.matchedTracklets.attr("d", null);
            this.otherTracklets.attr("d", null);

            this.pads.attr("d", null);
            this.modules.attr("d", null);

            this.stackText.text("No track selected");
        }
    }
}