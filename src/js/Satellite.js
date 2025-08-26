import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SatelliteOrbit from "./satelliteOrbit";
import {
  realisticSatelliteMovements,
  initializeSatelliteOrbit,
} from "./satelliteMovements";
import * as THREE from "three";
import { EARTH_RADIUS } from "./constantDistances";

export default class Satellite {
  satelliteModel = null;
  orbitLine = null;
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  orbitRadius = 0;
  earthRadius = EARTH_RADIUS;
  height = 0;
  inclination = 0;
  timeScale = 1.0;
  requiredOrbitalSpeed = 0;

  constructor(name, distance, size, scene, gui, inclination = 0) {
    this.name = name;
    this.distance = distance;
    this.size = size;
    this.scene = scene;
    this.gui = gui;
    this.inclination = inclination;
    this.orbitRadius = this.earthRadius + this.distance;

    console.log(`Creating ${name} at orbit radius: ${this.orbitRadius}`);
  }

  createSatellite() {
    this.createSimpleModel();

    // Try to load GLTF model (your original approach)
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "models/satellite/scene.glb",
      (gltf) => {
        console.log("✅ GLTF Model loaded successfully");

        // Remove simple model
        if (this.satelliteModel) {
          this.scene.remove(this.satelliteModel);
        }

        this.satelliteModel = gltf.scene;
        this.satelliteModel.scale.set(this.size, this.size, this.size);

        this.satelliteModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.satelliteModel);

        // Position the GLTF model
        this.satelliteModel.position.copy(this.position);
        this.satelliteModel.lookAt(new THREE.Vector3(0, 0, 0));

        console.log(`${this.name} GLTF model loaded and positioned`);
      },
      () => console.log("Loading satellite model..."),
      (error) => {
        console.warn(
          "GLTF model failed, keeping simple geometry:",
          error?.message
        );
      }
    );

    // Initialize stable orbit with AUTOMATIC speed calculation
    this.setupStableOrbit();

    // Position the model
    this.satelliteModel.position.copy(this.position);
    this.satelliteModel.lookAt(new THREE.Vector3(0, 0, 0));

    // Create orbit visualization
    const satelliteOrbit = new SatelliteOrbit(
      this.scene,
      this.distance,
      128,
      this.height,
      this.earthRadius,
      this.inclination
    );
    this.orbitLine = satelliteOrbit.createSatelliteOrbit();

    // Add GUI controls - speedFactor now affects real physics!
    const satelliteFolder = this.gui.addFolder(this.name);
    satelliteFolder.add(this.orbitLine, "visible").name("Show Orbit");
    satelliteFolder.add(this, "resetOrbit").name("Reset Orbit");
    satelliteFolder
      .add(this, "timeScale", 0.1, 3.0, 0.1)
      .name("Speed Factor")
      .onChange((value) => {
        console.log(`${this.name} speed factor: ${value}`);
        if (value > 1.5) {
          console.log(
            "⚠️ High speed - satellite may escape orbit or go to higher orbit!"
          );
        } else if (value < 0.7) {
          console.log(
            "⚠️ Low speed - satellite may crash into Earth or go to lower orbit!"
          );
        } else {
          console.log("✅ Speed factor in stable range");
        }
      });

    console.log(`${this.name} initialized with automatic orbital speed`);
  }

  createSimpleModel() {
    // Create satellite body
    const bodyGeometry = new THREE.BoxGeometry(0.02, 0.01, 0.03);
    const bodyMaterial = new THREE.MeshLambertMaterial({
      color: 0x888888,
      emissive: 0x111111,
    });

    this.satelliteModel = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.satelliteModel.castShadow = true;
    this.satelliteModel.receiveShadow = true;

    // Add solar panels
    const panelGeometry = new THREE.PlaneGeometry(0.06, 0.02);
    const panelMaterial = new THREE.MeshLambertMaterial({
      color: 0x0066cc,
      side: THREE.DoubleSide,
    });

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.x = -0.04;
    leftPanel.rotation.y = Math.PI / 2;
    leftPanel.name = "SolarPanel";
    this.satelliteModel.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.x = 0.04;
    rightPanel.rotation.y = Math.PI / 2;
    this.satelliteModel.add(rightPanel);

    // Add antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.001, 0.001, 0.015);
    const antennaMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.y = 0.01;
    this.satelliteModel.add(antenna);

    this.scene.add(this.satelliteModel);
  }

  setupStableOrbit() {
    // AUTOMATICALLY calculate the required orbital speed
    const orbitData = initializeSatelliteOrbit(
      this.position,
      this.velocity,
      this.orbitRadius,
      this.inclination
    );
    this.requiredOrbitalSpeed = orbitData.requiredSpeed;

    console.log(`${this.name} orbit setup:`);
    console.log(`  Radius: ${this.orbitRadius.toFixed(4)} units`);
    console.log(
      `  Required Speed: ${this.requiredOrbitalSpeed.toFixed(
        6
      )} units/time (AUTOMATIC)`
    );
    console.log(
      `  Actual Speed: ${this.velocity.length().toFixed(6)} units/time`
    );
    console.log(
      `  Altitude: ${(this.orbitRadius - this.earthRadius).toFixed(4)} units`
    );
  }

  resetOrbit() {
    console.log(`Resetting orbit for ${this.name}`);
    this.setupStableOrbit();
    if (this.satelliteModel) {
      this.satelliteModel.position.copy(this.position);
    }
  }

  animateSatellite(deltaTime, earth) {
    if (!this.satelliteModel || !earth) return;

    // Only reset if satellite is REALLY far away (like 50x Earth radius)
    // This prevents the unwanted position jumping you're experiencing
    const distanceFromEarth = this.position.distanceTo(earth.position);
    if (distanceFromEarth > this.earthRadius * 50) {
      console.log(`${this.name} went extremely far, resetting orbit`);
      this.resetOrbit();
      return;
    }

    // Use realistic physics with user's speed factor
    realisticSatelliteMovements(
      deltaTime,
      earth,
      this.position,
      this.velocity,
      this.satelliteModel,
      this.timeScale // This now affects actual orbital physics
    );
  }

  getOrbitalInfo() {
    const distance = this.position.length();
    const speed = this.velocity.length();
    const altitude = distance - this.earthRadius;

    return {
      name: this.name,
      altitude: altitude.toFixed(4),
      speed: speed.toFixed(6),
      distance: distance.toFixed(4),
    };
  }
}
