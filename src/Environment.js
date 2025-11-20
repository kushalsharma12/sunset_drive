import * as THREE from 'three';

// Environment Profiles
const ENVIRONMENT_PROFILES = {
    sunset: {
        name: 'Sunset Highway',
        skyColors: {
            bottom: { r: 1.00, g: 0.65, b: 0.25 },
            mid: { r: 0.85, g: 0.45, b: 0.50 },
            top: { r: 0.10, g: 0.05, b: 0.20 }
        },
        fogColor: 0xfcb174,
        fogDensity: 0.006,
        sunColor: 0xffd8a3,
        sunOpacity: 0.65,
        sunSize: 35,
        sunPosition: { x: 0, y: 15, z: -80 },
        groundColor: 0x2a241e,
        directionalLight: { color: 0xffb26a, intensity: 1.1, position: { x: -30, y: 40, z: -50 } },
        hemisphereLight: { sky: 0xffe6cc, ground: 0x402020, intensity: 0.35 },
        propColors: { trunk: 0x5e3b22, leaves: 0x3d4a2a, bush: 0x4b5530 }
    },
    desert: {
        name: 'Desert Sunrise',
        skyColors: {
            bottom: { r: 1.00, g: 0.70, b: 0.42 },
            mid: { r: 1.00, g: 0.56, b: 0.46 },
            top: { r: 0.42, g: 0.35, b: 0.57 }
        },
        fogColor: 0xfcb178,
        fogDensity: 0.005,
        sunColor: 0xffcc88,
        sunOpacity: 0.7,
        sunSize: 40,
        sunPosition: { x: -30, y: 10, z: -70 },
        groundColor: 0xd9b28c,
        directionalLight: { color: 0xffaa66, intensity: 1.2, position: { x: -40, y: 35, z: -45 } },
        hemisphereLight: { sky: 0xffd4aa, ground: 0x8b7355, intensity: 0.4 },
        propColors: { trunk: 0x8b7355, leaves: 0x6b5335, bush: 0x8b7355 }
    },
    mountains: {
        name: 'Mountain Afternoon',
        skyColors: {
            bottom: { r: 0.91, g: 0.95, b: 1.00 },
            mid: { r: 0.67, g: 0.83, b: 1.00 },
            top: { r: 0.53, g: 0.81, b: 0.92 }
        },
        fogColor: 0xbcd8ff,
        fogDensity: 0.004,
        sunColor: 0xffffee,
        sunOpacity: 0.8,
        sunSize: 30,
        sunPosition: { x: 20, y: 40, z: -60 },
        groundColor: 0x4a6a4a,
        directionalLight: { color: 0xffffdd, intensity: 1.4, position: { x: 25, y: 50, z: -40 } },
        hemisphereLight: { sky: 0xaaddff, ground: 0x3a5a3a, intensity: 0.5 },
        propColors: { trunk: 0x3a2a1a, leaves: 0x1a3a1a, bush: 0x2a4a2a }
    },
    beach: {
        name: 'Beach Sunset',
        skyColors: {
            bottom: { r: 1.00, g: 0.67, b: 0.33 },
            mid: { r: 1.00, g: 0.53, b: 0.60 },
            top: { r: 0.60, g: 0.40, b: 0.80 }
        },
        fogColor: 0xffbb88,
        fogDensity: 0.007,
        sunColor: 0xffdd77,
        sunOpacity: 0.75,
        sunSize: 38,
        sunPosition: { x: 0, y: 8, z: -75 },
        groundColor: 0xe8d4b8,
        directionalLight: { color: 0xffaa55, intensity: 1.15, position: { x: -20, y: 30, z: -55 } },
        hemisphereLight: { sky: 0xffddaa, ground: 0x8b7355, intensity: 0.4 },
        propColors: { trunk: 0x6b4a2a, leaves: 0x4a6a2a, bush: 0x5a7a3a }
    },
    night: {
        name: 'Night Highway',
        skyColors: {
            bottom: { r: 0.10, g: 0.10, b: 0.18 },
            mid: { r: 0.06, g: 0.06, b: 0.12 },
            top: { r: 0.02, g: 0.02, b: 0.06 }
        },
        fogColor: 0x2a2a3a,
        fogDensity: 0.008,
        sunColor: 0xaaccff,
        sunOpacity: 0.0,
        sunSize: 25,
        sunPosition: { x: 0, y: 50, z: -80 },
        groundColor: 0x1a1a1a,
        directionalLight: { color: 0x8899bb, intensity: 0.4, position: { x: -20, y: 60, z: -30 } },
        hemisphereLight: { sky: 0x4455aa, ground: 0x0a0a0a, intensity: 0.2 },
        propColors: { trunk: 0x1a1a1a, leaves: 0x0a1a0a, bush: 0x1a2a1a }
    }
};

