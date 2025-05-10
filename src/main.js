import * as dat from "lil-gui";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { setupBackgroundAudio } from "./js/audio.js";
import { loadingTextures } from "./js/Textures.js";
import { setupViewEvents } from "./js/viewEvents.js";
import Moon from "./planets/Moon.js";
import Sun from "./planets/Sun.js";
import Satellite from "./js/Satellite.js";
import SatelliteOrbit from "./js/satelliteOrbit.js";
import Earth from "./planets/Earth.js";

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

const {
  earthDayTexture,
  earthNightTexture,
  earthNormalMap,
  earthCloudsTexture,
  moonTexture,
  sunTexture,
} = loadingTextures(THREE);

/**
 * Satellite
 */
const satelliteObject = new Satellite(scene);
satelliteObject.createSatellite();
const satelliteOrbitRadius = satelliteObject.getSatelliteOrbitRadius();

// SatelliteOrbit
const satelliteOrbit = new SatelliteOrbit(scene, satelliteOrbitRadius);
const orbitLine = satelliteOrbit.createSatelliteOrbit();
gui.add(orbitLine, "visible").name("Satellite axis helper");

/*
 * Creating the Earth
 */

const earthObject = new Earth(
  scene,
  earthDayTexture,
  earthNightTexture,
  earthNormalMap,
  earthCloudsTexture
);
const earth = earthObject.createEarth();
earthObject.createClouds();
earthObject.createAtmosphereGlow();

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
  earthObject.updateEarth(elapsedTime * 0.05, sun.position);

  // Moon orbit
  moonObject.animateMoon(elapsedTime);

  // Make sure the moon always faces the Earth
  moon.lookAt(earth.position);

  // Satellite orbit
  satelliteObject.animateSatellite(elapsedTime * 0.05, earth);

  control.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
