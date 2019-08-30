const padw = 5, padh = 3, ml = 5, mt = 50, rs = 4, mb = 5;
const pane1End = ml + (padw + 6 * padw + padw) * 16 + rs * 15 + ml, paneXOffset = pane1End + 10 * padw;

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

        this.binColourScale = d3.scaleSequential(d3.interpolateGreens).domain([0, 256]);
        this.binSelectedColourScale = d3.scaleSequential(d3.interpolateReds).domain(this.binColourScale.domain());
        this.csumColourScale = d3.scaleSequential(d3.interpolateGreys);
        this.csumSelectedColourScale = d3.scaleSequential(d3.interpolateOranges);

        function rotate(d) {
            const angle = 2 * (2 * (d.r % 2) - 1); // 2 degrees, alternating by row
            const cx = colBand(d.c) + colBand.bandwidth() / 2; // x centre of rotation
            const cy = rowBand(d.r) + rowBand.bandwidth() / 2; // y centre of rotation
            return `rotate(${angle} ${cx} ${cy})`;
        }

        // Fix to ensure crisp edges on high DPI displays
        const canvas = this.canvas, context = this.ctx;

        const devicePixelRatio = window.devicePixelRatio || 1,
            backingStoreRatio = context.webkitBackingStorePixelRatio ||
                context.mozBackingStorePixelRatio ||
                context.msBackingStorePixelRatio ||
                context.oBackingStorePixelRatio ||
                context.backingStorePixelRatio || 1;

        this.ratio = devicePixelRatio / backingStoreRatio;

        this.offscreenCanvas = document.createElement("canvas"); // creates a new off-screen canvas element
        this.offscreenContext = this.offscreenCanvas.getContext('2d'); //the drawing context of the off-screen canvas element

        if (devicePixelRatio !== backingStoreRatio) {
            const oldWidth = canvas.width;
            const oldHeight = canvas.height;

            canvas.width = oldWidth * this.ratio;
            canvas.height = oldHeight * this.ratio;

            canvas.style.width = oldWidth + 'px';
            canvas.style.height = oldHeight + 'px';

            context.scale(this.ratio, this.ratio);

            this.offscreenCanvas.width = canvas.width; // match the off-screen canvas dimensions with that of #mainCanvas
            this.offscreenCanvas.height = canvas.height;
            this.offscreenContext.scale(this.ratio, this.ratio);
        }
        else {
            this.offscreenCanvas.width = canvas.width; // match the off-screen canvas dimensions with that of #mainCanvas
            this.offscreenCanvas.height = canvas.height;

        }

        this.renderBackground();
    }

    renderBackground() {
        this.offscreenContext.strokeStyle = "#bbb";
        this.offscreenContext.lineWidth = 0.6;

        // Stroke Pad Row outline
        for (const row of d3.range(16)) {
            this.offscreenContext.strokeRect(ml + (padw + 6 * padw + padw + rs) * row, mt, padw * 8, padh * 146);
            this.offscreenContext.strokeRect(paneXOffset + ml + (padw + 6 * padw + padw + rs) * row, mt, padw * 8, padh * 146);
        }

        // Stroke axes text
        this.offscreenContext.fillStyle = "black";
        this.offscreenContext.textAlign = "center";
        this.offscreenContext.textBaseline = "middle";
        this.offscreenContext.font = '11px sans-serif';
        this.offscreenContext.fillText("Pad Cols", pane1End + 5 * padw, mt + 73.5 * padh);
        this.offscreenContext.fillText(0, pane1End + 5 * padw, mt + padh + padh * 1.5);
        this.offscreenContext.fillText(143, pane1End + 5 * padw, mt + padh + padh * 144);
        this.offscreenContext.textBaseline = "bottom";
        this.offscreenContext.fillText("Pad Rows", pane1End / 2, mt - padh * 4);
        this.offscreenContext.fillText("Pad Rows", pane1End / 2 + paneXOffset, mt - padh * 4);

        // Stroke row and layer labels
        for (const row of d3.range(16)) {
            for (const paneOffset of [0, paneXOffset]) {
                this.offscreenContext.fillText(row, ml + (padw + 6 * padw + padw + rs) * row + padw + 3 * padw + paneOffset, mt);
                this.offscreenContext.fillText(0, ml + (padw + 6 * padw + padw + rs) * row + padw + paneOffset, mt + padh * 146 + 4 * padh);
                this.offscreenContext.fillText(5, ml + (padw + 6 * padw + padw + rs) * row + padw * 7 + paneOffset, mt + padh * 146 + 4 * padh);

                this.offscreenContext.fillText("Layers", ml + (padw + 6 * padw + padw + rs) * row + padw * 4 + paneOffset, mt + padh * 146 + 8 * padh);
            }
        }

        // Stroke panel titles
        this.offscreenContext.font = 'small-caps bold 13px sans-serif';
        this.offscreenContext.fillText("Pad ADC - cumulative time-bin sum", pane1End / 2, mt - padh * 9);
        this.offscreenContext.fillText("Pad ADC - single time-bin", pane1End / 2 + paneXOffset, mt - padh * 9);

        // Stroke contents colour scale
        this.offscreenContext.font = 'small-caps 13px sans-serif';
        this.offscreenContext.fillText("ADC cumulative sum", pane1End / 2, mt + padh * 146 + 30 * padh);
        this.offscreenContext.fillText("ADC single bin", pane1End / 2 + paneXOffset, mt + padh * 146 + 30 * padh);

        this.offscreenContext.fillText("0", pane1End / 2 - padw * 50 / 2 + paneXOffset, mt + padh * 146 + 30 * padh);
        this.offscreenContext.fillText("255", pane1End / 2 + padw * 50 / 2 + paneXOffset, mt + padh * 146 + 30 * padh);
        this.offscreenContext.fillText("0", pane1End / 2 - padw * 50 / 2, mt + padh * 146 + 30 * padh);

        const makeLinearGradient = function (colScheme, x1, x2) {
            const stops = 10;
            const colScale = d3.scaleSequential(colScheme).domain([0, stops]);
            const lingrad = this.offscreenContext.createLinearGradient(x1, 0, x2, 0);
            for (let i = 0; i <= stops; i += 1) {
                lingrad.addColorStop(i / stops, colScale(i));
            }

            return lingrad;
        }.bind(this);

        this.offscreenContext.fillStyle = makeLinearGradient(d3.interpolateGreens, pane1End / 2 - padw * 50 / 2 + paneXOffset, pane1End / 2 + padw * 50 / 2 + paneXOffset);
        this.offscreenContext.fillRect(pane1End / 2 - padw * 50 / 2 + paneXOffset, mt + padh * 146 + 13 * padh, padw * 50, padh * 10);

        this.offscreenContext.fillStyle = makeLinearGradient(d3.interpolateGreys, pane1End / 2 - padw * 50 / 2, pane1End / 2 + padw * 50 / 2);
        this.offscreenContext.fillRect(pane1End / 2 - padw * 50 / 2, mt + padh * 146 + 13 * padh, padw * 50, padh * 10);
    }

    draw(eventData) {
        if (eventData != null && eventData.track != null && eventData.track.trklts != null && eventData.track.trklts.length > 0) {
            if (eventData.type == "select") {
                const tracklet = eventData.track.trklts[0];

                this.eventInput.value = eventData.event.id;
                this.sectorInput.value = tracklet.sec;
                this.stackInput.value = tracklet.stk;
                this.selectedTrackInput = eventData.track;

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
        this.selectedTrack = this.selectedTrackInput;

        try {
            console.log(`Loading digits for Event: ${eventNo} Sector: ${sector} Stack ${stack}: ${this.dataLoadUrl}${eventNo}.${sector}.${stack}.json`);
            const data = this.data = await d3.json(this.dataLoadUrl(eventNo, sector, stack));

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

    async animatePads() {
        const bin = Math.min(Math.floor((new Date() - this.timeStart) / 1000 / 0.25), 29);

        this.timeBinChange(bin);

        const stop = await this.drawPads(bin);

        if (!stop && bin < 29) {
            window.requestAnimationFrame(this.animatePads.bind(this));
        }
    }

    async drawPads(bin) {
        let stop = false;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.drawImage(this.offscreenCanvas, 0, 0, this.canvas.width * this.ratio, this.canvas.height * this.ratio, 0, 0, this.canvas.width, this.canvas.height);

        let rowLayerIds = [];
        if (this.selectedTrack != null) {
            rowLayerIds = this.selectedTrack.trklts.map(d => d.layer + d.binZ * 10 + 1000);
        }

        this.csumColourScale.domain([0, this.maxCsum]);
        this.csumSelectedColourScale.domain([0, this.maxCsum * 1.2]);

        // Stroke pad contents
        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 1;

        for (const layer of this.data.layers.reverse()) {
            for (const pad of layer.pads) {
                if (pad.tbins.length == 0) continue;
                if (bin >= pad.tbins.length) {
                    bin = pad.tbins.length - 1;
                    stop = true;
                }

                const x = ml + (padw + 6 * padw + padw + rs) * pad.row + padw + pad.layer * padw;
                const y = mt + padh + (pad.col * padh);

                if (pad.tbins[bin] > 0) {
                    if (rowLayerIds.includes(pad.layer + pad.row * 10 + 1000))
                        this.ctx.fillStyle = this.binSelectedColourScale(pad.tbins[bin]);
                    else this.ctx.fillStyle = this.binColourScale(pad.tbins[bin]);
                    this.ctx.fillRect(x + paneXOffset, y, padw, padh);
                    this.ctx.strokeRect(x + paneXOffset, y, padw, padh);
                }

                const cumsum = pad.csum[bin];

                if (cumsum > 0) {
                    if (rowLayerIds.includes(pad.layer + pad.row * 10 + 1000))
                        this.ctx.fillStyle = this.csumSelectedColourScale(cumsum);
                    else this.ctx.fillStyle = this.csumColourScale(cumsum);
                    this.ctx.fillRect(x+1, y+1, padw-1, padh-1);
                }
            }
        }

        // Stroke axes text
        this.ctx.fillStyle = "black";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "bottom";
        this.ctx.font = 'small-caps 13px sans-serif';
        this.ctx.fillText(this.maxCsum, pane1End / 2 + padw * 50 / 2, mt + padh * 146 + 30 * padh);
        
        return stop;
    }
}