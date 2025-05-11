import * as THREE from "three";
import { EARTH_SUN_DISTANCE, SUN_DIAMETER } from "../js/constantDistances";

export default class Sun {
  constructor(scene, sunTexture) {
    this.scene = scene;
    this.sunTexture = sunTexture;
  }

  createSun() {
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_DIAMETER, 64, 64),
      new THREE.MeshBasicMaterial({
        map: this.sunTexture,
      })
    );
    sun.position.set(EARTH_SUN_DISTANCE, 23.5, 0);
    sun.scale.set(2, 2, 2);
    this.scene.add(sun);

    // Sun light
    const sunlight = new THREE.DirectionalLight(0xffffff, 4);
    sunlight.position.copy(sun.position);
    sunlight.castShadow = true;

    // Improving the shadow quality
    sunlight.shadow.mapSize.width = 2048;
    sunlight.shadow.mapSize.height = 2048;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 1000;

    // Increasing the shadow camera frustum
    sunlight.shadow.camera.left = -150;
    sunlight.shadow.camera.rigth = 150;
    sunlight.shadow.camera.top = 150;
    sunlight.shadow.camera.bottom = -150;

    // Reducing the shadow bias
    sunlight.shadow.bias = -0.0001;

    this.scene.add(sunlight);

    // Add a general light to prevent the native black shadows
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    this.scene.add(ambientLight);

    return sun;
  }
}
