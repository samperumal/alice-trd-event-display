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

        const layerLabelWidth = 50;
        const axisMargins = { top: 5, bottom: 10, left: 20, right: 20 };
        const contentWidth = this.displayWidth - layerLabelWidth - axisMargins.left - axisMargins.right;
        const contentHeight = this.displayHeight - axisMargins.top - axisMargins.bottom;

        const layerBand = this.layerBand = d3.scaleBand().domain(d3.range(6).reverse())
            .range([axisMargins.top, contentHeight])
            .paddingInner(0.2);

        const colBand = this.colBand = d3.scaleBand().domain(d3.range(-1, 145))
            .range([axisMargins.left, contentWidth])
            .paddingInner(0);

        const rowBand = this.rowBand = d3.scaleBand().domain(d3.range(-1, 17).reverse())
            .range([axisMargins.top, layerBand.bandwidth() - axisMargins.top - axisMargins.bottom]);

        // Container for the layer/row/col digits data
        this.sumGroup = this.container.append("g").attr("class", "sum-group");

        // Create layer labels
        this.sumGroup.append("g").attr("class", "layer-labels").attr("transform", `translate(${layerLabelWidth / 2}, 0)`)
            .selectAll("text").data(layerBand.domain())
            .enter().append("text").text(d => `Layer ${d}`).attr("y", d => layerBand(d) + layerBand.bandwidth() / 2);

        // Create layer axes
        const layerAxes = this.sumGroup.append("g").attr("class", "layer-axes").attr("transform", `translate(${layerLabelWidth}, 0)`)
            .selectAll("text").data(layerBand.domain())
            .enter().append("g").attr("class", "layer-axis")
            .attr("data-layer", d => d).attr("transform", d => `translate(0, ${layerBand(d)})`);

        // Axis for pad col number
        const padColAxis = layerAxes.append("g").attr("class", "padcol-axis")
            .attr("transform", `translate(0, ${rowBand.range()[1]})`)
            .call(d3.axisBottom(colBand).tickValues(d3.range(0, 145, 4)));

        padColAxis.append("text").text("Pad Column Index").attr("class", "axis-label").style("fill", "currentColor")
            .attr("transform", `translate(${(colBand.range()[0] + colBand.range()[1]) / 2}, 30)`)

        // Axes for pad row number
        layerAxes.append("g").attr("class", "padrow-axis").attr("transform", `translate(${colBand.range()[0]}, ${0})`)
            .call(d3.axisLeft(rowBand).tickValues(d3.range(0, 16, 3)));

        const rightPadRowAxis = layerAxes.append("g").attr("class", "padrow-axis").attr("transform", `translate(${colBand.range()[1]}, ${0})`)
            .call(d3.axisRight(rowBand).tickValues(d3.range(0, 16, 3)));

        rightPadRowAxis.append("text").text("Pad Row").attr("class", "pad-row-axis-label").attr("textLength", 70)
            .attr("transform", `translate(${30}, ${(rowBand.range()[0] + rowBand.range()[1]) / 2})`);

        // Create groups for each layer
        this.padLayers = this.sumGroup.append("g").attr("class", "pad-layers").attr("transform", `translate(${layerLabelWidth}, 0)`)
            .selectAll("g.pad-layer").data(layerBand.domain())
            .enter().append("g").attr("class", "pad-layer").attr("transform", d => `translate(0, ${layerBand(d)})`);

        function rotate(d) {
            const angle = 2 * (2 * (d.r % 2) - 1); // 2 degrees, alternating by row
            const cx = colBand(d.c) + colBand.bandwidth() / 2; // x centre of rotation
            const cy = rowBand(d.r) + rowBand.bandwidth() / 2; // y centre of rotation
            return `rotate(${angle} ${cx} ${cy})`;
        }

        // Create data for pads in a layer
        function layerPads(l) {
            return d3.range(16)
                .map(r => d3.range(144).map(c => ({ l: l, r: r, c: c })))
                .reduce(ajoin)
        }

        // Create and rotate individual pads
        this.padLayers.selectAll("rect.pad-sum")
            .data(layerPads)
            .enter()
            .append("rect").attr("class", "pad-sum")
            .attr("transform", d => `${rotate(d)}translate(${colBand(d.c)}, ${rowBand(d.r)})`)
            .attr("width", colBand.bandwidth())
            .attr("height", rowBand.bandwidth());

        // Map of all pads across all layers
        const padMap = this.padMap = new Map();
        const key = this.key;

        this.padLayers.selectAll("rect.pad-sum").each((d, i, nodes) => {
            padMap.set(key(d.l, d.r, d.c), d3.select(nodes[i]));
        })
    }

    key(layer, row, col) {
        //console.log(layer, col, row);
        return `${layer}_${col}_${row}`;
        return layer * 10e7 + col * 10e5 + row;
    }

    draw(eventData) {
        if (eventData != null && eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null && eventData.trdTrack.trdTracklets.length > 0) {
            if (eventData.type == "select") {
                const tracklet = eventData.trdTrack.trdTracklets[0];

                this.eventInput.value = eventData.event.evno;
                this.sectorInput.value = tracklet.sector;
                this.stackInput.value = tracklet.stack;

                //this.drawDigits();
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

            for (const layer of data.layers) {
                const colourScale = d3.scaleSequential(d3.interpolateBuPu).domain([0, layer.maxtsum]);
                for (const pad of layer.pads) {
                    const key = this.key(layer.layer, pad.row, pad.col);
                    this.padMap.get(key).style("fill", colourScale(pad.tsum));
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}