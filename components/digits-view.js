const padw = 4, padh = 5;

class DigitsViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), `0 0 ${width} ${height}`);

        this.eventInput = d3.select(config.eventInput).node();
        this.sectorInput = d3.select(config.sectorInput).node();
        this.stackInput = d3.select(config.stackInput).node();

        if (config != null && config.padClick != null)
            this.padClick = config.padClick;

        this.buttons = [];

        for (const input of config.buttons) {
            this.buttons.push(d3.select(input).on("click", this.drawDigits.bind(this)));
        }

        this.dataLoadUrl = config.dataLoadUrl;

        this.container.attr("class", "digits-view");

        const yband = this.yband = d3.scaleBand().domain(d3.range(16))
            .range([0, this.componentHeight - 70])
            .paddingInner(0.2);

        this.sumGroup = this.container.append("g")
            .attr("transform", `translate(30, 30)`);

        this.graphGroup = this.container.append("g")
            .attr("transform", `translate(650, 30)`);

        this.sumGroup.append("text").text("Layers").attr("transform", "translate(300, -10)");

        this.graphGroup.append("text").text("Pad Rows").attr("transform", "translate(150, -10)");

        this.sumGroup.append("g").attr("class", "layer-numbers")
            .selectAll("text")
            .data(d3.range(6))
            .enter()
            .append("text")
            .text(d => d)
            .attr("transform", d => `translate(-20, ${(5 - d) * padh * 19 + 9 * padh})`);

        this.selectGroup = this.sumGroup.append("g").attr("class", "selection-rects");

        this.rowSelect = this.selectGroup.append("rect").attr("class", "row-select");
        this.colSelect = this.selectGroup.append("rect").attr("class", "col-select");

        this.graphGroup.append("g").attr("class", "row-numbers")
            .selectAll("text")
            .data(d3.range(16))
            .enter()
            .append("text")
            .text(d => d)
            .attr("transform", d => `translate(0, ${yband(d) + yband.bandwidth() / 2})`);
    }

    draw(eventData) {
        if (eventData != null && eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null && eventData.trdTrack.trdTracklets.length > 0) {
            if (eventData.type == "select") {
                const tracklet = eventData.trdTrack.trdTracklets[0];

                this.eventInput.value = eventData.event.evno;
                this.sectorInput.value = tracklet.sector;
                this.stackInput.value = tracklet.stack;

                this.drawDigits();
            }
        }
        else {
            this.eventInput.value = 0;
            this.sectorInput.value = 0;
            this.stackInput.value = 0;
        }
    }

    async drawDigits() {
        const eventNo = this.eventInput.value;
        const sector = this.sectorInput.value;
        const stack = this.stackInput.value;

        try {
            console.log(`Loading digits for Event: ${eventNo} Sector: ${sector} Stack ${stack}: ${this.dataLoadUrl}${eventNo}.${sector}.${stack}.json`);
            const data = await d3.json(`${this.dataLoadUrl}${eventNo}.${sector}.${stack}.json`);
            console.log(data);

            const allLayers = this.sumGroup.selectAll("g.layer")
                .data(data.layers, d => d.det);

            const newLayers = allLayers.enter().append("g")
                .attr("class", "layer")
                .on("mouseleave", (d, i, nodes) => {
                    const row = d3.select(nodes[i]).select("rect.row-highlight").style("visibility", "hidden");

                    const col = d3.select(nodes[i]).select("rect.col-highlight").style("visibility", "hidden");
                })
                .on("mouseenter", this.drawPadRows.bind(this));

            newLayers
                .append("rect")
                .attr("class", "pad-background")
                .attr("x", -2)
                .attr("y", -2)
                .attr("width", padw * 144 + 4).attr("height", padh * 16 + 4);

            allLayers.exit().remove();

            const allPads = this.sumGroup
                .selectAll("g.layer")
                .attr("transform", d => `translate(0, ${(5 - d.layer) * padh * 19})`)
                .selectAll("rect.pad-sum")
                .data(d => d.pads, d => d.row * 144 + d.col);

            allPads.exit().remove();

            allPads.enter()
                .append("rect")
                .attr("class", "pad-sum")
                .attr("x", d => d.col * padw + 1)
                .attr("y", d => d.row * padh + 1)
                .attr("width", padw - 1)
                .attr("height", padh - 1)
                .on("mouseenter", (d, i, nodes) => {
                    const row = d3.select(nodes[i].parentNode).select("rect.row-highlight").style("visibility", "visible");
                    row.attr("y", d.row * padh - 1);

                    const col = d3.select(nodes[i].parentNode).select("rect.col-highlight").style("visibility", "visible");
                    col.attr("x", d.col * padw - 1);
                })
                .on("click", (d, i, nodes) => {
                    if (this.padClick != null)
                        this.padClick({
                            data: nodes[i].parentNode.__data__,
                            pos: d
                        });
                });

            const colourMap = new Map();
            for (const layer of data.layers) {
                colourMap.set(layer.layer, d3.scaleSequential(d3.interpolateGreys).domain([0, layer.maxtsum]));
            }

            this.sumGroup.selectAll("rect.pad-sum")
                .style("fill", d => colourMap.get(d.layer)(d.tsum));

            newLayers.append("rect").attr("class", "row-highlight").style("visibility", "hidden").attr("x", -1).attr("width", padw * 144 + 2).attr("y", -1).attr("height", padh + 2);
            newLayers.append("rect").attr("class", "col-highlight").style("visibility", "hidden").attr("x", -1).attr("width", padw + 2).attr("y", -1).attr("height", padh * 16 + 2);
        }
        catch (err) {
            console.error(err);
        }
    }

    drawPadRows(d) {
        const rows = d3.range(16).map(d => ({
            row: d,
            pads: []
        }));

        for (const pad of d.pads) {
            pad.y
            rows[pad.row].pads.push(pad);
        }

        const yband = this.yband;

        const xscale = d3.scaleLinear().domain([0, 144]).range([20, 300]);

        const line = d3.line().x(d => xscale(d.col)).y(d => d.yscale(d.tsum));

        for (const row of rows) {
            row.pads.sort((a, b) => a.col - b.col);
            row.yscale = d3.scaleLinear()
                .domain([0, 10000])
                .range([yband(row.row) + yband.bandwidth(), yband(row.row)]);

            row.line = d3.line().x(d => xscale(d.col)).y(d => row.yscale(d.tsum));
        }

        this.graphGroup
            .selectAll("g.pad-row")
            .remove();

        this.graphGroup
            .selectAll("g.pad-row")
            .data(rows, d => d.row)
            .enter()
            .append("g")
            .attr("class", "pad-row")
            .append("path")
            .attr("class", "pad-row");

        this.graphGroup.selectAll("path.pad-row")
            .attr("d", d => d.line(d.pads));
    }
}