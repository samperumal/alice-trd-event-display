import * as THREE from '../js/three.module.js';
import { OrbitControls } from '../js/OrbitControls.js';
import { geomLayers3D } from '../geometry/geometries3d.js';


class ThreejsComponent {
    constructor(id, config) {
        this.init(id);
        this.render();
    }

    init(id) {

        const scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const renderer = this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.getElementById(id)
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(520, 300);

        const camera = this.camera = new THREE.PerspectiveCamera(50, 520 / 300, 1, 3000);
        camera.position.set(1100, 1100, 1100);

        // controls

        const controls = this.controls = new OrbitControls(camera, renderer.domElement);

        controls.addEventListener('change', this.render.bind(this)); // call this only in static scenes (i.e., if there is no animation loop)

        // controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled
        // controls.dampingFactor = 0.05;

        controls.screenSpacePanning = false;

        controls.minDistance = -3000;
        controls.maxDistance = 3000;

        //controls.maxPolarAngle = Math.PI / 2;

        // world

        // Central sphere
        const sphG = new THREE.SphereBufferGeometry(10);
        scene.add(new THREE.LineSegments(new THREE.WireframeGeometry(sphG), new THREE.LineBasicMaterial({ color: 0x00ff00 })));

        // TRD Modules
        const detectors = this.detectors = new THREE.Object3D();

        const stackMap = this.stackMap = new Map();
        for (let s = 0; s < 5; s++) {
            const stackObj = new THREE.Object3D();
            stackMap.set(s, stackObj);
            detectors.add(stackObj);
        }

        for (const layer of geomLayers3D()) {
            const rotObj = new THREE.Object3D();
            rotObj.rotation.fromArray([0, 0, layer.rot / 180 * Math.PI]);

            var geometry = new THREE.BoxBufferGeometry(layer.w, layer.h, layer.d);
            var wireframe = new THREE.EdgesGeometry(geometry);
            var line = new THREE.LineSegments(wireframe,
                new THREE.LineBasicMaterial({
                    color: new THREE.Color(`hsl(${layer.rot}, 50%, 80%)`),
                    linewidth: 0.5
                })
            );
            
            line.position.x = layer.x;
            line.position.y = layer.y;
            line.position.z = layer.z;

            rotObj.add(line);

            const stackObj = stackMap.get(layer.stk);

            stackObj.add(rotObj);
        }

        scene.add(detectors);

        // Tracks
        this.tracks = null;
    }

    render() {

        this.renderer.render(this.scene, this.camera);
    }

    draw(eventData) {
        //const paths = eventData.event.tracks.map(t => t.path.map(p => [p.x, p.y, p.z]).reduce((a, b) => a.concat(b)));

        if (this.tracks != null) this.scene.remove(this.tracks);

        if (eventData.event != null && eventData.event.tracks != null) {
            this.tracks = new THREE.Object3D();

            const unselectedMaterial = new THREE.LineDashedMaterial({ color: 0xdbebf9 });
            const selectedMaterial = new THREE.LineDashedMaterial({ color: 0x3392e3 });

            const selectedId = (eventData.track != null) ? eventData.track.id : null;
            const selectedStack = (eventData.track != null) ? eventData.track.stk : null;

            for (const track of eventData.event.tracks) {
                const path = track.path.map(p => [p.x, p.y, p.z]).reduce((a, b) => a.concat(b));

                const geometry = new THREE.BufferGeometry();

                const vertices = new Float32Array(path);

                const material = (selectedId == null || selectedId == track.id) ? selectedMaterial : unselectedMaterial;

                // itemSize = 3 because there are 3 values (components) per vertex
                geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
                const line = new THREE.Line(geometry, material);

                if (selectedStack == null || (selectedStack == track.stk && track.typ == "Trd"))
                this.tracks.add(line);
            }

            this.scene.add(this.tracks);

            this.stackMap.forEach((object, stack) => object.visible = (eventData.track == null) || (stack == eventData.track.stk));
        }
        else {
            this.tracks = null;
        }

        this.render();
    }
}

export { ThreejsComponent };