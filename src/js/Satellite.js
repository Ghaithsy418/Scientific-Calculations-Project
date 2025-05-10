import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default class Satellite {
  satelliteOrbitRadius = 50;
  satelliteModel = null;

  constructor(scene) {
    this.scene = scene;
  }

  createSatellite() {
    const gltfLoader = new GLTFLoader();
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
  }

  animateSatellite(elapsedTime, earth) {
    if (this.satelliteModel) {
      const satAngle = -elapsedTime;
      const x = Math.cos(satAngle) * this.satelliteOrbitRadius;
      const z = Math.sin(satAngle) * this.satelliteOrbitRadius;
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

  getSatelliteOrbitRadius() {
    return this.satelliteOrbitRadius;
  }
}
