class SupermoduleZoomViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const stackDimensionData = this.stackDimensionData = getStackDimensions();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        const xscale = this.xscale, yscale = this.yscale;

        this.line = d3.line().x(d => xscale(-d.z)).y(d => yscale(d.r));
        this.line2 = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        this.container
            .attr("class", "supermodule-view-component");

        this.zoomBox = this.container.append("rect");

        this.modules = this.container
            .append("path")
            .attr("class", "module");

        this.pads = this.container
            .append("path")
            .attr("class", "pad");

        this.allTracks = this.container
            .append("path")
            .attr("class", "track");

        this.selectedTracklets = this.container
            .append("path")
            .attr("class", "tracklet selected");

        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");

        // this.stackTexts = this.container
        //     .append("g")
        //     .attr("class", "stack-texts")
        //     .selectAll("text.stack-text")
        //     .data(layerData.filter(d => d.layer == 5))
        //     .enter()
        //     .append("text")
        //     .attr("class", "stack-text")
        //     .text(d => d.stack)
        //     .attr("x", d => xscale((d.minZ + d.maxZ) / 2))
        //     .attr("y", d => yscale(d.maxR + 10));
    }

    draw(eventData) {
        const line = this.line;

        if (eventData.track != null) {
            const stack = this.stackDimensionData[eventData.track.stk];

            this.xscale.domain(stack.bbZ);
            this.yscale.domain(stack.bbR);

            const padRowDimensionData = geomStackZRPlanePads();

            const detectorPath = padRowDimensionData
                .filter(d => d.s == eventData.track.stk && d.d != null && d.d.length > 0)
                .map(d => this.line2(d.d) + " Z ")
                .join(" ");

            this.pads.attr("d", detectorPath);

            const modulePath = geomStackZRPlaneModules()
                .filter(d => d.stk == eventData.track.stk)
                .map(d => this.line2(d.d) + " Z ")
                .join(" ");

            this.modules.attr("d", modulePath);

            this.selectedTrack.attr("d", line(eventData.track.path));

            this.selectedTracklets.attr("d", eventData.track.trklts
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(d => this.line2(d.d) + " Z ")
                .join(" ")
            );
        }
        else {
            this.selectedTrack.attr("d", null);
            this.selectedTracklets.attr("d", null);
            this.detectors.attr("d", null);
            this.modules.attr("d", null);
        }
    }
}