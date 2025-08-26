import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SatelliteOrbit from "./SatelliteOrbit";
import {
  realisticSatelliteMovements,
  initializeSatelliteOrbit,
} from "./satelliteMovements";
import * as THREE from "three";
import { EARTH_RADIUS } from "../constantDistances";

export default class Satellite {
  satelliteModel = null;
  orbitLine = null;
  position = new THREE.Vector3();
  velocity = new THREE.Vector3();
  orbitRadius = 0;
  earthRadius = EARTH_RADIUS;
  height = 0;
  inclination = 0;
  timeScale = 1;
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
    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      "models/satellite/scene.glb",
      (gltf) => {
        console.log("✅ GLTF Model loaded successfully");

        this.satelliteModel = gltf.scene;
        this.satelliteModel.scale.set(this.size, this.size, this.size);

        this.satelliteModel.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.scene.add(this.satelliteModel);

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

    this.setupStableOrbit();

    this.satelliteModel?.position.copy(this.position);
    this.satelliteModel?.lookAt(new THREE.Vector3(0, 0, 0));

    const satelliteOrbit = new SatelliteOrbit(
      this.scene,
      this.distance,
      128,
      this.height,
      this.earthRadius,
      this.inclination
    );
    this.orbitLine = satelliteOrbit.createSatelliteOrbit();

    this._satelliteGui(this.name, this.orbitLine, this);

    console.log(`${this.name} initialized with automatic orbital speed`);
  }

  setupStableOrbit() {
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

    const distanceFromEarth = this.position.distanceTo(earth.position);
    if (distanceFromEarth > this.earthRadius * 50) {
      console.log(`${this.name} went extremely far, resetting orbit`);
      this.resetOrbit();
      return;
    }

    realisticSatelliteMovements(
      deltaTime,
      earth,
      this.position,
      this.velocity,
      this.satelliteModel,
      this.timeScale
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

  _satelliteGui(name, orbitLine, currentSatellite) {
    const satelliteFolder = this.gui.addFolder(name);
    satelliteFolder.add(orbitLine, "visible").name("Show Orbit");
    satelliteFolder.add(currentSatellite, "resetOrbit").name("Reset Orbit");
    satelliteFolder
      .add(currentSatellite, "timeScale", 0.1, 3.0, 0.1)
      .name("Speed Factor")
      .onChange((value) => {
        console.log(`${name} speed factor: ${value}`);
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
  }
}
