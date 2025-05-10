import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Satellite {
  satelliteOrbitRadius = 50;

  constructor(scene) {
    this.scene = scene;
  }

  createSatellite() {
    const gltfLoader = new GLTFLoader();
    let satelliteModel = null;
    gltfLoader.load(
      "models/satellite/scene.gltf",
      (gltf) => {
        this.satelliteModel = gltf.scene;
        this.satelliteModel.scale.set(1.2, 1.2, 1.2);
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
    return {
      satelliteModelRef: () => this.satelliteModel,
      satelliteOrbitRadius: this.satelliteOrbitRadius,
    };
  }
}
