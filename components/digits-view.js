class DigitsViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(5, 5, 5, 5));
        this.sectorInput = d3.select(config.sectorInput);
        this.stackInput = d3.select(config.stackInput);
        this.layerInput = d3.select(config.layerInput);
    }

    draw(eventData) {
        console.log(eventData);
        if (eventData != null && eventData.trdTrack != null && eventData.trdTrack.trdTracklets != null && eventData.trdTrack.trdTracklets.length > 0) {
            const tracklet = eventData.trdTrack.trdTracklets[0];
            this.sectorInput.attr("value", tracklet.sector);
            this.stackInput.attr("value", tracklet.stack);
            this.layerInput.attr("value", tracklet.layer);
        }
        else {
            this.sectorInput.attr("value", 0);
            this.stackInput.attr("value", 0);
            this.layerInput.attr("value", 0);
        }
    }
}