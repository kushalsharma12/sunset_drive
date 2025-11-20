import * as THREE from 'three';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.wheels = []; // For rolling (X-axis)
        this.frontWheelHolders = []; // For steering (Y-axis)

        this.init();
    }

    init() {
        // --- Materials ---
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x008080, // Teal
            roughness: 0.2,
            metalness: 0.8
        });
        const cabinMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.1,
            metalness: 0.9
        });
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.9
        });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc }); // Headlights
        const tailMat = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Taillights

        // --- Car Body ---
        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 4), bodyMat);
        mainBody.position.y = 0.5;
        mainBody.castShadow = true;
        this.mesh.add(mainBody);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 2), cabinMat);
        cabin.position.set(0, 1.0, -0.2);
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // --- Wheels ---
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
        wheelGeo.rotateZ(Math.PI / 2);

        const positions = [
            { x: -0.9, y: 0.35, z: 1.2, isFront: true },  // Front Left
            { x: 0.9, y: 0.35, z: 1.2, isFront: true },   // Front Right
            { x: -0.9, y: 0.35, z: -1.2, isFront: false }, // Rear Left
            { x: 0.9, y: 0.35, z: -1.2, isFront: false },  // Rear Right
        ];

        positions.forEach(pos => {
            // Container for the wheel (handles position)
            const wheelContainer = new THREE.Group();
            wheelContainer.position.set(pos.x, pos.y, pos.z);
            this.mesh.add(wheelContainer);

            // Holder for steering (handles Y rotation)
            const wheelHolder = new THREE.Group();
            wheelContainer.add(wheelHolder);

            // The actual wheel mesh (handles X rotation/rolling)
            const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
            wheelMesh.castShadow = true;
            wheelHolder.add(wheelMesh);

            this.wheels.push(wheelMesh);

            if (pos.isFront) {
                this.frontWheelHolders.push(wheelHolder);
            }
        });

        // --- Lights ---
        // Headlights (Meshes)
        const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), lightMat);
        hlLeft.position.set(-0.6, 0.5, 2.0);
        this.mesh.add(hlLeft);

        const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), lightMat);
        hlRight.position.set(0.6, 0.5, 2.0);
        this.mesh.add(hlRight);

        // Headlights (Spotlights)
        const spotLeft = new THREE.SpotLight(0xffffcc, 10, 30, 0.5, 0.5, 1);
        spotLeft.position.set(-0.6, 0.5, 2.0);
        spotLeft.target.position.set(-0.6, 0, 10);
        this.mesh.add(spotLeft);
        this.mesh.add(spotLeft.target);

        const spotRight = new THREE.SpotLight(0xffffcc, 10, 30, 0.5, 0.5, 1);
        spotRight.position.set(0.6, 0.5, 2.0);
        spotRight.target.position.set(0.6, 0, 10);
        this.mesh.add(spotRight);
        this.mesh.add(spotRight.target);

        // Taillights
        const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), tailMat);
        tlLeft.position.set(-0.6, 0.5, -2.0);
        this.mesh.add(tlLeft);

        const tlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), tailMat);
        tlRight.position.set(0.6, 0.5, -2.0);
        this.mesh.add(tlRight);

        // Add to scene
        this.scene.add(this.mesh);
    }

    update(deltaTime, speed, steeringAngle) {
        // Rotate wheels based on speed (Rolling)
        // Speed is units/sec. Wheel circumference = 2 * PI * 0.35 ~= 2.2
        const rotationAmount = (speed * deltaTime) / 0.35;

        this.wheels.forEach(wheel => {
            wheel.rotation.x += rotationAmount;
        });

        // Steer front wheels (Y rotation only on the holder)
        this.frontWheelHolders.forEach(holder => {
            holder.rotation.y = steeringAngle;
        });

        // Tilt body slightly when turning
        // steeringAngle positive = turning right. Body should roll left (positive Z)
        // Wait, usually turning right (positive steer) -> centrifugal force pushes left -> body rolls left (positive Z).
        // Let's stick to visual feel.
        this.mesh.rotation.z = steeringAngle * 0.15;
        this.mesh.rotation.y = steeringAngle * 0.05;
    }
}
