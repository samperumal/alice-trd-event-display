function* mapToDisplayDataFormat(data) {
    const stackedLayerData = getStackedLayerDimensions();

    for (const ev of data) {
        const trackletMap = new Map();

        const trklts = ev.trdTracklets
            .map(t => {
                const layerDim = stackedLayerData.get(t.stack).get(t.layer);

                const lorentzAngle = 8;
                const tanLorentz = Math.tan(lorentzAngle / 180 * Math.PI);

                const adjDyDxPos = (t.dyDx + tanLorentz) / (1 - t.dyDx * tanLorentz);
                const adjDyDxNeg = (t.dyDx - tanLorentz) / (1 + t.dyDx * tanLorentz);

                const rot = -sectorToRotationAngle(t.sector);
                const y1l = -t.localY;
                const y2l = -t.localY + (t.dyDx * Math.abs(layerDim.maxR - layerDim.minR));
                const y2PosLorentz = -t.localY + (adjDyDxPos * Math.abs(layerDim.maxR - layerDim.minR));
                const y2NegLorentz = -t.localY + (adjDyDxNeg * Math.abs(layerDim.maxR - layerDim.minR));
                const x1l = layerDim.maxR;
                const x2l = layerDim.minR;

                const [x1, y1] = rotate(x1l, y1l, rot);
                const [x2, y2] = rotate(x2l, y2l, rot);

                const tracklet = {
                    id: t.id,
                    path: [{x: x1, y: -y1}, {x: x2, y: -y2}],
                    sec: t.sector,
                    stk: t.stack,
                    lyr: t.layer,
                    row: t.binZ,
                    //binY: t.binY,
                    y1: y1l,
                    y2: y2l,
                    y2p: y2PosLorentz,
                    y2n: y2NegLorentz
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
                pt: t.pT,
                alpha: t.alpha,
                lambda: t.lambda,
                path: t.track.path.map(d => {
                    return {
                        x: d.x,
                        y: d.y,
                        z: d.z,
                        r: Math.sqrt(d.y * d.y + d.x * d.x)
                    };
                }),
                type: t.type,
                trklts: t.trdTracklets.map(tl => trackletMap.get(tl.id))
            }));

        yield {
            id: ev.id,
            evno: ev.evno,
            tracks,
            trklts
        };
    }
}

function sectorToRotationAngle(sector) {
    return -10 - 20 * sector;
}