export const loadingTextures = function (THREE) {
  const textureLoader = new THREE.TextureLoader();

  // Earth Textures

  // Day texture
  const earthDayTexture = textureLoader.load(
    "/textures/planets/2k_earth_daymap.jpg"
  );
  earthDayTexture.colorSpace = THREE.SRGBColorSpace;
  earthDayTexture.anisotropy = 8;

  // Night texture
  const earthNightTexture = textureLoader.load(
    "/textures/planets/2k_earth_nightmap.jpg"
  );
  earthNightTexture.colorSpace = THREE.SRGBColorSpace;
  earthNightTexture.anisotropy = 8;

  // Earth Normal Map
  const earthNormalMap = textureLoader.load(
    "/textures/planets/2k_earth_normal_map.jpg"
  );

  // Clouds Texture
  const earthCloudsTexture = textureLoader.load(
    "/textures/planets/2k_earth_clouds.jpg"
  );
  earthCloudsTexture.colorSpace = THREE.SRGBColorSpace;
  earthCloudsTexture.wrapS = THREE.RepeatWrapping;
  earthCloudsTexture.wrapT = THREE.RepeatWrapping;

  // Moon Textures
  const moonTexture = textureLoader.load("/textures/planets/moonTexture.jpg");
  moonTexture.colorSpace = THREE.SRGBColorSpace;

  // Sun Textures
  const sunTexture = textureLoader.load("/textures/planets/sunTexture.jpg");
  sunTexture.colorSpace = THREE.SRGBColorSpace;

  return {
    earthDayTexture,
    earthNightTexture,
    earthNormalMap,
    earthCloudsTexture,
    moonTexture,
    sunTexture,
  };
};
