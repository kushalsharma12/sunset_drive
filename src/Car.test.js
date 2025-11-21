import { describe, it, expect, vi } from 'vitest';
import { Car } from './Car';
import * as THREE from 'three';

describe('Car', () => {
    it('should initialize correctly', () => {
        const scene = new THREE.Scene();
        const car = new Car(scene);

        expect(car.mesh).toBeDefined();
        expect(scene.children).toContain(car.mesh);
        expect(car.wheels.length).toBe(4);
        expect(car.frontWheelHolders.length).toBe(2);
    });

    it('should update wheel rotation based on speed', () => {
        const scene = new THREE.Scene();
        const car = new Car(scene);

        // Initial rotation
        const initialRotation = car.wheels[0].rotation.x;

        // Update with speed
        const speed = 10;
        const deltaTime = 1;
        car.update(deltaTime, speed, 0);

        // Check if rotation changed
        expect(car.wheels[0].rotation.x).not.toBe(initialRotation);

        // Expected rotation: (speed * dt) / radius
        // 10 * 1 / 0.35 ~= 28.57
        const expectedRotation = initialRotation + (speed * deltaTime) / 0.35;
        expect(car.wheels[0].rotation.x).toBeCloseTo(expectedRotation, 1);
    });

    it('should steer front wheels', () => {
        const scene = new THREE.Scene();
        const car = new Car(scene);

        const steeringAngle = 0.5;
        car.update(0.1, 0, steeringAngle);

        car.frontWheelHolders.forEach(holder => {
            expect(holder.rotation.y).toBe(steeringAngle);
        });
    });

    it('should tilt body when turning', () => {
        const scene = new THREE.Scene();
        const car = new Car(scene);

        const steeringAngle = 0.5;
        car.update(0.1, 0, steeringAngle);

        // Check body roll (Z rotation)
        expect(car.mesh.rotation.z).toBeCloseTo(steeringAngle * 0.15);
        // Check body yaw (Y rotation)
        expect(car.mesh.rotation.y).toBeCloseTo(steeringAngle * 0.05);
    });
});
