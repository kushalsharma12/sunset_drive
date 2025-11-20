import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Road } from './Road.js';
import { Car } from './Car.js';
import { Environment } from './Environment.js';

class Game {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Tone mapping for better HDR look
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    document.body.appendChild(this.renderer.domElement);

    this.clock = new THREE.Clock();

    // Game State
    this.speed = 0;
    this.maxSpeed = 60;
    this.acceleration = 30;
    this.deceleration = 15;
    this.steeringAngle = 0;
    this.maxSteeringAngle = 0.5;

    this.keys = {
      ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
      w: false, s: false, a: false, d: false
    };

    this.init();
    this.initPostProcessing();
    this.addEventListeners();
    this.animate();
  }

  init() {
    // Environment
    this.environment = new Environment(this.scene);

    // Road
    this.road = new Road(this.scene);

    // Car
    this.car = new Car(this.scene);

    // Initial Camera Position
    this.cameraOffset = new THREE.Vector3(0, 3.0, 6.5);
    this.camera.position.copy(this.car.mesh.position).add(this.cameraOffset);
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // Subtle Warm Bloom
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.35,  // lower strength
      0.4,   // radius
      0.95   // threshold
    );
    this.composer.addPass(bloomPass);

    // Output Pass for Tone Mapping
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  addEventListeners() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.composer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = true;
    });

    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.key)) this.keys[e.key] = false;
    });
  }

  updatePhysics(deltaTime) {
    // Acceleration / Deceleration
    if (this.keys.ArrowUp || this.keys.w) {
      this.speed += this.acceleration * deltaTime;
    } else if (this.keys.ArrowDown || this.keys.s) {
      this.speed -= this.acceleration * deltaTime;
    } else {
      // Drag
      if (this.speed > 0) {
        this.speed -= this.deceleration * deltaTime;
        if (this.speed < 0) this.speed = 0;
      } else if (this.speed < 0) {
        this.speed += this.deceleration * deltaTime;
        if (this.speed > 0) this.speed = 0;
      }
    }

    // Clamp speed
    this.speed = Math.max(-15, Math.min(this.maxSpeed, this.speed));

    // Steering
    const steerInput = (this.keys.ArrowRight || this.keys.d ? 1 : 0) - (this.keys.ArrowLeft || this.keys.a ? 1 : 0);

    // Reduce steering at high speeds for stability
    const steerFactor = 1 - (Math.abs(this.speed) / this.maxSpeed) * 0.6;
    const targetSteer = steerInput * this.maxSteeringAngle * steerFactor;

    // Smooth steering
    this.steeringAngle += (targetSteer - this.steeringAngle) * 8 * deltaTime;

    // Apply lateral movement to Car
    const lateralSpeed = this.speed * 0.4;
    this.car.mesh.position.x += this.steeringAngle * lateralSpeed * deltaTime;

    // Clamp Car X to road width
    this.car.mesh.position.x = Math.max(-5, Math.min(5, this.car.mesh.position.x));
  }

  updateCamera(deltaTime) {
    // Smooth follow
    const targetPos = this.car.mesh.position.clone().add(this.cameraOffset);

    // Dynamic lag based on speed (Subtle)
    targetPos.z += this.speed * 0.03;

    // Camera Shake at high speeds (Very subtle)
    if (this.speed > 30) {
      const shakeAmount = (this.speed - 30) * 0.0005;
      targetPos.x += (Math.random() - 0.5) * shakeAmount;
      targetPos.y += (Math.random() - 0.5) * shakeAmount;
    }

    this.camera.position.lerp(targetPos, 4 * deltaTime);

    // Look at car + offset ahead
    const lookAtPos = this.car.mesh.position.clone();
    lookAtPos.z -= 10; // Look ahead
    lookAtPos.x += this.steeringAngle * 1.5; // Look slightly into turn
    this.camera.lookAt(lookAtPos);

    // Tilt camera based on steering
    this.camera.rotation.z = -this.steeringAngle * 0.05;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const deltaTime = this.clock.getDelta();

    this.updatePhysics(deltaTime);

    // Update world
    this.road.update(deltaTime, this.speed);
    this.environment.update(deltaTime, this.speed); // Removed road arg as curvature is gone
    this.car.update(deltaTime, this.speed, this.steeringAngle);

    this.updateCamera(deltaTime);

    this.composer.render();
  }
}

new Game();
