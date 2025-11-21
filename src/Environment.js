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
        // We will use InstancedMesh for performance
        // 1. Tree Trunk
        const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
        trunkGeo.translate(0, 1, 0); // Pivot at bottom
        const trunkMat = new THREE.MeshStandardMaterial({ color: this.profile.propColors.trunk });

        // 2. Tree Leaves
        const leavesGeo = new THREE.ConeGeometry(2.1, 4.5, 8);
        leavesGeo.translate(0, 3.25, 0); // Position relative to trunk
        const leavesMat = new THREE.MeshStandardMaterial({ color: this.profile.propColors.leaves });

        // 3. Bush
        const bushGeo = new THREE.DodecahedronGeometry(0.9);
        bushGeo.translate(0, 0.45, 0); // Pivot at bottom
        const bushMat = new THREE.MeshStandardMaterial({ color: this.profile.propColors.bush });

        // Max counts
        this.maxTrees = 70;
        this.maxBushes = 30;

        this.treeTrunksMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, this.maxTrees);
        this.treeLeavesMesh = new THREE.InstancedMesh(leavesGeo, leavesMat, this.maxTrees);
        this.bushesMesh = new THREE.InstancedMesh(bushGeo, bushMat, this.maxBushes);

        this.treeTrunksMesh.castShadow = true;
        this.treeLeavesMesh.castShadow = true;
        this.bushesMesh.castShadow = true;

        this.scene.add(this.treeTrunksMesh);
        this.scene.add(this.treeLeavesMesh);
        this.scene.add(this.bushesMesh);

        // Data storage for logic
        this.treeProps = [];
        this.bushProps = [];

        // Dummy object for matrix calculation
        this.dummy = new THREE.Object3D();
    }

    spawnProps() {
        // Spawn Trees
        for (let i = 0; i < this.maxTrees; i++) {
            const prop = {
                x: 0, z: 0, s: 1, r: 0
            };
            this.resetProp(prop);
            // Spread them out initially
            prop.z = -Math.random() * 450;
            this.treeProps.push(prop);
            this.updateInstance(this.dummy, prop, i, this.treeTrunksMesh);
            this.updateInstance(this.dummy, prop, i, this.treeLeavesMesh);
        }

        // Spawn Bushes
        for (let i = 0; i < this.maxBushes; i++) {
            const prop = {
                x: 0, z: 0, s: 1, r: 0
            };
            this.resetProp(prop);
            prop.z = -Math.random() * 450;
            this.bushProps.push(prop);
            this.updateInstance(this.dummy, prop, i, this.bushesMesh);
        }
    }

    resetProp(prop) {
        prop.z = -450;
        const side = Math.random() > 0.5 ? 1 : -1;
        const dist = 12 + Math.random() * 35;
        prop.x = side * dist;
        prop.r = Math.random() * Math.PI * 2;
        prop.s = 0.85 + Math.random() * 0.4;
    }

    updateInstance(dummy, prop, index, mesh) {
        dummy.position.set(prop.x, 0, prop.z);
        dummy.rotation.y = prop.r;
        dummy.scale.set(prop.s, prop.s, prop.s);
        dummy.updateMatrix();
        mesh.setMatrixAt(index, dummy.matrix);
    }

    update(dt, speed) {
        const move = speed * dt;
        let needsUpdateTrees = false;
        let needsUpdateBushes = false;

        // Update Trees
        for (let i = 0; i < this.treeProps.length; i++) {
            const p = this.treeProps[i];
            p.z += move;
            if (p.z > 25) {
                this.resetProp(p);
            }
            // Always update matrix because they move every frame
            this.updateInstance(this.dummy, p, i, this.treeTrunksMesh);
            this.updateInstance(this.dummy, p, i, this.treeLeavesMesh);
            needsUpdateTrees = true;
        }

        // Update Bushes
        for (let i = 0; i < this.bushProps.length; i++) {
            const p = this.bushProps[i];
            p.z += move;
            if (p.z > 25) {
                this.resetProp(p);
            }
            this.updateInstance(this.dummy, p, i, this.bushesMesh);
            needsUpdateBushes = true;
        }

        if (needsUpdateTrees) {
            this.treeTrunksMesh.instanceMatrix.needsUpdate = true;
            this.treeLeavesMesh.instanceMatrix.needsUpdate = true;
        }
        if (needsUpdateBushes) {
            this.bushesMesh.instanceMatrix.needsUpdate = true;
        }
    }
}
