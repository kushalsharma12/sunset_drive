import * as THREE from 'three';

export class SmokeSystem {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.maxParticles = 40;
        this.emissionTimer = 0;
        this.emissionRate = 0.12; // seconds between emissions

        this.init();
    }

    init() {
        // Create particle geometry (small plane)
        const particleGeo = new THREE.PlaneGeometry(0.3, 0.3);

        // Create particle material with procedural smoke texture
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        // Draw soft circular gradient for smoke
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
        gradient.addColorStop(0.5, 'rgba(160, 160, 160, 0.4)');
        gradient.addColorStop(1, 'rgba(120, 120, 120, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const smokeTexture = new THREE.CanvasTexture(canvas);

        this.particleMaterial = new THREE.MeshBasicMaterial({
            map: smokeTexture,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.NormalBlending,
            color: 0xcccccc
        });

        // Pre-create particle pool
        for (let i = 0; i < this.maxParticles; i++) {
            const particle = new THREE.Mesh(particleGeo, this.particleMaterial.clone());
            particle.visible = false;
            particle.castShadow = false;
            particle.receiveShadow = false;

            this.scene.add(particle);

            this.particles.push({
                mesh: particle,
                life: 0,
                maxLife: 0.6,
                velocity: new THREE.Vector3(),
                active: false,
                startSize: 0.2,
                endSize: 0.7
            });
        }
    }

    emit(position, speed) {
        // Find inactive particle
        const particle = this.particles.find(p => !p.active);
        if (!particle) return;

        // Activate particle
        particle.active = true;
        particle.life = 0;
        particle.maxLife = 0.5 + Math.random() * 0.3;

        // Position at exhaust
        particle.mesh.position.copy(position);
        particle.mesh.visible = true;

        // Initial size based on speed
        const speedFactor = Math.min(speed / 60, 1);
        particle.startSize = 0.15 + speedFactor * 0.1;
        particle.endSize = 0.5 + speedFactor * 0.3;
        particle.mesh.scale.set(particle.startSize, particle.startSize, 1);

        // Velocity - rise up with slight random drift
        particle.velocity.set(
            (Math.random() - 0.5) * 0.3, // Random left/right
            0.8 + Math.random() * 0.4,   // Rise up
            0.2 + speed * 0.01           // Slight backward drift based on speed
        );

        // Random rotation
        particle.mesh.rotation.z = Math.random() * Math.PI * 2;

        // Color variation
        const gray = 0.7 + Math.random() * 0.3;
        particle.mesh.material.color.setRGB(gray, gray, gray);
    }

    update(deltaTime, speed, emitterPosition) {
        // Update emission timer
        this.emissionTimer += deltaTime;

        // Determine emission rate based on speed
        let currentEmissionRate = this.emissionRate;

        if (speed < 5) {
            currentEmissionRate = 0.25; // Slow idle
        } else if (speed > 40) {
            currentEmissionRate = 0.08; // Fast driving
        }

        // Emit new particle if needed
        if (this.emissionTimer >= currentEmissionRate && speed > 0.5) {
            this.emit(emitterPosition, speed);
            this.emissionTimer = 0;
        }

        // Update all active particles
        this.particles.forEach(particle => {
            if (!particle.active) return;

            particle.life += deltaTime;

            // Check if particle should die
            if (particle.life >= particle.maxLife) {
                particle.active = false;
                particle.mesh.visible = false;
                return;
            }

            // Update position
            particle.mesh.position.add(
                particle.velocity.clone().multiplyScalar(deltaTime)
            );

            // Fade out and grow
            const lifeRatio = particle.life / particle.maxLife;
            const opacity = 0.5 * (1 - lifeRatio); // Fade from 0.5 to 0
            const size = THREE.MathUtils.lerp(particle.startSize, particle.endSize, lifeRatio);

            particle.mesh.material.opacity = opacity;
            particle.mesh.scale.set(size, size, 1);

            // Slow down velocity (drag)
            particle.velocity.multiplyScalar(0.98);

            // Rotate slightly
            particle.mesh.rotation.z += deltaTime * 0.5;
        });
    }

    dispose() {
        this.particles.forEach(particle => {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        });
        this.particles = [];
    }
}
