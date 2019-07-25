class TimebinViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), `0 0 ${width} ${height}`);

        this.container.classed("time-bin-view", true);

        this.dimensions = getDimensions();

        this.dataLoadUrl = config.dataLoadUrl;

        this.splitXBand = d3.scaleBand().domain(d3.range(2))
            .range([this.margin.left, this.margin.left + this.displayWidth])
            .paddingInner(0.2).paddingOuter(0.1);

        this.splitYBand = d3.scaleBand().domain(d3.range(6))
            .range([this.margin.top, this.margin.top + this.displayHeight])
            .paddingInner(0.15).paddingOuter(0.05);

        this.groupSpacing = 0;
        this.tbsumGroupWidth = this.splitXBand.bandwidth();
        this.padGroupWidth = this.splitXBand.bandwidth();
        this.layerGroupHeight = this.splitYBand.bandwidth();

        this.layerGroups = [];
        this.tbsumSubViews = [];
        this.padSubViews = [];
        this.layerLabels = [];

        this.colourScale = d3.scaleSequential(d3.interpolateGreens).domain([100, 0]);

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

        for (let i = 0; i <= 100; i += 10) {
            this.gradient.append('stop')
                .attr('offset', `${i}%`)
                .attr('stop-color', this.colourScale(100 - i))
                .attr('stop-opacity', 1);
        }

        for (const layer of d3.range(6)) {
            const layerGroup = this.container.append("g")
                .attr("transform", `translate(0, ${this.splitYBand(5 - layer)})`);

            if (layer < 5)
                layerGroup.append("line").attr("class", "divider")
                    .attr("y1", -20).attr("y2", -20)
                    .attr("x1", this.splitXBand(0)).attr("x2", this.splitXBand(1) + this.splitXBand.bandwidth());

            this.layerLabels.push(
                layerGroup.append("text").attr("class", "panel-label")
                    .attr("y", -15)
                    .attr("x", this.displayWidth / 2)
            );

            this.layerGroups.push(layerGroup);

            const tbsumGroup = layerGroup.append("g").attr("class", "tbsum-group")
                .attr("transform", `translate(${this.splitXBand(0)}, 0)`);

            tbsumGroup.append("text").text(`Time-bin sums`).attr("class", "panel-label vis-name")
                .attr("x", this.splitXBand.bandwidth() / 2);

            this.tbsumSubViews.push(new TbsumSubView(this.tbsumGroupWidth, this.layerGroupHeight, tbsumGroup));

            const padGroup = layerGroup.append("g").attr("class", "pad-group")
                .attr("transform", `translate(${this.splitXBand(1)}, 0)`);

            padGroup.append("text").text(`LocalY pad coordinate`).attr("class", "panel-label axis-name")
                .attr("x", this.splitXBand.bandwidth() / 2);

            this.padSubViews.push(new PadSubView(this.padGroupWidth, this.layerGroupHeight, padGroup, midColour));
        }
    }

    draw(eventData) {
        if (eventData.type == "select" && eventData.track != null) {
            this.drawDigits(eventData);
        }
    }

    async drawDigits(eventData) {
        const eventNo = eventData.event.evno;
        const sector = eventData.track.sec;
        const stack = eventData.track.stk;

        try {
            console.log(`Loading digits for Event: ${eventNo} Sector: ${sector} Stack ${stack}`);
            const data = await d3.json(this.dataLoadUrl(eventNo, sector, stack));

            const allPads = geomZoomSectorXYPlanePads();

            for (const layer of d3.range(6)) {
                const trackletData = eventData.track.trklts.find(t => t.lyr == layer);
                let location = null;
                if (trackletData != null) {
                    this.layerLabels[layer].text(`Layer ${layer} Padrow ${trackletData.row}`);

                    const LY = [trackletData.y1, trackletData.y2].sort((a,b) => a-b);

                    const pads = allPads
                        .filter(p => p.l == layer)
                        .filter(p => p.d[0].x > LY[0] && p.d[2].x < LY[1]);

                    const padExtent = d3.extent(pads.map(p => p.c));
                    padExtent[1] = Math.min(143, padExtent[1] + 2);
                    padExtent[0] = Math.max(0, padExtent[0] - 2);
            
                    const padIndices = d3.range(padExtent[1], padExtent[0] - 1, -1);

                    const padBounds = allPads.filter(p => p.l == layer)
                        .filter(p => padIndices.includes(p.c))
                        .map(p => p.d.map(d => d.x)).reduce(ajoin);

                    const ydomain = d3.extent(padBounds);

                    location = {
                        stack: trackletData.stk,
                        layer: trackletData.lyr,
                        row: trackletData.row,
                        binY: trackletData.binY,
                        padIndices: padIndices,
                        col: -1,
                        y1: trackletData.y1, 
                        y2: trackletData.y2,
                        ydomain: ydomain
                    }
                }
                else this.layerLabels[layer].text(`Layer ${layer}`);

                this.tbsumSubViews[layer].draw(location, data.layers[layer]);
                this.padSubViews[layer].draw(location, data.layers[layer], this.colourScale);
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    updatePad(updateData) {
        console.log(updateData);

        let location = null;
        if (updateData != null) {
            const layer = updateData.pos.layer;

            this.layerLabels[layer].text(`Layer ${layer} Pad row ${updateData.pos.row}`);
            location = {
                stack: updateData.data.stack,
                layer: layer,
                row: updateData.pos.row,
                binY: null,
                col: updateData.pos.col
            };

            this.tbsumSubViews[layer].draw(location, updateData.data);
            this.padSubViews[layer].draw(location, updateData.data, this.colourScale);
        }
    }
}

class TbsumSubView {
    constructor(width, height, tbsumContainer) {
        this.tbsumContainer = tbsumContainer;
        this.width = width;
        this.height = height;

        this.dimensions = getDimensions();

        this.yscale = d3.scaleBand().domain(d3.range(30)).range([40, height - 20]).paddingInner(0.2).paddingOuter(0.2);

        this.xscale = d3.scaleLinear().domain([1000, 0]).range([20, width - 20]);

        this.yaxis = this.tbsumContainer.append("g").attr("class", "y-axis")
            .attr("transform", "translate(20, 0)")
            .call(d3.axisLeft(this.yscale).tickValues(d3.range(0, 30, 3)));

        this.xaxis = this.tbsumContainer.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - 20})`);

        this.tbsumContainer.append("text").text("ADC sum for displayed pads")
            .attr("class", "panel-label axis-name")
            .attr("transform", `translate(${this.width / 2}, ${this.height + 2})`);

        this.tbsumContainer.append("text").text("Time bin")
            .attr("class", "panel-label axis-name tbin")
            .attr("transform", `translate(${-15}, ${this.height / 2})rotate(-90)`);

        this.content = this.tbsumContainer.append("g");
    }

    draw(location, digitsData) {
        if (location == null) {
            this.content.selectAll("rect.tbsum").remove();
            this.xscale.domain([256, 0]);
            this.xaxis.call(d3.axisBottom(this.xscale).ticks(5, "s"));

            return;
        }

        let padIndices;

        if (location.padIndices != null) {
            padIndices = location.padIndices;

            this.xscale.domain(padIndices);
        }
        else {
            const minPad = Math.max(location.col - 3, 0);
            const maxPad = Math.min(location.col + 3, 143);
            padIndices = d3.range(minPad, maxPad + 1);
        }

        const pads = digitsData.pads.filter(p => p.row == location.row && padIndices.includes(p.col));

        const tbinSum = d3.range(30);
        for (const index in tbinSum)
            tbinSum[index] = 0;

        for (const pad of pads) {
            for (let i = 0; i < pad.tbins.length; i++)
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

        this.yscale = d3.scaleBand().domain(d3.range(30)).range([40, height - 20]).paddingInner(0.2).paddingOuter(0.2);

        this.xscale = d3.scaleBand().domain(d3.range(90, 99)).range([0, width - 20]).paddingInner(0.1).paddingOuter(0.1);

        this.tscale = d3.scaleLinear().range([0, width - 20]);

        this.tline = d3.line().x(d => this.tscale(d[0])).y(d => this.yscale(d[1]));

        this.yaxis = this.padContainer.append("g").attr("class", "y-axis")
            .attr("transform", `translate(${this.width - 20}, 0)`)
            .call(d3.axisRight(this.yscale).tickValues(d3.range(0, 30, 3)));

        this.xaxis = this.padContainer.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - 20})`)
            .call(d3.axisBottom(this.xscale));

        this.taxis = this.padContainer.append("g").attr("class", "t-axis")
            .attr("transform", `translate(0, ${39})`);

        this.padContainer.append("rect")
            .attr("x", -25)
            .attr("width", 10)
            .attr("y", 40)
            .attr("height", height - 60)
            .style("fill", "url(#gradient)");

        this.colourAxisGroup = this.padContainer.append("g").attr("transform", "translate(-25, 0)");

        const padAdcCountGroup = this.padContainer.append("g").attr("class", "panel-label pad-adc-label").style("fill", this.midColour);
        padAdcCountGroup.append("text").text("Pad ADC").attr("transform", `translate(-30, ${height - 10})`);
        padAdcCountGroup.append("text").text("Count").attr("transform", `translate(-30, ${height - 0})`);

        this.padContainer.append("text").text("Pad number")
            .attr("class", "panel-label axis-name")
            .attr("transform", `translate(${this.width / 2}, ${this.height + 2})`);

        this.padContainer.append("text").text("Time bin")
            .attr("class", "panel-label axis-name tbin")
            .attr("transform", `translate(${this.width + 15}, ${this.height / 2})rotate(90)`);

        this.content = this.padContainer.append("g");

        this.trackletPath = this.padContainer.append("path").attr("class", "tracklet");
    }

    draw(location, digitsData, colourScale) {
        this.content.selectAll("rect.tbin").remove();
        this.trackletPath.attr("d", null);

        if (location == null) {
            this.colourAxisGroup.style("display", "none");
            return;
        }
        else {
            this.colourAxisGroup.style("display", "inherit");
        }

        let padIndices;

        if (location.padIndices != null) {
            padIndices = location.padIndices;

            this.xscale.domain(padIndices);
            this.tscale.domain(location.ydomain);
        }
        else {
            const minPad = Math.max(location.col - 2, 0);
            const maxPad = Math.min(location.col + 2, 143);
            padIndices = d3.range(minPad, maxPad + 1);

            this.xscale.domain(d3.range(maxPad, minPad - 1, -1));
        }

        const pads = digitsData.pads.filter(p => p.row == location.row && padIndices.includes(p.col))
            .map(p => p.tbins.map((t, i) => ({
                pad: p.col,
                tbin: i,
                val: t
            })))
            .reduce(ajoin, [])
            .filter(p => p.val > 0);

        this.xaxis.call(d3.axisBottom(this.xscale));
        this.taxis.call(d3.axisTop(this.tscale).ticks(5));

        const xscale = this.xscale, yscale = this.yscale;

        const maxVal = d3.max(pads, d => d.val);

        colourScale.domain([0, maxVal]);

        const zscale = d3.scaleLinear().domain(colourScale.domain().reverse()).range(this.yscale.range());

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

        this.trackletPath.attr("d", this.tline([[location.y1, 5], [location.y2, 25]]));
    }
}