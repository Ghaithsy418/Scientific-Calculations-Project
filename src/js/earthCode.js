import * as THREE from "three";

function createEarth(scene) {
  // Create a sphere for Earth
  const earthGeometry = new THREE.SphereGeometry(15, 64, 64);

  // Load textures
  const textureLoader = new THREE.TextureLoader();

  // Day texture (diffuse map)
  const dayTexture = textureLoader.load(
    "/textures/planets/2k_earth_daymap.jpg",
    () => {
      console.log("Earth day texture loaded");
    }
  );
  dayTexture.colorSpace = THREE.SRGBColorSpace;
  dayTexture.anisotropy = 8;

  // Bump map for terrain
  const bumpTexture = textureLoader.load(
    "/textures/planets/2k_earth_normal_map.jpg",
    () => {
      console.log("Earth bump texture loaded");
    }
  );

  // Specular map for oceans
  const specularTexture = textureLoader.load(
    "/textures/planets/2k_earth_specular_map.jpg",
    () => {
      console.log("Earth specular texture loaded");
    }
  );

  // Create Earth material
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: dayTexture,
    bumpMap: bumpTexture,
    bumpScale: 0.05,
    specularMap: specularTexture,
    specular: new THREE.Color(0x333333),
    shininess: 25,
  });

  // Create Earth mesh
  const earthModel = new THREE.Mesh(earthGeometry, earthMaterial);
  earthModel.rotation.z = THREE.MathUtils.degToRad(23.5); // Earth's axial tilt
  earthModel.castShadow = true;
  earthModel.receiveShadow = true;
  scene.add(earthModel);

  // Create clouds layer
  const cloudsGeometry = new THREE.SphereGeometry(15.2, 64, 64);
  const cloudsTexture = textureLoader.load(
    "/textures/planets/2k_earth_clouds.jpg",
    () => {
      console.log("Earth clouds texture loaded");
    }
  );
  cloudsTexture.colorSpace = THREE.SRGBColorSpace;

  const cloudsMaterial = new THREE.MeshPhongMaterial({
    map: cloudsTexture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false,
  });
  const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
  clouds.rotation.z = THREE.MathUtils.degToRad(23.5); // Match Earth's tilt
  scene.add(clouds);

  // Create atmosphere glow
  const glowGeometry = new THREE.SphereGeometry(15.5, 32, 32);
  const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
      c: { value: 0.2 },
      p: { value: 5.5 },
      glowColor: { value: new THREE.Color(0x0077ff) },
      viewVector: { value: new THREE.Vector3(0, 0, 0) },
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
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        vec3 glow = glowColor * intensity;
        gl_FragColor = vec4(glow, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
  });

  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  scene.add(glowMesh);

  // Position for satellite to look at
  earthModel.position.set(0, 0, 0);

  return {
    getEarthModel: () => earthModel,
    update: (time, sunPosition) => {
      // Rotate the Earth
      earthModel.rotation.y = time;

      // Rotate clouds slightly faster
      clouds.rotation.y = time * 1.1;

      // Update glow effect based on camera position
      if (scene.camera) {
        glowMaterial.uniforms.viewVector.value = new THREE.Vector3().subVectors(
          scene.camera.position,
          glowMesh.position
        );
      }

      // Make the glow face away from the sun if sunPosition is provided
      if (sunPosition) {
        // Calculate direction from Earth to Sun
        const earthToSun = new THREE.Vector3()
          .subVectors(sunPosition, earthModel.position)
          .normalize();

        // Adjust glow intensity based on sun direction
        glowMaterial.uniforms.c.value =
          0.1 + 0.1 * (1 - Math.abs(earthToSun.y));
      }
    },
    position: earthModel.position,
  };
}

export { createEarth };
