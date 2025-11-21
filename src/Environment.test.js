import { describe, it, expect, vi } from 'vitest';
import { Environment } from './Environment';
import * as THREE from 'three';

describe('Environment', () => {
    it('should initialize with default sunset profile', () => {
        const scene = new THREE.Scene();
        const env = new Environment(scene, 'sunset');
        expect(env.type).toBe('sunset');
        expect(env.profile.name).toBe('Sunset Highway');

        // Check if objects were added to the scene
        // We expect: Sky, Sun, HemiLight, DirLight, Ground, + 3 InstancedMeshes (Trunks, Leaves, Bushes)
        // Total around 8 children.

        expect(scene.children.length).toBeGreaterThan(5);
        expect(scene.children.length).toBeLessThan(20);
    });

    it('should fallback to sunset if invalid profile is provided', () => {
        const scene = new THREE.Scene();
        const env = new Environment(scene, 'invalid_profile');

        expect(env.profile.name).toBe('Sunset Highway');
    });
});
