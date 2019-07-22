class SupermoduleViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const layerData = this.layerData = getDimensions();
        const padRowDimensionData = this.padRowDimensionData = getPadrowDimensions();
        const moduleDimensionData = this.moduleDimensionData = getModuleDimensions();
        const stackDimensionData = this.stackDimensionData = getStackDimensions();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-370, 370]);
        yscale.domain([600, -140]);

        this.line = d3.line().x(d => xscale(-d.z)).y(d => yscale(d.r));
        this.line2 = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        this.container
            .attr("class", "supermodule-view-component");

        this.zoomBox = this.container.append("rect");

        this.allTracks = this.container
            .append("path")
            .attr("class", "track");

        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");

        this.selectedTracklets = this.container
            .append("path")
            .attr("class", "tracklet selected");

        // const detectorPath = padRowDimensionData
        //     .filter(d => d.use)
        //     .map(this.detectorPath.bind(this))
        //     .join(" ");

        // this.detectors = this.container
        //     .append("path")
        //     .attr("class", "detector")
        //     .attr("d", detectorPath);

        const modulePath = geomStackZRPlaneModules()
            .map(d => this.line2(d.d) + " Z ")
            .join(" ");

        this.modules = this.container
            .append("path")
            .attr("class", "module")
            .attr("d", modulePath);

        const padPath = geomStackZRPlanePads()
            .filter(d => d.d != null && d.d.length > 0)
            .map(d => this.line2(d.d) + " Z ")
            .join(" ");

        this.pads = this.container
            .append("path")
            .attr("class", "pad")
            .attr("d", padPath);        

        this.stackTexts = this.container
            .append("g")
            .attr("class", "stack-texts")
            .selectAll("text.stack-text")
            .data(layerData.filter(d => d.layer == 5))
            .enter()
            .append("text")
            .attr("class", "stack-text")
            .text(d => d.stack)
            .attr("x", d => xscale((d.minZ + d.maxZ) / 2))
            .attr("y", d => yscale(d.maxR + 10));

        this.setViewBox(null, 750);
    }

    detectorPath(d) {
        return closedRect(d.p0, d.p1, p => this.xscale(p.z), p => this.yscale(p.r));
    }

    draw(eventData) {
        const line = this.line;

        if (eventData.track != null) {
            this.allTracks.attr("d", eventData.event.tracks.map(d => line(d.path)).join(" "));
            this.allTracks.classed("fade", true);
            this.selectedTrack.attr("d", line(eventData.track.path));

            const padRowDimensionData = this.padRowDimensionData;

            this.selectedTracklets.attr("d", eventData.track.trklts
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(this.detectorPath.bind(this))
                .join(" ")
            );

            this.setViewBox(this.stackDimensionData[eventData.track.stk]);
        }
        else {
            this.allTracks.classed("fade", false);
            this.selectedTrack.attr("d", null);
            this.selectedTracklets.attr("d", null);

            this.setViewBox();
        }
    }

    setViewBox(dim, transitionDuration) {
        let zoomBoxClass = "zoom-box ";
        if (dim == null) {
            zoomBoxClass += "hidden";
            this.zoomBox
                .attr("class", zoomBoxClass);
        }
        else {

            if (transitionDuration == null)
                transitionDuration = 500;

            const xscale = this.xscale, yscale = this.yscale;

            this.zoomBox
                .transition().duration(transitionDuration)
                .attr("class", zoomBoxClass)
                .attr("x", xscale(dim.bbZ[0]))
                .attr("y", yscale(dim.bbR[0]))
                .attr("width", dist(dim.bbZ[0], dim.bbZ[1], xscale))
                .attr("height", dist(dim.bbR[0], dim.bbR[1], yscale));
        }
    }
}