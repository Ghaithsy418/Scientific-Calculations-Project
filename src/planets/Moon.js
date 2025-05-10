import * as THREE from "three";

export default class Moon {
  moonDistance = 78;

  constructor(scene, moonTexture) {
    this.scene = scene;
    this.moonTexture = moonTexture;
  }

  createMoon() {
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(6.7, 32, 32),
      new THREE.MeshStandardMaterial({
        map: this.moonTexture,
        roughness: 0.8,
        metalness: 0.1,
      })
    );
    moon.receiveShadow = true;
    this.scene.add(moon);
    return moon;
  }

  getMoonDistance() {
    return this.moonDistance;
  }
}
