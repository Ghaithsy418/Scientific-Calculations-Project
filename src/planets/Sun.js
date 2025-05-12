import * as THREE from "three";
import { EARTH_SUN_DISTANCE, SUN_DIAMETER } from "../js/constantDistances";

export default class Sun {
  glowMaterial = null;
  sunGlow = null;

  constructor(scene, sunTexture) {
    this.scene = scene;
    this.sunTexture = sunTexture;
  }

  createSun() {
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_DIAMETER, 64, 64),
      new THREE.MeshBasicMaterial({
        map: this.sunTexture,
      })
    );
    sun.position.set(EARTH_SUN_DISTANCE, 23.5, 0);
    this.scene.add(sun);

    // Add sun glow effect
    this.createSunGlow(sun);

    // Sun light
    const sunlight = new THREE.DirectionalLight(0xffffff, 4);
    sunlight.position.copy(sun.position);
    sunlight.castShadow = true;

    // Improving the shadow quality
    sunlight.shadow.mapSize.width = 2048;
    sunlight.shadow.mapSize.height = 2048;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 1000;

    // Increasing the shadow camera frustum
    sunlight.shadow.camera.left = -150;
    sunlight.shadow.camera.rigth = 150;
    sunlight.shadow.camera.top = 150;
    sunlight.shadow.camera.bottom = -150;

    // Reducing the shadow bias
    sunlight.shadow.bias = -0.0001;

    this.scene.add(sunlight);

    // Add a general light to prevent the native black shadows
    const ambientLight = new THREE.AmbientLight(0x404040, 0.2);
    this.scene.add(ambientLight);

    return sun;
  }

  createSunGlow(sun) {
    // Create a proper sun glow using a sprite with a radial gradient texture
    const spriteMaterial = new THREE.SpriteMaterial({
      map: this.createGlowTexture(),
      color: 0xff9500, // Changed to more orange color
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });

    // Create a sprite that's much larger than the sun
    const sprite = new THREE.Sprite(spriteMaterial);
    const glowSize = SUN_DIAMETER * 5; // Increased glow size for better visibility
    sprite.scale.set(glowSize, glowSize, 1.0);
    sprite.position.copy(sun.position);
    this.scene.add(sprite);

    this.sunGlow = sprite;

    return sprite;
  }

  createGlowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext("2d");

    // Create a radial gradient
    const gradient = context.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 10, // Smaller inner radius for more intense center
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2
    );

    // Add color stops with more orange tones
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)"); // White hot center
    gradient.addColorStop(0.05, "rgba(255, 230, 160, 0.9)"); // Pale yellow
    gradient.addColorStop(0.1, "rgba(255, 150, 50, 0.7)"); // Orange
    gradient.addColorStop(0.5, "rgba(255, 100, 0, 0.3)"); // Deep orange
    gradient.addColorStop(1.0, "rgba(200, 60, 0, 0.0)"); // Reddish orange fade to transparent

    // Fill with gradient
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    return texture;
  }
}
