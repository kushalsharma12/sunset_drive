import * as THREE from 'three';
import { SmokeSystem } from '../SmokeSystem.js';

export class CarA {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.wheels = [];
        this.frontWheelHolders = [];
        this.tailLights = [];

        // Exhaust system
        this.exhaustEmitter = new THREE.Group();
        this.exhaustSmoke = new SmokeSystem(scene);

        this.init();
    }

    init() {
        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x008080,
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
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });

        // Car Body
        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 4), bodyMat);
        mainBody.position.y = 0.5;
        mainBody.castShadow = true;
        this.mesh.add(mainBody);

        const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 2), cabinMat);
        cabin.position.set(0, 1.0, -0.2);
        cabin.castShadow = true;
        this.mesh.add(cabin);

        // Wheels
        const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24);
        wheelGeo.rotateZ(Math.PI / 2);

        const positions = [
            { x: -0.9, y: 0.35, z: 1.2, isFront: true },
            { x: 0.9, y: 0.35, z: 1.2, isFront: true },
            { x: -0.9, y: 0.35, z: -1.2, isFront: false },
            { x: 0.9, y: 0.35, z: -1.2, isFront: false },
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
        const hlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), lightMat);
        hlLeft.position.set(-0.6, 0.5, 2.0);
        this.mesh.add(hlLeft);

        const hlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), lightMat);
        hlRight.position.set(0.6, 0.5, 2.0);
        this.mesh.add(hlRight);

        // Spotlights
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

        // Taillights (Red, emissive)
        const tailMat = new THREE.MeshStandardMaterial({
            color: 0xff2a2a,
            emissive: 0xff2a2a,
            emissiveIntensity: 0.6
        });

        const tlLeft = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), tailMat);
        tlLeft.position.set(-0.6, 0.5, -2.0);
        this.mesh.add(tlLeft);
        this.tailLights.push(tlLeft);

        const tlRight = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.1), tailMat);
        tlRight.position.set(0.6, 0.5, -2.0);
        this.mesh.add(tlRight);
        this.tailLights.push(tlRight);

        // Exhaust emitter (rear center, below tail-lights)
        this.exhaustEmitter.position.set(0, 0.2, -2.2);
        this.mesh.add(this.exhaustEmitter);

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

        // Update exhaust smoke
        const exhaustWorldPos = new THREE.Vector3();
        this.exhaustEmitter.getWorldPosition(exhaustWorldPos);
        this.exhaustSmoke.update(deltaTime, speed, exhaustWorldPos);

        this.mesh.rotation.z = steeringAngle * 0.15;
        this.mesh.rotation.y = Math.PI + (steeringAngle * 0.05);
    }
}
