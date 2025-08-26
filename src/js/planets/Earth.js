import * as THREE from "three";
import {
  ATMOSPHERE_HEIGHT_FROM_EARTH,
  EARTH_DIAMETER,
} from "../js/constantDistances";
import {
  ATMOSPHERE_FRAGMENT_SHADERS,
  ATMOSPHERE_VERTEX_SHADERS,
  EARTH_FRAGMENT_SHADERS,
  EARTH_VERTEX_SHADERS,
} from "./EarthShaders";

export default class Earth {
  earth = null;
  clouds = null;
  glow = null;

  constructor(
    scene,
    earthDayTexture,
    earthNightTexture,
    earthNormalMap,
    earthCloudsTexture
  ) {
    this.scene = scene;
    this.earthDayTexture = earthDayTexture;
    this.earthNightTexture = earthNightTexture;
    this.earthNormalMap = earthNormalMap;
    this.earthCloudsTexture = earthCloudsTexture;
  }

  createClouds() {
    const cloudsGeometry = new THREE.SphereGeometry(
      EARTH_DIAMETER + 0.002,
      64,
      64
    );
    const cloudsMaterial = new THREE.MeshPhongMaterial({
      map: this.earthCloudsTexture,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    this.clouds.rotation.z = THREE.MathUtils.degToRad(23.5);
    this.scene.add(this.clouds);
  }

  createAtmosphereGlow() {
    // Calculate atmosphere size based on Earth diameter and atmosphere height
    const atmosphereSize = ATMOSPHERE_HEIGHT_FROM_EARTH;

    // Create atmosphere geometry
    const atmosphereGeometry = new THREE.SphereGeometry(atmosphereSize, 64, 64);

    // Create shader material for atmosphere
    const atmosphereMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 10 },
        p: { value: 2.0 },
        viewVector: { value: new THREE.Vector3(0, 0, 1) },
      },
      vertexShader: ATMOSPHERE_VERTEX_SHADERS,
      fragmentShader: ATMOSPHERE_FRAGMENT_SHADERS,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });

    // Create atmosphere mesh
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    atmosphere.position.copy(
      this.earth ? this.earth.position : new THREE.Vector3(0, 0, 0)
    );

    // Add atmosphere to scene
    this.scene.add(atmosphere);

    // Store reference to atmosphere
    this.atmosphere = atmosphere;

    // Also store it as glow since that's what updateEarth is looking for
    this.glow = atmosphere;

    return atmosphere;
  }

  createEarth() {
    const earthGeometry = new THREE.SphereGeometry(EARTH_DIAMETER, 64, 64);
    const earthMaterial = new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: this.earthDayTexture },
        nightTexture: { value: this.earthNightTexture },
        normalMapTexture: { value: this.earthNormalMap },
        normalMapScale: { value: 0.05 },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) },
        dayBrightness: { value: 1.2 },
        nightBrightness: { value: 3.5 },
        ambientLight: { value: 0.2 },
      },
      vertexShader: EARTH_VERTEX_SHADERS,
      fragmentShader: EARTH_FRAGMENT_SHADERS,
    });

    this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
    this.earth.rotation.z = THREE.MathUtils.degToRad(23.5);
    this.earth.castShadow = true;
    this.earth.receiveShadow = true;

    this.scene.add(this.earth);

    return this.earth;
  }

  updateEarth(time, sunPosition) {
    this.earth.rotation.y = time;
    this.clouds.rotation.y = time * 1.1;
    this.clouds.material.map.offset.x = time * 0.01;

    if (sunPosition) {
      const earthToSun = new THREE.Vector3()
        .subVectors(sunPosition, this.earth.position)
        .normalize();

      // Update shader uniform with world space sun direction
      this.earth.material.uniforms.sunDirection.value.copy(earthToSun);
      this.glow.material.uniforms.c.value =
        0.1 + 0.1 * (1 - Math.abs(earthToSun.y));
    }

    if (this.scene.camera) {
      this.glow.material.uniforms.viewVector.value =
        new THREE.Vector3().subVectors(
          this.scene.camera.position,
          this.glow.position
        );
    }
  }
}
