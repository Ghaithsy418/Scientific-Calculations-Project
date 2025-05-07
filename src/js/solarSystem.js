import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export function setupSolarSystem(
  scene,
  earthTexture,
  earthNormalMap,
  moonTexture,
  sunTexture
) {
  // Moon
  const moonDistance = 78;
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(6.7, 32, 32),
    new THREE.MeshStandardMaterial({
      map: moonTexture,
      roughness: 0.8,
      metalness: 0.1,
    })
  );
  moon.receiveShadow = true;
  scene.add(moon);

  // Satellite
  const satelliteOrbitRadius = 50;
  const gltfLoader = new GLTFLoader();
  let satelliteModel = null;
  gltfLoader.load(
    "models/satellite/scene.gltf",
    (gltf) => {
      satelliteModel = gltf.scene;
      satelliteModel.scale.set(1.2, 1.2, 1.2);

      satelliteModel.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true;
        }
      });

      scene.add(satelliteModel);
    },
    () => {
      console.log("Loading");
    },
    (error) => {
      console.error("Error loading satellite:", error);
    }
  );

  return {
    moon,
    satelliteModelRef: () => satelliteModel,
    satelliteOrbitRadius,
    moonDistance,
  };
}
