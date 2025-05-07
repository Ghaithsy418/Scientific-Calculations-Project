import * as THREE from "three";

function createSun(scene, sunTexture) {
  // Sun
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(50, 64, 64),
    new THREE.MeshBasicMaterial({ map: sunTexture })
  );
  sun.position.set(400, 23.5, 0);
  scene.add(sun);

  // Sun light with improved shadow settings
  const sunlight = new THREE.DirectionalLight(0xffffff, 4);
  sunlight.position.copy(sun.position);
  sunlight.castShadow = true;

  // Improve shadow quality
  sunlight.shadow.mapSize.width = 2048;
  sunlight.shadow.mapSize.height = 2048;
  sunlight.shadow.camera.near = 0.5;
  sunlight.shadow.camera.far = 1000;

  // Increase shadow camera frustum to capture the satellite's shadow properly
  sunlight.shadow.camera.left = -150;
  sunlight.shadow.camera.right = 150;
  sunlight.shadow.camera.top = 150;
  sunlight.shadow.camera.bottom = -150;

  // Reduce shadow acne
  sunlight.shadow.bias = -0.0001;

  scene.add(sunlight);

  // Add a helper to visualize the shadow camera (useful for debugging)
  // const shadowHelper = new THREE.CameraHelper(sunlight.shadow.camera);
  // scene.add(shadowHelper);

  // Add a subtle ambient light to prevent completely dark shadows
  const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
  scene.add(ambientLight);

  return {
    getSunModel: () => sun,
    position: sun.position,
    getSunLight: () => sunlight,
  };
}

export { createSun };
