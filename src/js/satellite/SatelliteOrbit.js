import * as THREE from "three";
import { MEO_ALTITUDE } from "../constantDistances";

export default class SatelliteOrbit {
  constructor(
    scene,
    radius = MEO_ALTITUDE,
    segments = 128,
    height = 0,
    earthRadius = 0.5
  ) {
    this.scene = scene;
    this.radius = radius;
    this.segments = segments;
    this.height = height;
    this.earthRadius = earthRadius;
  }

  createSatelliteOrbit() {
    const orbitPoints = [];

    const orbitRadius = this.earthRadius + this.radius;

    for (let i = 0; i <= this.segments; i++) {
      const angle = (i / this.segments) * Math.PI * 2;
      const x = Math.cos(angle) * orbitRadius;
      const z = Math.sin(angle) * orbitRadius;
      orbitPoints.push(new THREE.Vector3(x, this.height, z));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);

    this.scene.add(orbitLine);
    orbitLine.visible = true;

    return orbitLine;
  }
}
