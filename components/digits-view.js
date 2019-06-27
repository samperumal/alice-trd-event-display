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
        const axisMargins = { top: 5, bottom: 10, left: 20, right: 10 };
        const contentWidth = this.displayWidth - layerLabelWidth - axisMargins.left - axisMargins.right;
        const contentHeight = this.displayHeight - axisMargins.top - axisMargins.bottom;

        const layerBand = this.layerBand = d3.scaleBand().domain(d3.range(1).reverse())
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
        layerAxes.append("g").attr("class", "padcol-axis").attr("transform", `translate(0, ${rowBand.range()[1]})`)
            .call(d3.axisBottom(colBand).tickValues(d3.range(0, 145, 4)));

        // Axes for pad row number
        layerAxes.append("g").attr("class", "padrow-axis").attr("transform", `translate(${colBand.range()[0]}, ${0})`)
            .call(d3.axisLeft(rowBand).tickValues(d3.range(0, 16, 3)));

        layerAxes.append("g").attr("class", "padrow-axis").attr("transform", `translate(${colBand.range()[1]}, ${0})`)
            .call(d3.axisRight(rowBand).tickValues(d3.range(0, 16, 3)));

        this.padLayers = this.sumGroup.append("g").attr("class", "pad-layers").attr("transform", `translate(${layerLabelWidth}, 0)`)
            .selectAll("g.pad-layer").data([0])//layerBand.domain())
            .enter().append("g").attr("class", "pad-layer").attr("transform", d => `translate(0, ${layerBand(d)})`);

        const testData = d3.range(16).map(r => d3.range(40).map(c => ({ r: r, c: c }))).reduce(ajoin);
        console.log(testData);

        function rotate(d) {
            return `rotate(${2 *(2 * (d.r % 2) - 1)} ${colBand(d.c) + colBand.bandwidth() / 2} ${rowBand(d.r) + rowBand.bandwidth() / 2})`;
        }

        // Create and rotate individual pads
        this.padLayers.selectAll("rect.pad-sum").data(testData).enter()
            .append("rect").attr("class", "pad-sum")
            .attr("transform", d => `${rotate(d)}translate(${colBand(d.c)}, ${rowBand(d.r)})`)
            .attr("width", colBand.bandwidth())
            .attr("height", rowBand.bandwidth());

        
        this.padLayers.append("rect").attr("class", "pad-sum")
            .attr("width", colBand.bandwidth()).attr("height", Math.abs(rowBand(0) - rowBand(15) + rowBand.bandwidth()))
            .attr("transform", `rotate(2 ${colBand(4) + colBand.bandwidth() / 2} ${(rowBand.range()[0] + rowBand.range()[1]) / 2})translate(${colBand(4)}, ${rowBand(15)})`).style("stroke", "red");

        this.padLayers.append("rect").attr("class", "pad-sum")
            .attr("width", colBand.bandwidth()).attr("height", Math.abs(rowBand(0) - rowBand(15) + rowBand.bandwidth()))
            .attr("transform", `translate(${colBand(4)}, ${rowBand(15)})`).style("stroke", "orange");
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
            console.log(data);

            const allLayers = this.sumGroup.selectAll("g.layer")
                .data(data.layers, d => d.det);

            const newLayers = allLayers.enter().append("g")
                .attr("class", "layer");

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
                .attr("height", padh - 1);

            const colourMap = new Map();
            for (const layer of data.layers) {
                colourMap.set(layer.layer, d3.scaleSequential(d3.interpolateGreys).domain([0, layer.maxtsum]));
            }

            this.sumGroup.selectAll("rect.pad-sum")
                .style("fill", d => colourMap.get(d.layer)(d.tsum));
        }
        catch (err) {
            console.error(err);
        }
    }
}