class SuperModuleComponent extends ComponentBase {
    constructor (id, width, height, margin) {
        super(id, width, height, margin);

        const layerData = this.layerData = getDimensions().filter(d => d.module == 2);
        this.detectorData = d3.range(18)
            .map(s => layerData.map(l => Object.assign({ sector: s, rot: -10 - 20 * s }, l)))
            .reduce((a, b) => a.concat(b));

        const xscale = this.xscale, yscale = this.yscale;

        this.detectors = this.container
            .selectAll("g.detector")
            .data(this.detectorData)
            .enter()
            .append("g")
            .attr("class", "detector")
            .attr("transform", d => "rotate(" + d.rot + ")translate(" + xscale(d.minR / 10) + ",0)");

        this.detectors
            .append("rect")
            .attr("y", d => yscale(d.minLocalY))
            .attr("height", d => dist(d.minLocalY, d.maxLocalY, yscale))
            .attr("width", d => dist(d.minR / 10, d.maxR / 10, xscale));
    }

    draw(event, selectedTrack, selectedTracklet) {
        super.draw();
    }
}