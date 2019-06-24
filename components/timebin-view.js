class TimebinViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), `0 0 ${width} ${height}`);

        this.container.classed("time-bin-view", true);

        this.dimensions = getDimensions();

        this.dataLoadUrl = config.dataLoadUrl;

        this.splitXBand = d3.scaleBand().domain(d3.range(2))
            .range([this.margin.left, this.margin.left + this.displayWidth])
            .paddingInner(0.2);

        this.splitYBand = d3.scaleBand().domain(d3.range(6))
            .range([this.margin.top, this.margin.top + this.displayHeight])
            .paddingInner(0.15).paddingOuter(0.15);

        this.groupSpacing = 0;
        this.tbsumGroupWidth = this.splitXBand.bandwidth();
        this.padGroupWidth = this.splitXBand.bandwidth();
        this.layerGroupHeight = this.splitYBand.bandwidth();

        this.layerGroups = [];
        this.tbsumSubViews = [];
        this.padSubViews = [];

        this.colourScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 100]);

        const midColour = this.colourScale(65);

        this.gradient = this.svg.append('defs')
            .raise()
            .append('linearGradient')
            .attr('id', 'gradient')
            .attr('x1', '0%') // bottom
            .attr('y1', '100%')
            .attr('x2', '0%') // to top
            .attr('y2', '0%')
            .attr('spreadMethod', 'pad');

        for (let i =0; i <= 100; i += 10) {
            this.gradient.append('stop')
                .attr('offset', `${i}%`)
                .attr('stop-color', this.colourScale(i))
                .attr('stop-opacity', 1);
        }

        for (const layer of d3.range(6)) {
            const layerGroup = this.container.append("g")
                .attr("transform", `translate(0, ${this.splitYBand(5 - layer)})`);

            this.layerGroups.push(layerGroup);

            const tbsumGroup = layerGroup.append("g").attr("class", "tbsum-group")
                .attr("transform", `translate(${this.splitXBand(0)}, 0)`);

            tbsumGroup.append("text").text(`Time-bin sums - Layer ${layer}`).attr("class", "panel-label")
                .attr("x", this.splitXBand.bandwidth() / 2);

            this.tbsumSubViews.push(new TbsumSubView(this.tbsumGroupWidth, this.layerGroupHeight, tbsumGroup));

            const padGroup = layerGroup.append("g").attr("class", "pad-group")
                .attr("transform", `translate(${this.splitXBand(1)}, 0)`);

            padGroup.append("text").text(`Time-bin ADC counts - Layer ${layer}`).attr("class", "panel-label")
                .attr("x", this.splitXBand.bandwidth() / 2);

            this.padSubViews.push(new PadSubView(this.padGroupWidth, this.layerGroupHeight, padGroup, midColour));
        }
    }

    draw(eventData) {
        if (eventData.type == "select" && eventData.trdTrack != null) {
            this.drawDigits(eventData);
        }
    }

    async drawDigits(eventData) {
        const eventNo = eventData.event.evno;
        const sector = eventData.trdTrack.sector;
        const stack = eventData.trdTrack.stack;

        //const layer = this.layerInput.attr("value");

        try {
            console.log(`Loading digits for Event: ${eventNo} Sector: ${sector} Stack ${stack}`);
            const data = await d3.json(`${this.dataLoadUrl}${eventNo}.${sector}.${stack}.json`);

            for (const layer of d3.range(6)) {
                const trackletData = eventData.trdTrack.trdTracklets.find(t => t.layer == layer);

                this.tbsumSubViews[layer].draw(trackletData, data.layers[layer]);
                this.padSubViews[layer].draw(trackletData, data.layers[layer], this.colourScale);
            }
        }
        catch (err) {
            console.error(err);
        }
    }
}

