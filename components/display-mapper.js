function* mapToDisplayDataFormat(data) {
    const stackedLayerData = getStackedLayerDimensions();

    for (const ev of data) {
        const trackletMap = new Map();

        const trklts = ev.trklts
            .map(t => {
                const layerDim = stackedLayerData.get(t.stk).get(t.lyr);

                const rot = -sectorToRotationAngle(t.sec);
                
                const x1l = layerDim.maxR;
                const x2l = layerDim.minR;
                const xr = Math.abs(layerDim.maxR - layerDim.minR);

                const y1l = -t.lY;
                const y2l = -t.lY + (t.dyDx * xr);
                
                const [x1, y1] = rotate(x1l, y1l, rot);
                const [x2, y2] = rotate(x2l, y2l, rot);

                t.path = [{x: x1, y: -y1}, {x: x2, y: -y2}];
                t.y1 = y1l;
                t.y2 = y2l;
                t.y2p = -t.lY + (t.dyDxAP * xr);
                t.y2n = -t.lY + (t.dyDxAN * xr);

                trackletMap.set(t.id, t);

                return t;
            });

        const tracks = ev.tracks
            .filter(t => t.path != null && t.path.length > 0)
            .map(t => {
                t.trklts = t.trklts.map(tl => trackletMap.get(tl));
                return t;
            });

        yield {
            id: ev.id,
            tracks,
            trklts
        };
    }
}

function sectorToRotationAngle(sector) {
    return -10 - 20 * sector;
}