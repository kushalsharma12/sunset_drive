import * as THREE from 'three';

export class SUV {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.wheels = [];
        this.frontWheelHolders = [];
        this.tailLights = [];
        this.init();
    }

    init() {
        // Rugged SUV
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x2a4a2a,
            roughness: 0.6,
            metalness: 0.3
        });
        const cabinMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.4,
            metalness: 0.5
        });
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            roughness: 0.95
        });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });

        // Tall, boxy body
        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 4.5), bodyMat);
        mainBody.position.y = 0.8;
        mainBody.castShadow = true;
        this.mesh.add(mainBody);

        // Cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 2.5), cabinMat);
        cabin.position.set(0, 1.5, -0.3);
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // Roof rack
        const rack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.05, 2.2), new THREE.MeshStandardMaterial({ color: 0x444444 }));
        rack.position.set(0, 2.0, -0.3);
        this.mesh.add(rack);

        // Bigger wheels
        const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.4, 24);
        wheelGeo.rotateZ(Math.PI / 2);

        const positions = [
            { x: -1.1, y: 0.42, z: 1.4, isFront: true },
            { x: 1.1, y: 0.42, z: 1.4, isFront: true },
            { x: -1.1, y: 0.42, z: -1.4, isFront: false },
            { x: 1.1, y: 0.42, z: -1.4, isFront: false },
        ];

        positions.forEach(pos => {
            const wheelContainer = new THREE.Group();
            wheelContainer.position.set(pos.x, pos.y, pos.z);
            this.mesh.add(wheelContainer);

            const wheelHolder = new THREE.Group();
            wheelContainer.add(wheelHolder);

            const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
            wheelMesh.castShadow = true;
            wheelHolder.add(wheelMesh);

            this.wheels.push(wheelMesh);

            if (pos.isFront) {
                this.frontWheelHolders.push(wheelHolder);
            }
        });

        // Headlights
        const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.15), lightMat);
        hlLeft.position.set(-0.8, 0.7, 2.25);
        this.mesh.add(hlLeft);

        const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.15), lightMat);
        hlRight.position.set(0.8, 0.7, 2.25);
        this.mesh.add(hlRight);

        // Spotlights
        const spotLeft = new THREE.SpotLight(0xffffaa, 11, 32, 0.5, 0.5, 1);
        spotLeft.position.set(-0.8, 0.7, 2.25);
        spotLeft.target.position.set(-0.8, 0, 11);
        this.mesh.add(spotLeft);
        this.mesh.add(spotLeft.target);

        const spotRight = new THREE.SpotLight(0xffffaa, 11, 32, 0.5, 0.5, 1);
        spotRight.position.set(0.8, 0.7, 2.25);
        spotRight.target.position.set(0.8, 0, 11);
        this.mesh.add(spotRight);
        this.mesh.add(spotRight.target);

        // Taillights (Red, emissive)
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0xff2a2a,
            emissive: 0xff2a2a,
            emissiveIntensity: 0.6
        });

        const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.15), tailMat);
        tlLeft.position.set(-0.8, 0.7, -2.25);
        this.mesh.add(tlLeft);
        this.tailLights.push(tlLeft);

        const tlRight = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.15), tailMat);
        tlRight.position.set(0.8, 0.7, -2.25);
        this.mesh.add(tlRight);
        this.tailLights.push(tlRight);

        // Rotate vehicle 180 degrees so front faces negative Z
        this.mesh.rotation.y = Math.PI;

        this.scene.add(this.mesh);
    }

    update(deltaTime, speed, steeringAngle, isBraking = false) {
        const rotationAmount = (speed * deltaTime) / 0.42;

        this.wheels.forEach(wheel => {
            wheel.rotation.x += rotationAmount;
        });

        this.frontWheelHolders.forEach(holder => {
            holder.rotation.y = steeringAngle;
        });

        // Brake lights
        const brakeIntensity = isBraking ? 2.0 : 0.6;
        this.tailLights.forEach(light => {
            light.material.emissiveIntensity = brakeIntensity;
        });

        // SUV - heavier body roll, more stable
        this.mesh.rotation.z = steeringAngle * 0.18;
        this.mesh.rotation.y = Math.PI + (steeringAngle * 0.03);

        // Slight pitch back during acceleration (heavy vehicle)
        this.mesh.rotation.x = speed * 0.001;
    }
}
