import { shaderMaterial } from "@react-three/drei";
import { Color, Texture, Vector3 } from "three";
import { extend } from "@react-three/fiber";

/**
 * Day/night Earth blend — the classic technique behind every three.js "realistic earth" demo:
 * sample the day (albedo) and night (city-lights) textures, blend by the sun-facing factor of
 * each fragment's normal, and add a restrained specular highlight over oceans using the
 * specular mask. The normal map contributes a cheap relief-shading multiplier rather than full
 * tangent-space perturbation, which keeps the shader small while still reading as dimensional.
 */
export const EarthMaterial = shaderMaterial(
  {
    dayMap: null as Texture | null,
    nightMap: null as Texture | null,
    specularMap: null as Texture | null,
    normalMap: null as Texture | null,
    sunDirection: new Vector3(1, 0.3, 1).normalize(),
    nightIntensity: 1.7,
    vietnamGlow: 0,
  },
  /* vertex */ `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  /* fragment */ `
    uniform sampler2D dayMap;
    uniform sampler2D nightMap;
    uniform sampler2D specularMap;
    uniform sampler2D normalMap;
    uniform vec3 sunDirection;
    uniform float nightIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 dayColor = texture2D(dayMap, vUv).rgb;
      vec3 nightColor = texture2D(nightMap, vUv).rgb;
      float spec = texture2D(specularMap, vUv).r;
      float relief = texture2D(normalMap, vUv).b;

      vec3 n = normalize(vNormal);
      float sunFactor = dot(n, normalize(sunDirection));
      float dayMix = smoothstep(-0.15, 0.22, sunFactor);

      vec3 color = mix(nightColor * nightIntensity, dayColor, dayMix);
      color *= mix(0.92, 1.0, relief);

      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      vec3 halfDir = normalize(normalize(sunDirection) + viewDir);
      float specHighlight = pow(max(dot(n, halfDir), 0.0), 70.0) * spec * dayMix;
      color += vec3(0.5, 0.55, 0.62) * specHighlight * 0.22;

      // faint terminator warmth, purely atmospheric/artistic
      float terminator = 1.0 - smoothstep(0.0, 0.35, abs(sunFactor));
      color += vec3(0.18, 0.09, 0.22) * terminator * 0.12;

      gl_FragColor = vec4(color, 1.0);
    }
  `
);

/** Restrained Fresnel rim-glow shell — no post-processing bloom pass needed. */
export const AtmosphereMaterial = shaderMaterial(
  { glowColor: new Color("#9B8BB5"), intensity: 0.9 },
  /* vertex */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  /* fragment */ `
    uniform vec3 glowColor;
    uniform float intensity;
    varying vec3 vNormal;
    void main() {
      float rim = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
      gl_FragColor = vec4(glowColor, clamp(rim * intensity, 0.0, 1.0));
    }
  `
);

extend({ EarthMaterial, AtmosphereMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    earthMaterial: Record<string, unknown>;
    atmosphereMaterial: Record<string, unknown>;
  }
}
