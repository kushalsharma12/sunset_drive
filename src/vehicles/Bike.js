import * as THREE from 'three';

export class Bike {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.wheels = [];
        this.frontWheelHolders = [];
        this.tailLights = [];
        this.init();
    }

    init() {
        // Motorcycle
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        const seatMat = new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            roughness: 0.7
        });
        const wheelMat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0.9
        });
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Narrow body
        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 2.5), bodyMat);
        mainBody.position.y = 0.6;
        mainBody.castShadow = true;
        this.mesh.add(mainBody);

        // Seat
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.8), seatMat);
        seat.position.set(0, 0.85, -0.3);
        this.mesh.add(seat);

        // Handlebars
        const handlebar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.05), bodyMat);
        handlebar.position.set(0, 0.9, 0.8);
        this.mesh.add(handlebar);

        // Only 2 wheels for bike
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 24);
        wheelGeo.rotateZ(Math.PI / 2);

        const positions = [
            { x: 0, y: 0.35, z: 1.0, isFront: true },  // Front wheel
            { x: 0, y: 0.35, z: -1.0, isFront: false }, // Rear wheel
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

        // Single center headlight
        const headlight = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), lightMat);
        headlight.position.set(0, 0.7, 1.2);
        this.mesh.add(headlight);

        // Spotlight
        const spotlight = new THREE.SpotLight(0xffffff, 13, 28, 0.4, 0.5, 1);
        spotlight.position.set(0, 0.7, 1.2);
        spotlight.target.position.set(0, 0, 10);
        this.mesh.add(spotlight);
        this.mesh.add(spotlight.target);

        // Taillight (Red, emissive) - single center light for bike
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0xff2a2a,
            emissive: 0xff2a2a,
            emissiveIntensity: 0.6
        });

        const tailLight = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), tailMat);
        tailLight.position.set(0, 0.7, -1.2);
        this.mesh.add(tailLight);
        this.tailLights.push(tailLight);

        // Rotate vehicle 180 degrees so front faces negative Z
        this.mesh.rotation.y = Math.PI;

        this.scene.add(this.mesh);
    }

    update(deltaTime, speed, steeringAngle, isBraking = false) {
        const rotationAmount = (speed * deltaTime) / 0.35;

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

        // Bike leans when turning
        this.mesh.rotation.z = steeringAngle * 0.35;
        this.mesh.rotation.y = Math.PI + (steeringAngle * 0.08);
    }
}
