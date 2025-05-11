import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import SatelliteOrbit from "./satelliteOrbit";

export default class Satellite {
  satelliteModel = null;

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
            child.receiveShadow = true;
            child.castShadow = true; // Also enable casting shadows
          }
        });

        this.scene.add(this.satelliteModel);
      },
      () => console.log("Loading satellite model..."),
      (error) => console.error("Error loading satellite model:", error?.message)
    );

    //Satellite Orbit
    const satelliteOrbit = new SatelliteOrbit(this.scene, this.distance);
    const orbitLine = satelliteOrbit.createSatelliteOrbit();
    this.gui.add(orbitLine, "visible").name(this.name);
  }

  animateSatellite(elapsedTime, earth) {
    if (this.satelliteModel) {
      const satAngle = -elapsedTime;
      const x = Math.cos(satAngle) * this.distance;
      const z = Math.sin(satAngle) * this.distance;
      this.satelliteModel.position.set(x, 0.3, z);

      // Get the Earth model from the earth object
      if (earth) {
        this.satelliteModel.lookAt(earth.position);

        // Adjust position for better orientation
        this.satelliteModel.position.x -= 2;
        this.satelliteModel.rotateY(Math.PI / 5);
      } else {
        this.satelliteModel.lookAt(new THREE.Vector3(0, 0, 0));
      }
    }
  }
}
