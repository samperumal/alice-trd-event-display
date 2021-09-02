import { ComponentBase, marginDef } from './component-base.js';
import { rotateC } from './common-functions.js';
import { geomSectorXYPlaneTPC, geomSectorXYPlane } from '../geometry/geometries';
import { getDimensions } from '../geometry/trd-dimensions';
import * as d3 from "d3"

export class SectorViewComponent extends ComponentBase {
    constructor(id, width, height, viewBox, config) {
        super(id, width, height, marginDef(15, 15, 25, 5));

        const sectorToRotationAngle = this.sectorToRotationAngle;

        const layerData = this.layerData = getDimensions().filter(d => d.stack == 2);
        this.detectorData = d3.range(18)
            .map(s => ({
                sector: s,
                rot: sectorToRotationAngle(s),
                layerData: layerData.map(l => Object.assign({ sector: s, rot: sectorToRotationAngle(s) }, l))
            }));

        this.config = config != null ? config : {};
        this.r = (this.config.r != null) ? this.config.r : 2;

        this.selectedEventId = null;

        const xscale = this.xscale, yscale = this.yscale;
        xscale.domain([-450, 450]);
        yscale.domain([450, -450]);

        this.line = d3.line().x(d => xscale(d.x)).y(d => yscale(d.y));

        this.container.append("rect")
            .attr("class", "zoom")
            .attr("width", this.displayWidth)
            .attr("height", this.displayHeight)
            .attr("transform", "translate(" + (-this.displayWidth / 2) + "," + (-this.displayHeight / 2) + ")");

        this.container
            .append("path")
            .attr("class", "module tpc")
            .attr("d", geomSectorXYPlaneTPC().map(p => this.line(p)).join(" "));

        this.zoomBox = this.container
            .append("g")
            .attr("class", "zoom-box-group");

        const zoomPath = [
            [xscale(0), yscale(0)],
            [xscale(460), yscale(0)],
            rotateC(xscale(0), yscale(0), xscale(460), yscale(0), 20)
        ];

        this.zoomBox.append("path")
            .attr("class", "zoom-box")
            .attr("d", d3.line()(zoomPath) + "Z");

        this.container.classed("sector-view-component", true);

        this.allEsdTracks = this.container
            .append("path")
            .attr("class", "track esd");

        this.allTracks = this.container
            .append("path")
            .attr("class", "track");

        this.selectedTrack = this.container
            .append("path")
            .attr("class", "selected track");

        this.allTracklets = this.container
            .append("path").attr("class", "tracklet");

        this.selectedTracklet = this.container
            .append("path").attr("class", "selected tracklet");

        this.container.append("path")
            .attr("class", "module")
            .attr("d", geomSectorXYPlane()
                .map(d => this.line(d.d) + " Z ").join(" ")
            )

        this.sectorNumbers = this.container
            .append("g")
            .attr("class", "sector-number");

        this.sectorNumbers
            .selectAll("text")
            .data(d3.range(18).map(d => {
                const [x, y] = rotateC(xscale(0), yscale(0), xscale(420), yscale(0), 10 + 20 * d);

                return {
                    sector: d,
                    x: x,
                    y: y
                }
            }))
            .enter()
            .append("text")
            .attr("class", "sector-number")
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.sector);

        this.defs = this.svg.append("defs");

        const pc = [xscale(0), -this.componentHeight / 2 + this.margin.top / 2];
        const pr = rotateC(xscale(0), -this.componentHeight / 4, pc[0], pc[1], -25);
        const pl = rotateC(xscale(0), -this.componentHeight / 4, pc[0], pc[1], 24);

        this.defs.append("path")
            .attr("id", "sectors-text-path")
            .attr("d", `M ${pl[0]},${pl[1]} S ${pc[0]},${pc[1]} ${pr[0]},${pr[1]}`);

        this.sectorNumbers
            .append("text")
            .attr("class", "sector-number-title")
            .append("textPath")
            .attr("href", "#sectors-text-path")
            .attr("method", "stretch")
            .text("Sectors");

        if (viewBox != null)
            this.transitionViewBox(viewBox, 750);
    }

    zoomed() {
        console.log(d3.event.transform)
    }

    sectorToRotationAngle(sector) {
        return -10 - 20 * sector;
    }

    draw(eventData) {
        const xscale = this.xscale, yscale = this.yscale;
        const line = this.line;
        const layerData = this.layerData;

        const sectorToRotationAngle = this.sectorToRotationAngle;
        const transitionDuration = 500;

        const selectedTrack = eventData.track != null ? eventData.track.id : null;

        if (eventData.event == null) {
            this.selectedEventId = null;

            this.allTracks.attr("d", null);
            this.allEsdTracks.attr("d", null);
            this.allTracklets.attr("d", null);
        }
        else if (this.selectedEventId != eventData.event.id) {
            this.selectedEventId = eventData.event.id;

            this.allTracks.attr("d", eventData.event.tracks.filter(t => t.typ == "Trd").map(d => line(d.path)).join(" "));
            this.allEsdTracks.attr("d", eventData.event.tracks.filter(t => t.typ == "Esd").map(d => line(d.path)).join(" "));
            this.allTracklets.attr("d", eventData.event.trklts.map(d => line(d.path)).join(" "));
        }

        if (eventData.track != null) {
            this.allTracks.classed("other", true);
            this.allTracklets.classed("other", true);

            this.selectedTrack.attr("d", line(eventData.track.path));
            this.selectedTracklet.attr("d", eventData.track.trklts.map(d => line(d.path)).join(" "));

            const sector = eventData.track.sec;

            this.zoomBox
                .transition().duration(transitionDuration)
                .attr("transform", `rotate(${-sector * 20} ${xscale(0)} ${yscale(0)})`);
        }
        else {
            this.allTracks.classed("other", false);
            this.allTracklets.classed("other", false);

            this.selectedTrack.attr("d", null);
            this.selectedTracklet.attr("d", null);

            this.zoomBox
                .transition().duration(transitionDuration)
                .attr("transform", `rotate(${-4 * 20} ${xscale(0)} ${yscale(0)})`);
        }
    }

    layerNumberPosition(sector, d) {
        return "translate(" + this.xscale(0) + "," + this.yscale(d.minLocalY - 4) + ")rotate(" + (-d.rot - ((sector - 4) * 20)) + ")";
    }
}