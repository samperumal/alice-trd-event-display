class SupermoduleViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), viewBox);

        const layerData = this.layerData = getDimensions();
        const padRowDimensionData = this.padRowData = getPadrowDimensions();
        const moduleDimensionData = getModuleDimensions();

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-350, 350]);
        yscale.domain([400, 0]);

        this.line = d3.line().x(d => xscale(-d.z)).y(d => yscale(d.r));

        this.container
            .attr("class", "supermodule-view-component");

        this.zoomBox = this.container.append("rect");        

        this.allTracks = this.container
            .append("path")
            .attr("class", "track");

        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");        

        this.tracklets = this.container
            .append("path")
            .attr("class", "tracklet");

        const detectorPath = padRowDimensionData
            .filter(d => d.use)
            .map(d => closedRect(d.p0, d.p1, p => xscale(p.z), p => yscale(p.y)))
            .join(" ");

        this.detectors = this.container
            .append("path")
            .attr("class", "detector")
            .attr("d", detectorPath);

        const modulePath = moduleDimensionData
            .map(d => closedRect(d.p0, d.p1, p => xscale(p.z), p => yscale(p.y)))
            .join(" ");

        this.modules = this.container
            .append("path")
            .attr("class", "module")
            .attr("d", modulePath);

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

    draw(eventData) {
        const xscale = this.xscale, yscale = this.yscale;
        const line = this.line;
        const layerData = this.layerData;

        const selectedTrack = eventData.trdTrack != null ? eventData.trdTrack.id : null;

        if (this.selectedEventId != eventData.event.id) {
            this.selectedEventId = eventData.event.id;
            
            this.allTracks.attr("d", eventData.event.tracks.map(d => line(d.path)).join(" "));

            // let trackletPlanes = this.tracklets
            //     .selectAll("rect.tracklet")
            //     .data(eventData.event.trdTracklets, d => d.id);

            // trackletPlanes.exit().remove();

            // trackletPlanes.enter()
            //     .append("rect")
            //     .attr("class", "tracklet")
            //     .attr("data-trackletid", d => d.id)
            //     .attr("x", d => xscale(d.layerDim.minZ + d.binZ * d.layerDim.zsize))
            //     .attr("y", d => yscale(d.layerDim.maxR))
            //     .attr("width", d => xscale(d.layerDim.zsize))
            //     //.attr("height", d => Math.abs(yscale(d.layerDim.maxR) - yscale(d.layerDim.minR)));
        }

        // this.detectors
        //     .classed("not-selected", d => eventData.track != null && d.stack != eventData.track.stk);

        if (eventData.track != null) {
            this.allTracks.classed("fade", true);
            this.selectedTrack.attr("d", line(eventData.track.path));
            
            // const trackletIds = eventData.trdTrack.trdTracklets.map(d => d.id);
            // this.tracklets.selectAll("rect.tracklet")
            //     .classed("not-selected", d => !trackletIds.includes(d.id))
            //     .classed("selected", d => trackletIds.includes(d.id));

            // this.tracklets.selectAll("rect.tracklet.selected").raise();

            this.setViewBox(eventData.track.stk);
        }
        else {
            this.allTracks.classed("fade", false);
            this.selectedTrack.attr("d", null);
            
            this.setViewBox();

            // this.tracklets.selectAll("rect.tracklet")
            //     .classed("not-selected", d => false)
            //     .classed("selected", d => false);
        }
    }

    setViewBox(stack, transitionDuration) {
        let zoomBoxClass = "zoom-box ";
        if (stack == null) {
            stack = 2;
            zoomBoxClass += "hidden";
        }

        if (transitionDuration == null)
            transitionDuration = 750;

        const xscale = this.xscale, yscale = this.yscale;

        const thisStack = this.layerData.filter(d => d.stack == stack);
        const minZ = d3.min(thisStack, d => d.minZ), maxZ = d3.max(thisStack, d => d.maxZ);
        const minR = d3.min(thisStack, d => d.minR) * 0.9;

        if (this.config.zoom) {
            this.svg
                .transition().duration(transitionDuration)
                .attr("viewBox", (xscale(minZ)) + " " + (yscale.range()[0]) + " " + (dist(minZ, maxZ, xscale)) + " " + (dist(yscale.domain()[0], minR, yscale)));
        }
        else this.zoomBox
            .transition().duration(transitionDuration)
            .attr("class", zoomBoxClass)
            .attr("x", xscale(minZ))
            .attr("y", yscale.range()[0])
            .attr("width", (dist(minZ, maxZ, xscale)))
            .attr("height", dist(yscale.domain()[0], minR, yscale));
    }
}