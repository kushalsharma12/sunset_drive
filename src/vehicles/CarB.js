import * as THREE from 'three';

export class CarB {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.wheels = [];
        this.frontWheelHolders = [];
        this.tailLights = [];
        this.init();
    }

    init() {
        // Sporty red car
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xff3333,
            roughness: 0.15,
            metalness: 0.9
        });
        const cabinMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.05,
            metalness: 0.95
        });
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.8
        });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Lower, wider body
        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 3.8), bodyMat);
        mainBody.position.y = 0.45;
        mainBody.castShadow = true;
        this.mesh.add(mainBody);

        // Sleek cabin
        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 1.8), cabinMat);
        cabin.position.set(0, 0.9, -0.3);
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // Spoiler
        const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.3), bodyMat);
        spoiler.position.set(0, 0.9, -1.9);
        this.mesh.add(spoiler);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.35, 24);
        wheelGeo.rotateZ(Math.PI / 2);

        const positions = [
            { x: -1.0, y: 0.32, z: 1.1, isFront: true },
            { x: 1.0, y: 0.32, z: 1.1, isFront: true },
            { x: -1.0, y: 0.32, z: -1.1, isFront: false },
            { x: 1.0, y: 0.32, z: -1.1, isFront: false },
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
        const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.12), lightMat);
        hlLeft.position.set(-0.7, 0.45, 1.9);
        this.mesh.add(hlLeft);

        const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.12), lightMat);
        hlRight.position.set(0.7, 0.45, 1.9);
        this.mesh.add(hlRight);

        // Spotlights
        const spotLeft = new THREE.SpotLight(0xffffff, 12, 35, 0.45, 0.5, 1);
        spotLeft.position.set(-0.7, 0.45, 1.9);
        spotLeft.target.position.set(-0.7, 0, 12);
        this.mesh.add(spotLeft);
        this.mesh.add(spotLeft.target);

        const spotRight = new THREE.SpotLight(0xffffff, 12, 35, 0.45, 0.5, 1);
        spotRight.position.set(0.7, 0.45, 1.9);
        spotRight.target.position.set(0.7, 0, 12);
        this.mesh.add(spotRight);
        this.mesh.add(spotRight.target);

        // Taillights (Red, emissive)
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0xff2a2a,
            emissive: 0xff2a2a,
            emissiveIntensity: 0.6
        });

        const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.12), tailMat);
        tlLeft.position.set(-0.7, 0.45, -1.9);
        this.mesh.add(tlLeft);
        this.tailLights.push(tlLeft);

        const tlRight = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.12, 0.12), tailMat);
        tlRight.position.set(0.7, 0.45, -1.9);
        this.mesh.add(tlRight);
        this.tailLights.push(tlRight);

        // Rotate vehicle 180 degrees so front faces negative Z
        this.mesh.rotation.y = Math.PI;

        this.scene.add(this.mesh);
    }

    update(deltaTime, speed, steeringAngle, isBraking = false) {
        const rotationAmount = (speed * deltaTime) / 0.32;

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

        // Sporty car - lower, sharper body movement
        this.mesh.rotation.z = steeringAngle * 0.12;
        this.mesh.rotation.y = Math.PI + (steeringAngle * 0.04);

        // Slight pitch forward during acceleration
        this.mesh.rotation.x = -speed * 0.002;
    }
}
