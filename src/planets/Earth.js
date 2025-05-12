import * as THREE from "three";
import {
  EARTH_DIAMETER,
  ATMOSPHERE_HEIGHT_FROM_EARTH,
} from "../js/constantDistances";

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
      vertexShader: `
        uniform vec3 viewVector;
        uniform float c;
        uniform float p;
        varying float intensity;
        
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(c - dot(vNormal, vNormel), p);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float c;
        varying float intensity;
        
        void main() {
          vec3 atmosphere = vec3(0.8, 0.9, 1.0); // Slightly blue tint for better visibility
          gl_FragColor = vec4(atmosphere, intensity * 0.05); // Lower opacity for more clarity
        }
      `,
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
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main(){
            vUv = uv;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform sampler2D normalMapTexture;
        uniform float normalMapScale;
        uniform vec3 sunDirection;
        uniform float dayBrightness;
        uniform float nightBrightness;
        uniform float ambientLight;

        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main() {
        // Use the world space normal for lighting calculations
        vec3 worldNormal = normalize(vWorldNormal);
        
        // Calculate how much this fragment faces the sun
        float intensity = max(0.0, dot(worldNormal, normalize(sunDirection)));
        
        // Apply smooth transition between day and night
        float dayMix = smoothstep(0.0, 0.3, intensity);
        
        // Sample textures
        vec4 dayColor = texture2D(dayTexture, vUv) * dayBrightness;
        
        // For night side, add ambient light to make land masses visible
        vec4 nightColor = texture2D(nightTexture, vUv) * nightBrightness;
        // Add a subtle version of the day texture to show land masses at night
        nightColor.rgb += texture2D(dayTexture, vUv).rgb * ambientLight;
        
        // Ensure colors don't exceed 1.0
        dayColor = min(dayColor, vec4(1.0));
        nightColor = min(nightColor, vec4(1.0));
        
        // Blend between day and night based on sun direction
        vec4 finalColor = mix(nightColor, dayColor, dayMix);
        
        gl_FragColor = finalColor;
      }
      `,
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
