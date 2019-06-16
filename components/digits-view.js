const padw = 5, padh = 5;
        
class DigitsViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5));

        this.eventInput = d3.select(config.eventInput);
        this.sectorInput = d3.select(config.sectorInput);
        this.stackInput = d3.select(config.stackInput);
        this.layerInput = d3.select(config.layerInput);
        this.buttons = [];        

        for (const input of config.buttons) {
            this.buttons.push(d3.select(input).on("click", this.drawDigits.bind(this)));
        }

        this.dataLoadUrl = config.dataLoadUrl;

        this.sumGroup = this.container.append("g")
            .attr("transform", `translate(-${padw * 72}, -${this.componentHeight / 2})`);
    }

    draw(eventData) {
        if (eventData != null && eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null && eventData.trdTrack.trdTracklets.length > 0) {
            this.eventInput.attr("value", eventData.event.evno);
            
            const tracklet = eventData.trdTrack.trdTracklets[0];
            this.sectorInput.attr("value", tracklet.sector);
            this.stackInput.attr("value", tracklet.stack);
            this.layerInput.attr("value", tracklet.layer);
        }
        else {
            this.eventInput.attr("value", 0);

            this.sectorInput.attr("value", 0);
            this.stackInput.attr("value", 0);
            this.layerInput.attr("value", 0);
        }
    }

    async drawDigits() {
        const eventNo = this.eventInput.attr("value");
        const sector = this.sectorInput.attr("value");
        const stack = this.stackInput.attr("value");
        //const layer = this.layerInput.attr("value");

        try {
            console.log(`Loading digits for Event: ${eventNo} Sector: ${sector} Stack ${stack}`);            
            const data = await d3.json(`${this.dataLoadUrl}${eventNo}.${sector}.${stack}.json`);
            console.log(data);

            const allLayers = this.sumGroup.selectAll("g.layer")
                .data(data.layers);

            allLayers.enter().append("g").attr("class", "layer");

            allLayers.exit().remove();

            const allRows = this.sumGroup
                .selectAll("g.layer")
                .attr("transform", d => `translate(0, ${d.layer * padh * 17})`)
                .selectAll("rect.pad-sum")
                .data(d => d.pads, d => d.row * 144 + d.col);

            allRows.exit().remove();

            function fillColour(d) {
                const gray = Math.min(256 - 256 * d.tsum / 512, 240);

                return `rgb(${gray}, ${gray}, ${gray})`;
            }

            allRows.enter()
                .append("rect")
                .attr("class", "pad-sum")
                .attr("x", d => d.col * padw + 1)
                .attr("y", d => d.row * padh + 1)
                .attr("width", padw - 1)
                .attr("height", padh - 1)
                .style("fill", fillColour)
                ;

            

        }
        catch (err) {
            console.error(err);
        }
    }
}