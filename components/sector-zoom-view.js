class SectorZoomViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const layerData = this.layerData = getDimensions();
        const padRowDimensionData = this.padRowDimensionData = getPadrowDimensions();
        const moduleDimensionData = this.moduleDimensionData = getModuleDimensions();
        const stackDimensionData = this.stackDimensionData = getStackDimensions();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const minZ = d3.min(moduleDimensionData, d => d.p0.y), maxZ = d3.max(moduleDimensionData, d => d.p1.y);
        this.minZ = minZ; this.maxZ = maxZ;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-450, 450]);
        yscale.domain([-450, 450]);

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(-d.y));

        this.container
            .attr("class", "sector-view-component");

        this.zoomBox = this.container.append("rect");

        this.allTracks = this.container
            .append("path")
            .attr("class", "track");

        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");

        this.selectedTracklet = this.container
            .append("path")
            .attr("class", "tracklet selected");

        this.detectors = this.container
            .append("path")
            .attr("class", "detector");

        this.modules = this.container
            .append("path")
            .attr("class", "module");

        const modulePath = this.moduleDimensionData
            .filter(d => d.stk == 2)
            .map(this.detectorPath.bind(this))
            .join(" ");

        this.modules.attr("d", modulePath);

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

    detectorPath(d) {
        return closedRect(d.p0, d.p1, p => this.xscale(p.x), p => this.yscale(-p.y));
    }

    draw(eventData) {
        const line = this.line;

        if (eventData.track != null) {
            const stack = this.stackDimensionData[eventData.track.stk];

            // this.xscale.domain(stack.bbZ);
            // this.yscale.domain(stack.bbR);
            this.selectedTrack.attr("d", line(eventData.track.path))
                .attr("transform", `rotate(${-20 * (4 - eventData.track.sec)})`);

            this.selectedTracklet.attr("d", eventData.track.trklts.map(d => line(d.path)).join(" "))
                .attr("transform", `rotate(${-20 * (4 - eventData.track.sec)})`);
        }
        else {
            this.selectedTrack.attr("d", null);
            this.selectedTracklets.attr("d", null);
            // this.detectors.attr("d", null);
            // this.modules.attr("d", null);
        }
    }
}