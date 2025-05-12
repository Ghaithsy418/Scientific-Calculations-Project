const EARTH_VERTEX_SHADERS = `
        varying vec2 vUv;
        varying vec3 vWorldNormal;

        void main(){
            vUv = uv;
            vWorldNormal = normalize(mat3(modelMatrix) * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `;
const EARTH_FRAGMENT_SHADERS = `
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
      `;

export { EARTH_FRAGMENT_SHADERS, EARTH_VERTEX_SHADERS };

const ATMOSPHERE_VERTEX_SHADERS = `
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
      `;
const ATMOSPHERE_FRAGMENT_SHADERS = `
        uniform float c;
        varying float intensity;
        
        void main() {
          vec3 atmosphere = vec3(0.8, 0.9, 1.0); // Slightly blue tint for better visibility
          gl_FragColor = vec4(atmosphere, intensity * 0.05); // Lower opacity for more clarity
        }
      `;

export { ATMOSPHERE_FRAGMENT_SHADERS, ATMOSPHERE_VERTEX_SHADERS };
