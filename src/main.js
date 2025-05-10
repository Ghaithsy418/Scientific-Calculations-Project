import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupBackgroundAudio } from "./js/audio.js";
import { createSatelliteOrbit } from "./js/atelliteOrbit.js";
import { loadingTextures } from "./js/Textures.js";
import { setupViewEvents } from "./js/viewEvents.js";
import { createEarth } from "./planets/earthCode.js";
import Moon from "./planets/Moon.js";
import Sun from "./planets/Sun.js";
import Satellite from "./js/Satellite.js";
import SatelliteOrbit from "./js/satelliteOrbit.js";

// Debug UI
const gui = new dat.GUI({ title: "GalaxiX" });

// Scene
const scene = new THREE.Scene();

/**
 * Ambient
 */
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

/*
 * Loading all Textures
 */

const { earthTexture, earthNormalMap, moonTexture, sunTexture } =
  loadingTextures(THREE);

/**
 * Satellite
 */
const satelliteObject = new Satellite(scene);
const { satelliteModelRef, satelliteOrbitRadius } =
  satelliteObject.createSatellite();

// SatelliteOrbit
const satelliteOrbit = new SatelliteOrbit(scene, satelliteOrbitRadius);
const orbitLine = satelliteOrbit.createSatelliteOrbit();
gui.add(orbitLine, "visible").name("Satellite axis helper");

/*
 * Creating the Earth
 */
const earth = createEarth(scene);

/*
 * Creating the Sun
 */

const sunObject = new Sun(scene, sunTexture);
const sun = sunObject.createSun();

/*
 * Creating the Moon
 */
const moonObject = new Moon(scene, moonTexture);
const moon = moonObject.createMoon();
const moonDistance = moonObject.getMoonDistance();

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1500
);
camera.position.set(0, 30, 100);
scene.add(camera);

// Audio
setupBackgroundAudio(camera, scene, gui);

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Render
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls
const control = new OrbitControls(camera, canvas);
control.enableDamping = true;

// Events
setupViewEvents(renderer, camera, canvas, sizes);

// Clock
const clock = new THREE.Clock();

// Animations
const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Earth movement
  earth.update(elapsedTime * 0.05, sun.position);

  // Moon orbit
  const moonAngle =
    elapsedTime * ((2 * Math.PI) / (27.3 * 86400)) * 86400 * 0.25;
  moon.position.set(
    Math.cos(moonAngle) * moonDistance,
    0,
    Math.sin(moonAngle) * moonDistance
  );

  // Make sure the moon always faces the Earth
  moon.lookAt(earth.position);

  // Satellite orbit
  const satelliteModel = satelliteModelRef();
  if (satelliteModel) {
    const satAngle = -elapsedTime * 0.05;
    const x = Math.cos(satAngle) * satelliteOrbitRadius;
    const z = Math.sin(satAngle) * satelliteOrbitRadius;
    satelliteModel.position.set(x, 0.3, z);

    // Get the Earth model from the earth object
    const earthModel = earth.getEarthModel();
    if (earthModel) {
      satelliteModel.lookAt(earthModel.position);

      // Adjust position for better orientation
      satelliteModel.position.x -= 2;
      satelliteModel.rotateY(Math.PI / 5);
    } else {
      satelliteModel.lookAt(new THREE.Vector3(0, 0, 0));
    }
  }

  control.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
