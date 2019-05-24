function dist(a, b, scale) {
    return Math.abs(scale(a) - scale(b));
}

function marginDef(left, right, top, bottom) {
    return {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
        vert: left + right,
        horiz: top + bottom
    };
}

class ComponentBase {
    constructor(id, width, height, margin, viewBox) {
        this.height = height;
        this.width = width;

        this.margin = margin;

        this.componentWidth = width;
        this.componentHeight = height;

        this.displayWidth = width - margin.horiz;
        this.displayHeight = height - margin.vert;

        this.xscale = d3.scaleLinear()
            .domain([-400, 400])
            .range([-this.displayWidth / 2, this.displayWidth / 2]);

        this.yscale = d3.scaleLinear()
            .domain([-400, 400])
            .range([-this.displayHeight / 2, this.displayHeight / 2]);

        let container = d3.select(id);

        this.svg = null;
        
        if (container.node().tagName == "svg") {
            this.svg = container;
            if (viewBox == null)
                container.attr("viewBox", (-this.componentWidth / 2) + " " + (-this.componentHeight / 2) + " " + (this.componentWidth) + " " + (this.componentHeight));
            else container.attr("viewBox", viewBox);
            container = container.append("g").attr("class", "content");
        }

        this.container = container;
    }

    transitionViewBox(viewBox, duration) {
        this.svg    
            .transition().duration(duration)
            .attr("viewBox", viewBox);
    }

    draw(event, selectedTrack, selectedTracklet) {
        this.container.selectAll("rect.default").remove();

        this.container.append("rect")        
            .attr("class", "default")
            .attr("x", (-this.componentWidth / 2))
            .attr("y", (-this.componentHeight / 2))
            .attr("width", this.componentWidth)
            .attr("height", this.componentHeight)
            .attr("fill", "none")
            .attr("stroke", "black");

        this.container.append("rect")        
            .attr("class", "default")
            .attr("x", this.xscale.range()[0])
            .attr("y", this.yscale.range()[0])
            .attr("width", Math.abs(this.xscale.range()[1] - this.xscale.range()[0]))
            .attr("height", Math.abs(this.yscale.range()[1] - this.yscale.range()[0]))
            .attr("fill", "none")
            .attr("stroke", "black");
    }
}
