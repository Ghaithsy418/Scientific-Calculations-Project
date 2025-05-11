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
 * Satellite Configuration with GUI
 */
//Creating a gui Folder for SatelliteOrbits
const SatelliteOrbitsFolder = gui.addFolder("Satellites Orbits");

// Keep track of all satellites
let satellites = [];

const satelliteConfig = {
  name: "First Satellite",
  orbitRadius: 50,
  size: 0.5,
  createSatellite: function () {
    // Create new satellite with current config values
    const newSatellite = new Satellite(
      this.name,
      this.orbitRadius,
      this.size,
      scene,
      SatelliteOrbitsFolder
    );
    newSatellite.createSatellite();

    // Add to our satellites array
    satellites.push(newSatellite);
  },
};

// Add satellite controls to GUI
const satelliteFolder = gui.addFolder("Satellite Creator");
satelliteFolder.add(satelliteConfig, "name");
satelliteFolder.add(satelliteConfig, "orbitRadius", 30, 100, 5);
satelliteFolder.add(satelliteConfig, "size", 0.1, 1, 0.1);
satelliteFolder
  .add(satelliteConfig, "createSatellite")
  .name("Create New Satellite");

// Initialize the first satellite
let satelliteObject = new Satellite(
  satelliteConfig.name,
  satelliteConfig.orbitRadius,
  satelliteConfig.size,
  scene,
  SatelliteOrbitsFolder
);
satelliteObject.createSatellite();
satellites.push(satelliteObject);

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
  35,
  sizes.width / sizes.height,
  0.1,
  1e5
);
camera.position.set(0, 5, 0);
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

  moon.lookAt(earth.position);

  // Animate all satellites
  satellites.forEach((satellite, index) => {
    const speed = 0.05 + index * 0.01;
    satellite.animateSatellite(elapsedTime * speed, earth);
  });

  control.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

animate();
