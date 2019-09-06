import * as THREE from '../js/three.module.js';
import { OrbitControls } from '../js/OrbitControls.js';
import { geomLayers3D } from '../geometry/geometries3d.js';

class ThreejsComponent {
    constructor(id, width, height) {
        this.init(id, width, height);
        this.render();
    }

    init(id, width, height) {

        const scene = this.scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);

        const renderer = this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.getElementById(id)
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(width, height);

        const camera = this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 3000);
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
                    color: new THREE.Color(`hsl(100, ${Math.round((layer.sec / 18) * 100)}%, 80%)`),
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

        // detectors.visible = false;

        // var axesHelper = new THREE.AxesHelper( 500 );
        // scene.add( axesHelper );

        // Tracks
        this.tracks = null;
    }

    render() {

        this.renderer.render(this.scene, this.camera);
    }

    toggleDetectors(visible) {
        this.detectors.visible = visible;
    }

    draw(eventData) {
        //if (eventData.type != "select") return;

        if (this.tracks != null) this.scene.remove(this.tracks);
        if (this.tracklets != null) this.scene.remove(this.tracklets);

        if (eventData.event != null && eventData.event.tracks != null) {
            this.tracks = new THREE.Object3D();
            this.tracklets = new THREE.Object3D();

            const unselectedMaterial = new THREE.LineBasicMaterial({ color: 0xdbebf9, opacity: 0.25, transparent: true });
            const selectedMaterial = new THREE.LineBasicMaterial({ color: 0x3392e3 });

            const selectedTrackletMaterial = new THREE.LineBasicMaterial({ color: 0xf03b20 });
            const matchedTrackletMaterial = new THREE.LineBasicMaterial({ color: 0xfeb24c });
            const otherTrackletMaterial = new THREE.LineBasicMaterial({ color: 0xffeda0, opacity: 0.25, transparent: true });

            const selectedId = (eventData.track != null) ? eventData.track.id : null;
            const selectedStack = (eventData.track != null) ? eventData.track.stk : null;

            for (const track of eventData.event.tracks) {
                if (selectedStack == null || (selectedStack == track.stk)) {
                    const material = (selectedId == null || selectedId == track.id) ? selectedMaterial : unselectedMaterial;

                    this.tracks.add(this.createLineObject3D(track, material));

                    if (selectedId != null) {
                        for (const tracklet of track.trklts) {
                            this.tracklets.add(this.createLineObject3D(tracklet, selectedId == track.id ? selectedTrackletMaterial : matchedTrackletMaterial));
                        }
                    }
                }
            }

            if (selectedId == null)
                for (const tracklet of eventData.event.trklts)
                    this.tracklets.add(this.createLineObject3D(tracklet, selectedTrackletMaterial));
            else for (const tracklet of eventData.event.trklts)
                if (selectedStack == tracklet.stk && tracklet.trk == null)
                    this.tracklets.add(this.createLineObject3D(tracklet, otherTrackletMaterial));

            this.scene.add(this.tracklets);
            this.scene.add(this.tracks);            

            this.stackMap.forEach((object, stack) => object.visible = (eventData.track == null) || (stack == eventData.track.stk));
        }
        else {
            this.tracks = null;
        }

        this.render();
    }

    createLineObject3D(obj, material) {
        if (obj.line == null)
            if (obj.path3d != null) {
                const geometry = new THREE.BufferGeometry();
                const vertices = new Float32Array(obj.path3d);
                geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
                obj.line = new THREE.Line(geometry, material);        
            }
            else throw "no path3d exists on object";
        else obj.line.material = material;

        return obj.line;
    }
}

export { ThreejsComponent };