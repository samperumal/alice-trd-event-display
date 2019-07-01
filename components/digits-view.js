const padw = 4, padh = 5;

class DigitsViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5), `0 0 ${width} ${height}`);

        this.eventInput = d3.select(config.eventInput).node();
        this.sectorInput = d3.select(config.sectorInput).node();
        this.stackInput = d3.select(config.stackInput).node();
        this.maxCsumInput = d3.select(config.maxCsumInput).node();
        this.canvas = document.getElementById(id.replace("#", ""));

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

        const canvas = this.canvas, context = this.ctx;

        const devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1,

            ratio = devicePixelRatio / backingStoreRatio;

        console.log(backingStoreRatio);

        if (devicePixelRatio !== backingStoreRatio) {
            const oldWidth = canvas.width;
            const oldHeight = canvas.height;

            canvas.width = oldWidth * ratio;
            canvas.height = oldHeight * ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            context.scale(ratio, ratio);
        }
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
        this.maxCsum = this.maxCsumInput.value;

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
        const bin = Math.min(Math.floor((new Date() - this.timeStart) / 1000 / 0.25), 29);

        this.timeBinChange(bin);

        this.drawPads(bin);

        if (bin < 29) {
            window.requestAnimationFrame(this.animatePads.bind(this));
        }
    }

    drawPads(bin) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = "#bbb";
        this.ctx.lineWidth = 0.6;

        const binColourScale = d3.scaleSequential(d3.interpolateBuPu).domain([0, 256]);
        const maxCsum = this.maxCsum;

        const padw = 5, padh = 3, ml = 5, mt = 50, rs = 4, mb = 5;
        const pane1End = ml + (padw + 6 * padw + padw) * 16 + rs * 15 + ml, paneXOffset = pane1End + 10 * padw;

        // Stroke Pad Row outline

        for (const row of d3.range(16)) {
            this.ctx.strokeRect(ml + (padw + 6 * padw + padw + rs) * row, mt, padw * 8, padh * 146);
            this.ctx.strokeRect(paneXOffset + ml + (padw + 6 * padw + padw + rs) * row, mt, padw * 8, padh * 146);
        }

        // Stroke axes text
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.font = '11px sans-serif';
        this.ctx.fillText("Pad Cols", pane1End + 5 * padw, mt + 73.5 * padh);
        this.ctx.fillText(0, pane1End + 5 * padw, mt + padh + padh * 1.5);
        this.ctx.fillText(143, pane1End + 5 * padw, mt + padh + padh * 144);
        this.ctx.textBaseline = "bottom";
        this.ctx.fillText("Pad Rows", pane1End / 2, mt - padh * 4);
        this.ctx.fillText("Pad Rows", pane1End / 2 + paneXOffset, mt - padh * 4);
        for (const row of d3.range(16)) {
            for (const paneOffset of [0, paneXOffset]) {
                this.ctx.fillText(row, ml + (padw + 6 * padw + padw + rs) * row + padw + 3 * padw + paneOffset, mt);
                this.ctx.fillText(0, ml + (padw + 6 * padw + padw + rs) * row + padw + paneOffset, mt + padh * 146 + 4 * padh);
                this.ctx.fillText(5, ml + (padw + 6 * padw + padw + rs) * row + padw * 7 + paneOffset, mt + padh * 146 + 4 * padh);

                this.ctx.fillText("Layers", ml + (padw + 6 * padw + padw + rs) * row + padw * 4 + paneOffset, mt + padh * 146 + 8 * padh);
            }
        }

        this.ctx.font = 'small-caps bold 13px sans-serif';
        this.ctx.fillText("Pad ADC - single time-bin", pane1End / 2, mt - padh * 9);
        this.ctx.fillText("Pad ADC - cumulative time-bin sum", pane1End / 2 + paneXOffset, mt - padh * 9);

        // Stroke contents colour scale
        this.ctx.font = 'small-caps 13px sans-serif';
        this.ctx.fillText("ADC single bin", pane1End / 2, mt + padh * 146 + 30 * padh);
        this.ctx.fillText("ADC cumulative sum", pane1End / 2 + paneXOffset, mt + padh * 146 + 30 * padh);

        this.ctx.fillText("0", pane1End / 2 - padw * 50 / 2, mt + padh * 146 + 30 * padh);
        this.ctx.fillText("255", pane1End / 2 + padw * 50 / 2, mt + padh * 146 + 30 * padh);
        this.ctx.fillText("0", pane1End / 2 - padw * 50 / 2 + paneXOffset, mt + padh * 146 + 30 * padh);
        this.ctx.fillText(maxCsum, pane1End / 2 + padw * 50 / 2 + paneXOffset, mt + padh * 146 + 30 * padh);

        const makeLinearGradient = function (colScheme, x1, x2) {
            const stops = 10;
            const colScale = d3.scaleSequential(colScheme).domain([0, stops]);
            const lingrad = this.ctx.createLinearGradient(x1, 0, x2, 0);
            for (let i = 0; i <= stops; i += 1) {
                lingrad.addColorStop(i / stops, colScale(i));
            }

            return lingrad;
        }.bind(this);

        this.ctx.fillStyle = makeLinearGradient(d3.interpolateBuPu, pane1End / 2 - padw * 50 / 2, pane1End / 2 + padw * 50 / 2);
        this.ctx.fillRect(pane1End / 2 - padw * 50 / 2, mt + padh * 146 + 13 * padh, padw * 50, padh * 10);

        this.ctx.fillStyle = makeLinearGradient(d3.interpolateYlGnBu, pane1End / 2 - padw * 50 / 2 + paneXOffset, pane1End / 2 + padw * 50 / 2 + paneXOffset);
        this.ctx.fillRect(pane1End / 2 - padw * 50 / 2 + paneXOffset, mt + padh * 146 + 13 * padh, padw * 50, padh * 10);

        // Stroke pad contents
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1;

        for (const layer of this.data.layers.reverse()) {
            const colourScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, maxCsum]);
            for (const pad of layer.pads) {
                const x = ml + (padw + 6 * padw + padw + rs) * pad.row + padw + pad.layer * padw;
                const y = mt + padh + (pad.col * padh);

                if (pad.tbins[bin] > 0) {
                    this.ctx.fillStyle = binColourScale(pad.tbins[bin]);
                    this.ctx.fillRect(x, y, padw, padh);
                    this.ctx.strokeRect(x, y, padw, padh);
                }

                const cumsum = pad.csum[bin];

                if (cumsum > 0) {
                    this.ctx.fillStyle = colourScale(cumsum);
                    this.ctx.fillRect(x + paneXOffset, y, padw, padh);
                    this.ctx.strokeRect(x + paneXOffset, y, padw, padh);
                }
            }
        }
    }
}