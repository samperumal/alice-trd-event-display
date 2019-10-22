import { rotate } from './common-functions.js';

export function* mapToDisplayDataFormat(data) {
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

                const z1 = -(layerDim.minZ + layerDim.zsize * t.row);
                const z2 = -(layerDim.minZ + layerDim.zsize * (t.row + 1));
                
                const [x1, y1] = rotate(x1l, y1l, rot);
                const [x2, y2] = rotate(x2l, y2l, rot);

                t.path = [{x: x1, y: -y1}, {x: x2, y: -y2}];
                t.path3d = [
                    x1, -y1, z1,
                    x2, -y2, z1,
                    x2, -y2, z2,
                    x1, -y1, z2,
                    x1, -y1, z1
                ];
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
                t.trklts = t.tlids.map(tl => trackletMap.get(tl));
                t.path3d = t.path.map(p => [p.x, p.y, p.z]).reduce((a, b) => a.concat(b));
                return t;
            });

        ev.tracks = tracks;
        ev.trklts = trklts;

        yield ev;
    }
}

function sectorToRotationAngle(sector) {
    return -10 - 20 * sector;
}