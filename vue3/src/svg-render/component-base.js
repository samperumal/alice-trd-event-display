import * as d3 from "d3"

export function dist(a, b, scale) {
    return Math.abs(scale(a) - scale(b));
}

export function marginDef(left, right, top, bottom) {
    return {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
        vert: left + right,
        horiz: top + bottom
    };
}

export class ComponentBase {
    constructor(id, width, height, margin, viewBox) {
        let container = d3.select(id);

        if (container.node().tagName.toLowerCase() == "canvas") {
            container = document.getElementById(id.replace("#", ""));
            this.ctx = container.getContext("2d");
            height = container.height;
            width  = container.width;
        }

        this.height = height;
        this.width = width;

        this.margin = margin;

        this.componentWidth = width;
        this.componentHeight = height;

        this.displayWidth = width - margin.horiz;
        this.displayHeight = height - margin.vert;

        this.xscale = d3.scaleLinear()
            .domain([-400, 400])
            .range([margin.left - this.componentWidth / 2, this.componentWidth / 2 - margin.right]);

        this.yscale = d3.scaleLinear()
            .domain([-400, 400])
            .range([margin.top - this.componentHeight / 2, this.componentHeight / 2 - margin.bottom]);

        this.svg = null;
        
        if (container.node != null && container.node().tagName.toLowerCase() == "svg") {
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
