class SupermoduleViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const layerData = this.layerData = getDimensions();
        const padRowDimensionData = this.padRowDimensionData = getPadrowDimensions();
        const moduleDimensionData = geomStackZRPlaneModules();
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

        const modulePath = moduleDimensionData
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
            .selectAll("text.stack-text")
            .data(moduleDimensionData.filter(d => d.lyr == 5))
            .enter()
            .append("text")
            .attr("class", "stack-text")
            .text(d => d.stk)
            .attr("x", d => xscale((d.d[0].x + d.d[2].x) / 2))
            .attr("y", d => yscale(d.d[2].y + 40));

        this.container
            .append("text")
            .attr("class", "stack-text-title")
            .attr("x", 0)
            .attr("y", yscale(d3.max(moduleDimensionData, d => d.d[2].y) + 100))
            .text("Stacks");

        this.setViewBox(null, 750);
    }

    draw(eventData) {
        const line = this.line;

        if (eventData.track != null) {
            this.allTracks.attr("d", eventData.event.tracks.map(d => line(d.path)).join(" "));
            this.allTracks.classed("fade", true);
            this.selectedTrack.attr("d", line(eventData.track.path));

            const padRowDimensionData = geomStackZRPlanePads();

            this.selectedTracklets.attr("d", eventData.track.trklts
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(d => this.line2(d.d))
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