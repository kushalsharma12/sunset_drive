import * as THREE from 'three';

export class Road {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.segmentLength = 40; // Longer segments for fewer seams
        this.numSegments = 12;
        this.roadWidth = 12;

        this.init();
    }

    init() {
        // Road Material - Smooth Asphalt
        const roadMat = new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide
        });

        // Dashed Line Material
        const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

        // Create segments
        for (let i = 0; i < this.numSegments; i++) {
            const segment = new THREE.Group();

            // Road Base
            const roadGeo = new THREE.PlaneGeometry(this.roadWidth, this.segmentLength);
            const roadMesh = new THREE.Mesh(roadGeo, roadMat);
            roadMesh.rotation.x = -Math.PI / 2;
            roadMesh.receiveShadow = true;
            segment.add(roadMesh);

            // Center Line (Dashed)
            // We create multiple dashes per segment to ensure continuity
            const dashLength = 4;
            const gapLength = 4;
            const numDashes = this.segmentLength / (dashLength + gapLength);

            for (let j = 0; j < numDashes; j++) {
                const lineGeo = new THREE.PlaneGeometry(0.3, dashLength);
                const lineMesh = new THREE.Mesh(lineGeo, lineMat);
                lineMesh.rotation.x = -Math.PI / 2;
                lineMesh.position.y = 0.02;
                // Position relative to segment center
                // Start from top (-length/2) + offset
                const zPos = -this.segmentLength / 2 + (j * (dashLength + gapLength)) + dashLength / 2;
                lineMesh.position.z = zPos;
                segment.add(lineMesh);
            }

            // Side Lines (Continuous)
            const sideLineGeo = new THREE.PlaneGeometry(0.3, this.segmentLength);

            const leftLine = new THREE.Mesh(sideLineGeo, lineMat);
            leftLine.rotation.x = -Math.PI / 2;
            leftLine.position.set(-this.roadWidth / 2 + 0.4, 0.02, 0);
            segment.add(leftLine);

            const rightLine = new THREE.Mesh(sideLineGeo, lineMat);
            rightLine.rotation.x = -Math.PI / 2;
            rightLine.position.set(this.roadWidth / 2 - 0.4, 0.02, 0);
            segment.add(rightLine);

            // Initial Position
            segment.position.z = -i * this.segmentLength;

            this.scene.add(segment);
            this.segments.push(segment);
        }
    }

    update(deltaTime, speed) {
        const moveDistance = speed * deltaTime;

        this.segments.forEach(segment => {
            segment.position.z += moveDistance;

            // Recycle segment
            if (segment.position.z > this.segmentLength) {
                // Find furthest Z
                let minZ = 0;
                this.segments.forEach(s => minZ = Math.min(minZ, s.position.z));

                // Snap exactly to the end of the line to prevent gaps
                segment.position.z = minZ - this.segmentLength;
            }
        });
    }

    // Helper for props to align (always 0 since road is straight)
    getCurveAt(z) {
        return 0;
    }
}
