const padw = 4, padh = 5;

class DigitsViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), `0 0 ${width} ${height}`);

        this.eventInput = d3.select(config.eventInput).node();
        this.sectorInput = d3.select(config.sectorInput).node();
        this.stackInput = d3.select(config.stackInput).node();

        if (config != null) {
            if (config.padClick != null)
                this.padClick = config.padClick;

            if (config.timeBinChange != null)
                this.timeBinChange = config.timeBinChange;
        }

        this.buttons = [];

        for (const input of config.buttons) {
            this.buttons.push(d3.select(input).on("click", this.drawDigits.bind(this)));
        }

        this.dataLoadUrl = config.dataLoadUrl;

        this.container.setAttribute("class", "digits-view");

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

        const rowBand = this.rowBand = d3.scaleBand().domain(d3.range(0, 16).reverse())
            .range([axisMargins.top, layerBand.bandwidth() - axisMargins.top - axisMargins.bottom]);

        function rotate(d) {
            const angle = 2 * (2 * (d.r % 2) - 1); // 2 degrees, alternating by row
            const cx = colBand(d.c) + colBand.bandwidth() / 2; // x centre of rotation
            const cy = rowBand(d.r) + rowBand.bandwidth() / 2; // y centre of rotation
            return `rotate(${angle} ${cx} ${cy})`;
        }

        this.ctx.imageSmoothingEnabled = false;
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
            const data = this.data = await d3.json(`${this.dataLoadUrl}${eventNo}.${sector}.${stack}.json`);

            for (const layer of data.layers) {
                for (const pad of layer.pads) {
                    let csum = 0;
                    pad.csum = [];

                    for (let i = 0; i < 30; i++) {
                        csum += pad.tbins[i];
                        pad.csum.push(csum);
                    }
                }
            }

            this.timeStart = new Date();
            this.animatePads();
        }
        catch (err) {
            console.error(err);
        }
    }

    animatePads() {
        const bin = Math.min(Math.floor((new Date() - this.timeStart) / 1000 / 0.15), 29);

        this.timeBinChange(bin);

        this.drawPads(bin);

        if (bin < 29) {
            window.requestAnimationFrame(this.animatePads.bind(this));
        }
    }

    drawPads(bin) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = "#bbb";
        this.ctx.lineWidth = 0.5;

        const binColourScale = d3.scaleSequential(d3.interpolateBuPu).domain([0, 256]);

        const padw = 5, padh = 3, mh = 5, mv = 5, rs = 4, paneOffset = 150 * padw;

        for (const row of d3.range(16)) {
            this.ctx.strokeRect(mh + (padw + 6 * padw + padw + rs) * row, mv + padh, padw * 8, padh * 146);
            this.ctx.strokeRect(paneOffset + mh + (padw + 6 * padw + padw + rs) * row, mv + padh, padw * 8, padh * 146);
        }

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1;

        for (const layer of this.data.layers.reverse()) {
            const colourScale = d3.scaleSequential(d3.interpolateBuPu).domain([0, layer.maxtsum]);
            for (const pad of layer.pads) {
                const x = mh + (padw + 6 * padw + padw + rs) * pad.row + padw + pad.layer * padw;
                const y = mv + padh + (pad.col * padh);

                if (pad.tbins[bin] > 0) {
                    this.ctx.fillStyle = binColourScale(pad.tbins[bin]);
                    this.ctx.fillRect(x, y, padw, padh);
                    this.ctx.strokeRect(x, y, padw, padh);
                }

                const cumsum = pad.csum[bin];

                if (cumsum > 0) {
                    this.ctx.fillStyle = colourScale(cumsum);
                    this.ctx.fillRect(x + paneOffset, y, padw, padh);
                    this.ctx.strokeRect(x + paneOffset, y, padw, padh);
                }
            }
        }
    }
}