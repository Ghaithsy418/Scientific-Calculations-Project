import * as THREE from "three";

export default class Moon {
  moon = null;
  moonDistance = 78;

  constructor(scene, moonTexture) {
    this.scene = scene;
    this.moonTexture = moonTexture;
  }

  createMoon() {
    this.moon = new THREE.Mesh(
      new THREE.SphereGeometry(6.7, 32, 32),
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
      Math.cos(moonAngle) * this.moonDistance,
      0,
      Math.sin(moonAngle) * this.moonDistance
    );
  }
}
