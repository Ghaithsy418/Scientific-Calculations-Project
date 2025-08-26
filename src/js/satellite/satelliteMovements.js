import * as THREE from "three";
import { EARTH_MASS, G, EARTH_RADIUS } from "../constantDistances";

export function realisticSatelliteMovements(
  deltaTime,
  earth,
  satellitePosition,
  velocity,
  satelliteModel,
  speedFactor = 1.0
) {
  const timeStep = Math.min(deltaTime * 0.01, 1 / 120);

  const toEarth = new THREE.Vector3().subVectors(
    earth.position,
    satellitePosition
  );
  const distance = toEarth.length();

  if (distance <= EARTH_RADIUS + 0.002) {
    console.log("💥 CRASH! Satellite hit Earth");
    createCrashEffect(
      satelliteModel,
      satellitePosition,
      earth.parent || satelliteModel.parent
    );

    velocity.set(0, 0, 0);
    satellitePosition.copy(
      earth.position.clone().add(new THREE.Vector3(EARTH_RADIUS + 0.002, 0, 0))
    );
    satelliteModel.position.copy(satellitePosition);

    // Make satellite disappear after crash
    setTimeout(() => {
      if (satelliteModel.parent) {
        satelliteModel.parent.remove(satelliteModel);
      }
    }, 1000);
    return;
  }

  // Remove the problematic escape detection and resetting
  // Let the satellite naturally escape if it has enough velocity
  const escapeVelocity = Math.sqrt((2 * G * EARTH_MASS) / distance);
  if (velocity.length() * speedFactor > escapeVelocity) {
    console.log("🚀 Satellite is escaping Earth's gravity!");
    // Just log it, don't reset position
  }

  const direction = toEarth.clone().normalize();

  // Physics calculation
  const accelerationMagnitude = (G * EARTH_MASS) / (distance * distance);
  const acceleration = direction.clone().multiplyScalar(accelerationMagnitude);

  // Apply speedFactor DIRECTLY to velocity (this changes the orbit physics!)
  const physicsVelocity = velocity.clone().multiplyScalar(speedFactor);

  // Simple Euler integration (more predictable than complex methods)
  velocity.add(acceleration.multiplyScalar(timeStep));
  satellitePosition.add(physicsVelocity.multiplyScalar(timeStep));

  // Update model
  satelliteModel.position.copy(satellitePosition);
  satelliteModel.lookAt(earth.position);

  // Animate solar panels
  const panel = satelliteModel.getObjectByName("SolarPanel");
  if (panel) {
    panel.rotation.y += 0.5 * deltaTime;
  }
}

// Crash effect when satellite hits Earth
function createCrashEffect(satelliteModel, position, scene) {
  if (!scene) scene = satelliteModel.parent;
  if (!scene) return;

  console.log("Creating crash effect...");

  // Create explosion particles
  const particleCount = 30;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    const particleGeometry = new THREE.SphereGeometry(
      0.001 + Math.random() * 0.002,
      4,
      4
    );
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.05, 1, 0.6), // Orange/red
      transparent: true,
      opacity: 1,
    });

    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    particle.position.copy(position);

    // Random explosion velocity
    const speed = 0.01 + Math.random() * 0.02;
    particle.userData.velocity = new THREE.Vector3(
      (Math.random() - 0.5) * speed,
      (Math.random() - 0.5) * speed,
      (Math.random() - 0.5) * speed
    );

    particles.push(particle);
    scene.add(particle);
  }

  // Animate explosion
  let explosionTime = 0;
  function animateExplosion() {
    explosionTime += 0.016;

    particles.forEach((particle) => {
      if (particle.parent) {
        particle.position.add(particle.userData.velocity);
        particle.userData.velocity.multiplyScalar(0.98); // Slow down
        particle.material.opacity = Math.max(0, 1 - explosionTime * 3);

        if (particle.material.opacity <= 0) {
          scene.remove(particle);
        }
      }
    });

    if (explosionTime < 1.0 && particles.some((p) => p.parent)) {
      requestAnimationFrame(animateExplosion);
    }
  }

  animateExplosion();
}

function createEscapeEffect(satelliteModel, position) {
  console.log("🚀 Creating escape effect...");
}

export function calculateOrbitalVelocity(orbitRadius) {
  return Math.sqrt((G * EARTH_MASS) / orbitRadius);
}

export function initializeSatelliteOrbit(
  satellitePosition,
  velocity,
  orbitRadius,
  inclination = 0
) {
  console.log(`Initializing orbit at radius: ${orbitRadius}`);

  satellitePosition.set(orbitRadius, 0, 0);

  const requiredOrbitalSpeed = calculateOrbitalVelocity(orbitRadius);

  console.log(
    `Required orbital speed for stable orbit: ${requiredOrbitalSpeed.toFixed(
      6
    )}`
  );

  velocity.set(0, 0, requiredOrbitalSpeed);

  if (inclination !== 0) {
    const rotationMatrix = new THREE.Matrix4().makeRotationX(inclination);
    satellitePosition.applyMatrix4(rotationMatrix);
    velocity.applyMatrix4(rotationMatrix);
  }

  return {
    position: satellitePosition,
    velocity: velocity,
    requiredSpeed: requiredOrbitalSpeed,
  };
}

export function getRequiredSpeedForAltitude(
  satellitePosition,
  earthMass = EARTH_MASS
) {
  const distance = satellitePosition.length();
  return calculateOrbitalVelocity(distance, earthMass);
}

// Auto-adjust speed factor based on desired orbit
export function calculateSpeedFactorForOrbit(
  currentVelocity,
  targetOrbitalVelocity
) {
  const currentSpeed = currentVelocity.length();
  if (currentSpeed === 0) return 1.0;

  return targetOrbitalVelocity / currentSpeed;
}
