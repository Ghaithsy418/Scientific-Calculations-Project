import * as THREE from "three";
import { EARTH_MOON_DISTANCE, MOON_DIAMETER } from "../js/constantDistances";

export default class Moon {
  moon = null;

  constructor(scene, moonTexture) {
    this.scene = scene;
    this.moonTexture = moonTexture;
  }

  createMoon() {
    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(MOON_DIAMETER, 32, 32),
      new THREE.MeshStandardMaterial({
        map: this.moonTexture,
        roughness: 0.8,
        metalness: 0.1,
      })
    );
    this.moon.receiveShadow = true;
    this.scene.add(this.moon);
    return this.moon;
  }

  animateMoon(elapsedTime) {
    const moonAngle =
      elapsedTime * ((2 * Math.PI) / (27.3 * 86400)) * 86400 * 0.25;
    this.moon.position.set(
      Math.cos(moonAngle) * EARTH_MOON_DISTANCE,
      0,
      Math.sin(moonAngle) * EARTH_MOON_DISTANCE
    );
  }
}
