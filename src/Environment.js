import * as THREE from "three";

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.props = [];
        this.init();
    }

    init() {
        // ----------------------------
        // SKY — Warm Sunset Gradient
        // ----------------------------
        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        // Top → soft deep purple / navy
        // Mid → warm peach/pink
        // Bottom → glowing orange horizon
        const fragmentShader = `
            varying vec2 vUv;
            void main() {
                vec3 topColor    = vec3(0.10, 0.05, 0.20);   // deep purple/navy
                vec3 midColor    = vec3(0.85, 0.45, 0.50);   // soft warm pink-orange
                vec3 bottomColor = vec3(1.00, 0.65, 0.25);   // glowing sunset orange

                float h = vUv.y;

                vec3 color = mix(bottomColor, midColor, smoothstep(0.0, 0.55, h));
                color = mix(color, topColor, smoothstep(0.55, 1.0, h));

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(450, 32, 32),
            new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                side: THREE.BackSide
            })
        );
        this.scene.add(sky);

        // ----------------------------
        // FOG — Soft orange haze
        // ----------------------------
        this.scene.fog = new THREE.FogExp2(0xfcb174, 0.006);
        // Note: very subtle density (no pink fog blanket)

        // ----------------------------
        // SUN — soft warm glow
        // ----------------------------
        const sunGeo = new THREE.CircleGeometry(35, 64);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xffd8a3, // warm peach
            transparent: true,
            opacity: 0.65
        });
        this.sun = new THREE.Mesh(sunGeo, sunMat);
        this.sun.position.set(0, 35, -350);
        this.scene.add(this.sun);

        // ----------------------------
        // LIGHTING — Correct sunset colors
        // ----------------------------
        // Soft fill from sky (very subtle purple tint)
        const hemi = new THREE.HemisphereLight(0xffe6cc, 0x402020, 0.35);
        this.scene.add(hemi);

        // Warm directional sunlight
        const dir = new THREE.DirectionalLight(0xffb26a, 1.1);
        dir.position.set(-30, 40, -50);
        dir.castShadow = true;
        dir.shadow.bias = -0.0002;
        dir.shadow.mapSize.width = 2048;
        dir.shadow.mapSize.height = 2048;
        this.scene.add(dir);

        // ----------------------------
        // GROUND
        // ----------------------------
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshStandardMaterial({
                color: 0x2a241e, // warm dark brown/neutral
                roughness: 0.95
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.25;
        this.scene.add(ground);

        // ----------------------------
        // TREES & BUSHES
        // ----------------------------
        this.prepareProps();
        this.spawnProps();
    }

    prepareProps() {
        // Tree (warmer colors)
        this.treeGeo = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 2, 8),
            new THREE.MeshStandardMaterial({ color: 0x5e3b22 })
        );
        trunk.position.y = 1;
        trunk.castShadow = true;
        this.treeGeo.add(trunk);

        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(2.1, 4.5, 8),
            new THREE.MeshStandardMaterial({ color: 0x3d4a2a })
        );
        leaves.position.y = 3.25;
        leaves.castShadow = true;
        this.treeGeo.add(leaves);

        // Bush
        this.bushGeo = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.9),
            new THREE.MeshStandardMaterial({ color: 0x4b5530 })
        );
        this.bushGeo.castShadow = true;
    }

    spawnProps() {
        for (let i = 0; i < 90; i++) {
            const type = Math.random();
            let prop;

            if (type < 0.7) {
                prop = this.treeGeo.clone();
            } else {
                prop = this.bushGeo.clone();
                prop.position.y = 0.45;
            }

            prop.position.z = -Math.random() * 450;

            const side = Math.random() > 0.5 ? 1 : -1;
            const dist = 12 + Math.random() * 35;

            prop.position.x = side * dist;
            prop.rotation.y = Math.random() * Math.PI * 2;

            const s = 0.85 + Math.random() * 0.4;
            prop.scale.set(s, s, s);

            this.scene.add(prop);
            this.props.push(prop);
        }
    }

    update(dt, speed) {
        const move = speed * dt;

        this.props.forEach(p => {
            p.position.z += move;
            if (p.position.z > 25) {
                p.position.z = -450;

                const side = Math.random() > 0.5 ? 1 : -1;
                p.position.x = side * (12 + Math.random() * 35);
            }
        });
    }
}