export class Environment {
    constructor(scene, type = 'sunset') {
        this.scene = scene;
        this.type = type;
        this.profile = ENVIRONMENT_PROFILES[type] || ENVIRONMENT_PROFILES.sunset;
        this.props = [];
        this.init();
    }

    init() {
        // SKY - Dynamic gradient based on profile
        const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

        const p = this.profile.skyColors;
        const fragmentShader = `
      varying vec2 vUv;
      void main() {
        vec3 topColor    = vec3(${p.top.r}, ${p.top.g}, ${p.top.b});
        vec3 midColor    = vec3(${p.mid.r}, ${p.mid.g}, ${p.mid.b});
        vec3 bottomColor = vec3(${p.bottom.r}, ${p.bottom.g}, ${p.bottom.b});

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

        // FOG
        this.scene.fog = new THREE.FogExp2(this.profile.fogColor, this.profile.fogDensity);

        // SUN
        if (this.profile.sunOpacity > 0) {
            const sunGeo = new THREE.CircleGeometry(this.profile.sunSize, 64);
            const sunMat = new THREE.MeshBasicMaterial({
                color: this.profile.sunColor,
                transparent: true,
                opacity: this.profile.sunOpacity
            });
            this.sun = new THREE.Mesh(sunGeo, sunMat);
            this.sun.position.set(
                this.profile.sunPosition.x,
                this.profile.sunPosition.y,
                this.profile.sunPosition.z
            );
            this.scene.add(this.sun);
        }

        // LIGHTING
        const hemi = new THREE.HemisphereLight(
            this.profile.hemisphereLight.sky,
            this.profile.hemisphereLight.ground,
            this.profile.hemisphereLight.intensity
        );
        this.scene.add(hemi);

        const dir = new THREE.DirectionalLight(
            this.profile.directionalLight.color,
            this.profile.directionalLight.intensity
        );
        dir.position.set(
            this.profile.directionalLight.position.x,
            this.profile.directionalLight.position.y,
            this.profile.directionalLight.position.z
        );
        dir.castShadow = true;
        dir.shadow.bias = -0.0002;
        dir.shadow.mapSize.width = 2048;
        dir.shadow.mapSize.height = 2048;
        this.scene.add(dir);

        // GROUND
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(2000, 2000),
            new THREE.MeshStandardMaterial({
                color: this.profile.groundColor,
                roughness: 0.95
            })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.25;
        this.scene.add(ground);

        // PROPS
        this.prepareProps();
        this.spawnProps();
    }

    prepareProps() {
        // Tree
        this.treeGeo = new THREE.Group();

        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.3, 0.4, 2, 8),
            new THREE.MeshStandardMaterial({ color: this.profile.propColors.trunk })
        );
        trunk.position.y = 1;
        trunk.castShadow = true;
        this.treeGeo.add(trunk);

        const leaves = new THREE.Mesh(
            new THREE.ConeGeometry(2.1, 4.5, 8),
            new THREE.MeshStandardMaterial({ color: this.profile.propColors.leaves })
        );
        leaves.position.y = 3.25;
        leaves.castShadow = true;
        this.treeGeo.add(leaves);

        // Bush
        this.bushGeo = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.9),
            new THREE.MeshStandardMaterial({ color: this.profile.propColors.bush })
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
