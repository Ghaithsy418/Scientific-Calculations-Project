import * as THREE from "three";

export default class SatelliteOrbit {
  constructor(scene, radius = 30, segments = 128, height = 0.3) {
    this.scene = scene;
    this.radius = radius;
    this.segments = segments;
    this.height = height;
  }

  createSatelliteOrbit() {
    const orbitPoints = [];

    for (let i = 0; i <= this.segments; i++) {
      const angle = (i / this.segments) * Math.PI * 2;
      const x = Math.cos(angle) * this.radius;
      const z = Math.sin(angle) * this.radius;
      orbitPoints.push(new THREE.Vector3(x, this.height, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);

    this.scene.add(orbitLine);
    orbitLine.visible = false;

    return orbitLine;
  }
}
