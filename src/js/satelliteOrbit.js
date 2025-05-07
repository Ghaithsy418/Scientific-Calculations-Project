import * as THREE from "three";

export function createSatelliteOrbit(
  radius = 30,
  segments = 128,
  height = 0.3
) {
  const orbitPoints = [];

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    orbitPoints.push(new THREE.Vector3(x, height, z));
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const orbitLine = new THREE.LineLoop(orbitGeometry, orbitMaterial);

  return orbitLine;
}