class TbsumSubView {
    constructor(width, height, tbsumContainer) {
        this.tbsumContainer = tbsumContainer;
        this.width = width;
        this.height = height;

        this.dimensions = getDimensions();

        this.yscale = d3.scaleBand().domain(d3.range(30)).range([20, height - 20]).paddingInner(0.2).paddingOuter(0.2);

        this.xscale = d3.scaleLinear().domain([1000, 0]).range([20, width - 20]);

        this.yaxis = this.tbsumContainer.append("g").attr("class", "y-axis")
            .attr("transform", "translate(20, 0)")
            .call(d3.axisLeft(this.yscale).tickValues(d3.range(0, 30, 3)));

        this.xaxis = this.tbsumContainer.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - 20})`);

        this.content = this.tbsumContainer.append("g");
    }

    draw(trdTrackletData, digitsData) {
        if (trdTrackletData == null) {
            this.content.selectAll("rect.tbsum").remove();
            this.xscale.domain([256, 0]);
            this.xaxis.call(d3.axisBottom(this.xscale).ticks(5, "s"));

            return;
        }

        const layerDim = this.dimensions.filter(d => d.stack == trdTrackletData.stack && d.layer == trdTrackletData.layer)[0];

        const padMapping = d3.scaleLinear().domain([layerDim.minBinY, layerDim.maxBinY]).range([0, 143]);
        const minPad = Math.floor(padMapping(trdTrackletData.binY)) - 2;
        const maxPad = minPad + 4;
        const padIndices = d3.range(minPad, maxPad + 1);

        const pads = digitsData.pads.filter(p => p.row == trdTrackletData.binZ && padIndices.includes(p.col));

        const tbinSum = d3.range(30);
        for (const index in tbinSum)
            tbinSum[index] = 0;

        for (const pad of pads) {
            for (let i = 0; i < 30; i++)
                tbinSum[i] += pad.tbins[i];
        }

        const maxAdcCount = Math.max(d3.max(tbinSum) * 1.1, 100);

        this.xscale.domain([maxAdcCount, 0]);

        this.xaxis.call(d3.axisBottom(this.xscale).ticks(5, "s"));

        const allRects = this.content.selectAll("rect.tbsum")
            .data(tbinSum);

        allRects.exit().remove();

        const xscale = this.xscale, yscale = this.yscale;

        allRects.enter().append("rect").attr("class", "tbsum")
            .attr("y", (d, i) => yscale(i))
            .attr("height", yscale.bandwidth());

        this.content.selectAll("rect.tbsum")
            .attr("x", d => xscale(d))
            .attr("width", d => xscale(0) - xscale(d));
    }
}

class PadSubView {

    constructor(width, height, tbsumContainer, midColour) {
        this.padContainer = tbsumContainer;
        this.width = width;
        this.height = height;

        this.midColour = midColour;

        this.dimensions = getDimensions();

        this.yscale = d3.scaleBand().domain(d3.range(30)).range([20, height - 20]).paddingInner(0.2).paddingOuter(0.2);

        this.xscale = d3.scaleBand().domain(d3.range(90, 99)).range([0, width - 20]).paddingInner(0.1).paddingOuter(0.1);

        this.yaxis = this.padContainer.append("g").attr("class", "y-axis")
            .attr("transform", `translate(${this.width - 20}, 0)`)
            .call(d3.axisRight(this.yscale).tickValues(d3.range(0, 30, 3)));

        this.xaxis = this.padContainer.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - 20})`)
            .call(d3.axisBottom(this.xscale));

        this.padContainer.append("rect")
                .attr("x", -25)
                .attr("width", 10)
                .attr("y", 20)
                .attr("height", height - 40)
                .style("fill", "url(#gradient)");

        this.colourAxisGroup = this.padContainer.append("g").attr("transform", "translate(-25, 0)");

        const padAdcCountGroup = this.padContainer.append("g").attr("class", "panel-label pad-adc-label").style("fill", this.midColour);
        padAdcCountGroup.append("text").text("Pad ADC").attr("transform", `translate(-30, ${height - 10})`);
        padAdcCountGroup.append("text").text("Count").attr("transform", `translate(-30, ${height - 0})`);

        this.content = this.padContainer.append("g");
    }

    draw(trdTrackletData, digitsData, colourScale) {
        this.content.selectAll("rect.tbin").remove();

        if (trdTrackletData == null) return;

        const layerDim = this.dimensions.filter(d => d.stack == trdTrackletData.stack && d.layer == trdTrackletData.layer)[0];

        const padMapping = d3.scaleLinear().domain([layerDim.minBinY, layerDim.maxBinY]).range([0, 143]);
        const minPad = Math.floor(padMapping(trdTrackletData.binY)) - 2;
        const maxPad = minPad + 5;

        const padIndices = d3.range(minPad, maxPad + 1);

        const pads = digitsData.pads.filter(p => p.row == trdTrackletData.binZ && padIndices.includes(p.col))
            .map(p => p.tbins.map((t, i) => ({
                pad: p.col,
                tbin: i,
                val: t
            })))
            .reduce(ajoin, [])
            .filter(p => p.val > 0);

        this.xscale.domain(d3.range(minPad, maxPad + 1));

        this.xaxis.call(d3.axisBottom(this.xscale));

        const xscale = this.xscale, yscale = this.yscale;

        const maxVal = d3.max(pads, d => d.val);

        colourScale.domain([0, maxVal]);

        const zscale = d3.scaleLinear().domain(colourScale.domain()).range(this.yscale.range());

        this.colourAxisGroup.call(d3.axisLeft(zscale));

        this.colourAxisGroup.selectAll("text").style("fill", this.midColour);

        const allPads = this.content.selectAll("rect.tbin")
            .data(pads)
            .enter()
            .append("rect")
            .attr("class", "tbin")
            .attr("x", d => xscale(d.pad))
            .attr("width", xscale.bandwidth())
            .attr("y", d => yscale(d.tbin))
            .attr("height", yscale.bandwidth())
            .style("fill", d => colourScale(d.val));
    }
}