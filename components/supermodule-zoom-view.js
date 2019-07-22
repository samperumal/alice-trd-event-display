class SupermoduleZoomViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const stackDimensionData = this.stackDimensionData = getStackDimensions();

        const padData = geomStackZRPlanePads().filter(d => d.d != null && d.d.length > 0);
        const moduleData = geomStackZRPlaneModules();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        const xscale = this.xscale, yscale = this.yscale;

        this.line = d3.line().x(d => xscale(-d.z)).y(d => yscale(d.r));
        this.line2 = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        // Create map of paths per stack, for efficiency
        this.stackPaths = new Map();

        for (const stack in d3.range(5)) {
            const stackbb = this.stackDimensionData[stack];

            this.xscale.domain(stackbb.bbZ);
            this.yscale.domain(stackbb.bbR);

            const modulePath = moduleData
                .filter(d => d.stk == stack)
                .map(d => this.line2(d.d) + " Z ")
                .join(" ");

            const padPath = padData
                .filter(d => d.s == stack && d.d != null && d.d.length > 0)
                .map(d => this.line2(d.d) + " Z ")
                .join(" ");

            this.stackPaths.set(+stack, {
                modulePath: modulePath,
                padPath: padPath
            });
        }

        // Create elements
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

        this.stackText = this.container
            .append("text")
            .attr("class", "stack-number")
            .attr("x", 0)
            .attr("y", -this.displayHeight / 2 + this.margin.top * 3)
            .text("No track selected");
    }

    draw(eventData) {
        const line = this.line;

        if (eventData.track != null) {
            const stackbb = this.stackDimensionData[eventData.track.stk];

            this.xscale.domain(stackbb.bbZ);
            this.yscale.domain(stackbb.bbR);

            this.pads.attr("d", this.stackPaths.get(eventData.track.stk).padPath);

            this.modules.attr("d", this.stackPaths.get(eventData.track.stk).modulePath);

            this.selectedTrack.attr("d", line(eventData.track.path));

            const padRowDimensionData = geomStackZRPlanePads();

            this.selectedTracklets.attr("d", eventData.track.trklts
                .map(d => padRowDimensionData[rid(d.stk, d.lyr, d.row)])
                .map(d => this.line2(d.d) + " Z ")
                .join(" ")
            );

            this.stackText.text(`Stack ${eventData.track.stk}`);
        }
        else {
            this.selectedTrack.attr("d", null);
            this.selectedTracklets.attr("d", null);

            this.pads.attr("d", null);
            this.modules.attr("d", null);

            this.stackText.text("No track selected");
        }
    }
}