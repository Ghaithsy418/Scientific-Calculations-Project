import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SatelliteOrbit from "./satelliteOrbit";
import * as THREE from "three";
import { G } from "./constantDistances";

export default class Satellite {
  satelliteModel = null;
  orbitLine = null;
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  orbitRadius = 0;
  earthRadius = 0.5;
  height = 0;
  speedFactor = 1;
  maxDistanceFactor = 10;

  constructor(name, distance, size, scene, gui) {
    this.name = name;
    this.distance = distance;
    this.size = size;
    this.scene = scene;
    this.gui = gui;
  }

  createSatellite() {
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "models/satellite/scene.gltf",
      (gltf) => {
        this.satelliteModel = gltf.scene;
        this.satelliteModel.scale.set(this.size, this.size, this.size);

        this.satelliteModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.satelliteModel);

        this.orbitRadius = this.earthRadius + this.distance;
        this.position.set(this.orbitRadius, this.height, 0);

        const orbitalSpeed = Math.sqrt(
          (G * this.earthRadius) / this.orbitRadius
        );
        this.velocity.set(0, 0, orbitalSpeed);

        this.satelliteModel.position.copy(this.position);
        this.satelliteModel.lookAt(new THREE.Vector3(0, 0, 0));
      },
      () => console.log("Loading satellite model..."),
      (error) => console.error("Error loading satellite model:", error?.message)
    );

    const satelliteOrbit = new SatelliteOrbit(
      this.scene,
      this.distance,
      128,
      this.height,
      this.earthRadius
    );
    this.orbitLine = satelliteOrbit.createSatelliteOrbit();
    this.gui.add(this.orbitLine, "visible").name(this.name);

    this.gui.add(this, "speedFactor", 0.1, 5).name("Speed Factor");
  }

  animateSatellite(deltaTime, earth) {
    if (!this.satelliteModel || !earth) return;

    const toEarth = new THREE.Vector3().subVectors(
      earth.position,
      this.position
    );
    const distance = toEarth.length();
    const direction = toEarth.clone().normalize();

    if (this.velocity.length() === 0) {
      this.position.copy(earth.position);
    } else if (distance <= 0) {
      this.position.copy(earth.position);
      this.velocity.set(0, 0, 0);
    } else {
      const accelerationMagnitude =
        (G * this.earthRadius) / (distance * distance);
      const acceleration = direction
        .clone()
        .multiplyScalar(accelerationMagnitude);
      this.velocity.add(acceleration.multiplyScalar(deltaTime));

      this.position.add(
        this.velocity.clone().multiplyScalar(deltaTime * this.speedFactor)
      );
    }

    this.satelliteModel.position.copy(this.position);
    this.satelliteModel.lookAt(earth.position);

    if (this.satelliteModel.getObjectByName("SolarPanel")) {
      const panel = this.satelliteModel.getObjectByName("SolarPanel");
      panel.rotation.y += 0.02;
    }
  }
}
