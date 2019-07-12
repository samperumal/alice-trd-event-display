function* mapToDisplayDataFormat(data) {
    const stackedLayerData = getStackedLayerDimensions();

    for (const ev of data) {
        const trackletMap = new Map();

        const tracklets = ev.trdTracklets
            .map(t => {
                const layerDim = stackedLayerData.get(t.stack).get(t.layer);

                const rot = -sectorToRotationAngle(t.sector);
                const y1l = -t.localY;
                const y2l = -t.localY + (t.dyDx * Math.abs(layerDim.maxR - layerDim.minR));
                const x1l = layerDim.maxR;
                const x2l = layerDim.minR;

                const [x1, y1] = rotate(x1l, y1l, rot);
                const [x2, y2] = rotate(x2l, y2l, rot);

                const tracklet = {
                    id: t.id,
                    x1, y1, x2, y2,
                    sec: t.sector,
                    stk: t.stack,
                    lyr: t.layer
                };

                trackletMap.set(t.id, tracklet);

                return tracklet;
            });

        const tracks = ev.trdTracks
            .filter(t => t.track != null && t.track.path != null && t.track.path.length > 0)
            .map(t => ({
                id: t.id,
                sec: t.sector,
                stk: t.stack,
                path: t.track.path,
                type: t.type,
                tklts: t.trdTracklets.map(tl => trackletMap.get(tl.id))
            }));

        yield {
            id: ev.id,
            evno: ev.evno,
            tracks,
            tracklets
        };
    }
}

function sectorToRotationAngle(sector) {
    return -10 - 20 * sector;
}