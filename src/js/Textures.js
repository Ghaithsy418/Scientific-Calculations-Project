export const loadingTextures = function (THREE) {
  const textureLoader = new THREE.TextureLoader();

  // Earth Textures
  const earthTexture = textureLoader.load("/textures/planets/earthTexture.jpg");
  earthTexture.colorSpace = THREE.SRGBColorSpace;

  const earthNormalMap = textureLoader.load(
    "/textures/planets/2k_earth_normal_map.tif"
  );

  // Moon Textures
  const moonTexture = textureLoader.load("/textures/planets/moonTexture.jpg");
  moonTexture.colorSpace = THREE.SRGBColorSpace;

  // Sun Textures
  const sunTexture = textureLoader.load("/textures/planets/sunTexture.jpg");
  sunTexture.colorSpace = THREE.SRGBColorSpace;

  return { earthTexture, earthNormalMap, moonTexture, sunTexture };
};
