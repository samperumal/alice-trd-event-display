class TimebinViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), `0 0 ${width} ${height}`);

        this.dimensions = getDimensions();

        this.dataLoadUrl = config.dataLoadUrl;

        this.splitBand = d3.scaleBand().domain(d3.range(2))
            .range([this.margin.left, this.margin.left + this.displayWidth])
            .paddingInner(0.2);

        this.groupSpacing = 0;
        this.tbsumGroupWidth = (this.displayWidth - this.groupSpacing) * 2 / 4;
        this.padGroupWidth = (this.displayWidth - this.groupSpacing) * 2 / 4;

        this.tbsumGroup = this.container.append("g").attr("class", "tbsum-group")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.tbsumSubView = new TbsumSubView(this.tbsumGroupWidth, this.displayHeight, this.tbsumGroup);

        this.padGroup = this.container.append("g").attr("class", "pad-group")
            .attr("transform", `translate(${this.margin.left + this.tbsumGroupWidth + this.groupSpacing}, ${this.margin.top})`);

        this.padSubView = new PadSubView(this.padGroupWidth, this.displayHeight, this.padGroup);

        // const sectorToRotationAngle = this.sectorToRotationAngle;

        // const layerData = this.layerData = getDimensions().filter(d => d.stack == 2);
        // this.detectorData = d3.range(18)
        //     .map(s => ({
        //         sector: s,
        //         rot: sectorToRotationAngle(s),
        //         layerData: layerData.map(l => Object.assign({ sector: s, rot: sectorToRotationAngle(s) }, l))
        //     }));

        // this.config = config != null ? config : {};
        // this.r = (this.config.r != null) ? this.config.r : 2;

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

            this.tbsumSubView.draw(eventData.trdTrack.trdTracklets[0], data.layers[0]);
            this.padSubView.draw(eventData.trdTrack.trdTracklets[0], data.layers[0]);
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

        this.yscale = d3.scaleBand().domain(d3.range(30)).range([20, height - 20]).paddingInner(0.1);

        this.xscale = d3.scaleLinear().domain([1000, 0]).range([20, width - 20]);

        this.yaxis = this.tbsumContainer.append("g").attr("class", "y-axis")
            .attr("transform", "translate(20, 0)")
            .call(d3.axisLeft(this.yscale));

        this.xaxis = this.tbsumContainer.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - 20})`)
            .call(d3.axisBottom(this.xscale));

        this.content = this.tbsumContainer.append("g")
            .attr("transform", `translate(${this.xscale.range()[0]}, ${this.yscale.range()[0]})`);
    }

    draw(trdTrackletData, digitsData) {
        const layerDim = this.dimensions.filter(d => d.stack == trdTrackletData.stack && d.layer == trdTrackletData.layer)[0];

        const padMapping = d3.scaleLinear().domain([layerDim.minBinY, layerDim.maxBinY]).range([0, 143]);
        const minPad = Math.floor(padMapping(trdTrackletData.binY)) - 2;
        const maxPad = minPad + 4;
        const padIndices = d3.range(minPad, maxPad + 1);

        const pads = digitsData.pads.filter(p => p.row == trdTrackletData.binZ && padIndices.includes(p.col));

        const maxAdcCount = Math.max(d3.max(pads, p => p.tsum), 1000);

        this.xscale.domain([maxAdcCount, 0]);

        this.xaxis.call(d3.axisBottom(this.xscale));
    }
}

class PadSubView {

    constructor(width, height, tbsumContainer) {
        this.tbsumContainer = tbsumContainer;
        this.width = width;
        this.height = height;

        this.dimensions = getDimensions();

        this.yscale = d3.scaleBand().domain(d3.range(30)).range([20, height - 20]).paddingInner(0.1);

        this.xscale = d3.scaleBand().domain(d3.range(90, 99)).range([0, width - 20]);

        this.yaxis = this.tbsumContainer.append("g").attr("class", "y-axis")
            .attr("transform", `translate(${this.width - 20}, 0)`)
            .call(d3.axisRight(this.yscale));

        this.xaxis = this.tbsumContainer.append("g").attr("class", "x-axis")
            .attr("transform", `translate(0, ${height - 20})`)
            .call(d3.axisBottom(this.xscale));

        this.content = this.tbsumContainer.append("g")
            .attr("transform", `translate(${this.xscale.range()[0]}, ${this.yscale.range()[0]})`);
    }

    draw(trdTrackletData, digitsData) {
        const layerDim = this.dimensions.filter(d => d.stack == trdTrackletData.stack && d.layer == trdTrackletData.layer)[0];

        const padMapping = d3.scaleLinear().domain([layerDim.minBinY, layerDim.maxBinY]).range([0, 143]);
        const minPad = Math.floor(padMapping(trdTrackletData.binY)) - 2;
        const maxPad = minPad + 4;

        this.xscale.domain(d3.range(minPad, maxPad + 1));

        this.xaxis.call(d3.axisBottom(this.xscale));
    }
}