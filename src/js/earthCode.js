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

  // Night texture
  const nightTexture = textureLoader.load(
    "/textures/planets/2k_earth_nightmap.jpg",
    () => {
      console.log("Earth night texture loaded");
    }
  );
  nightTexture.colorSpace = THREE.SRGBColorSpace;
  nightTexture.anisotropy = 8;

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

  // Create Earth material with custom shader to blend day and night textures
  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: {
      dayTexture: { value: dayTexture },
      nightTexture: { value: nightTexture },
      bumpTexture: { value: bumpTexture },
      bumpScale: { value: 0.05 },
      specularTexture: { value: specularTexture },
      sunDirection: { value: new THREE.Vector3(1, 0, 0) },
      dayBrightness: { value: 1.2 },
      nightBrightness: { value: 3.5 },
      ambientLight: { value: 0.2 }, // Add ambient light to make land visible
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldNormal;
      
      void main() {
        vUv = uv;
        // Transform the normal to world space
        vWorldNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D bumpTexture;
      uniform sampler2D specularTexture;
      uniform float bumpScale;
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
        
        // Apply specular highlights on the day side
        vec4 specularColor = texture2D(specularTexture, vUv);
        float specularIntensity = pow(intensity, 4.0) * specularColor.r;
        finalColor.rgb += specularIntensity * 0.5;
        
        gl_FragColor = finalColor;
      }
    `,
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

  // Add texture wrapping for cloud movement
  cloudsTexture.wrapS = THREE.RepeatWrapping;
  cloudsTexture.wrapT = THREE.RepeatWrapping;

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

      // Rotate clouds slightly faster and add texture offset for wind effect
      clouds.rotation.y = time * 1.1;
      cloudsMaterial.map.offset.x = time * 0.01; // Simple cloud movement

      // Update sun direction for Earth shader
      if (sunPosition) {
        // Calculate direction from Earth to Sun in world space
        const earthToSun = new THREE.Vector3()
          .subVectors(sunPosition, earthModel.position)
          .normalize();

        // Update shader uniform with world space sun direction
        earthMaterial.uniforms.sunDirection.value.copy(earthToSun);
      }

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
