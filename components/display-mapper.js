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
                const xr = 3;   // distance over which dy is measured (drift height)

                const y1l = -t.lY;

                // dy (in O2) is given over 3cm drift height. This is not 30 time bins. Currently it is fixed
                // to ~20 time bins which is determined by vDrift. The event display draws 30 time bins, 
                // therefore, the slope must be scaled accordingly.
                const tbScaleFactor = 30 / 20;
                
                const y2l = -t.lY + (t.dyDx * tbScaleFactor * xr);
                
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
                t.y1 = y1l;     // both tracklets' start point (top of display)
                t.y2 = y2l;     // calibrated tracklet end point (bottom of display)
                t.y2n = -t.lY + (t.dyDxAN * tbScaleFactor * xr);    // raw tracklet end point (bottom)

                t.y2p = -t.lY + (t.dyDxAP * xr);    // not used

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