import * as THREE from "three";
import React, { useRef, Suspense, useEffect, useState, useCallback } from "react";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import glsl from "babel-plugin-glsl/macro";
import "./App.css";

const WaveShaderMaterial = shaderMaterial(
  // Uniform
  {
    uTime: 0,
    uColor: new THREE.Color(0.0, 0.0, 0.0),
    uTexture: new THREE.Texture(),
    uHover: 0.
  },
  // Vertex Shader
  glsl`
    precision mediump float;

    varying vec2 vUv;
    varying float vWave;

    uniform float uTime;
    uniform float uHover;
    #pragma glslify: snoise3 = require(glsl-noise/simplex/3d);


    void main() {
      vUv = uv;

      vec3 pos = position;
      float noiseFreq = 2.0;
      float noiseAmp = 0.1;
      vec3 noisePos = vec3(pos.x * noiseFreq + (uTime * uHover), pos.y * noiseFreq, pos.z);
      pos.z += snoise3(noisePos) * noiseAmp;
      vWave = pos.z;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);  
    }
  `,
  // Fragment Shader
  glsl`
    precision mediump float;

    uniform vec3 uColor;
    uniform float uTime;
    uniform sampler2D uTexture;

    varying vec2 vUv;
    varying float vWave;

    void main() {
      float wave = vWave * .5;
      vec3 texture = texture2D(uTexture, vUv + wave).rgb;
      gl_FragColor = vec4(texture, 1.0); 
    }
  `
);

extend({ WaveShaderMaterial });






const Wave = ({ y, x }) => {
  const [hovered, setHover] = useState(0.5)
  const hover = useCallback(() => setHover(0.5), [])
  const unhover = useCallback(() => setHover(0.0), [])
  const ref = useRef();
  const meshRef = useRef();
  useFrame(({ clock }) => (ref.current.uTime = clock.getElapsedTime()));

  const [image] = useLoader(THREE.TextureLoader, [
    "/willToon.png",
  ]);

  console.log(y)
  return (
    <mesh ref={meshRef} position={[x, y, 0]} onClick={hover} onUnhover={unhover}>
      <planeBufferGeometry args={[0.8, 0.8, 64, 64]} />
      <waveShaderMaterial uColor={"hotpink"} ref={ref} uTexture={image} uHover={hovered} />
    </mesh>
  );
};

const Scene = () => {
  return (
    <Canvas camera={{ fov: 16, position: [0, 0, 5] }}>
      <Suspense fallback={null}>
        <Wave y={-0.4} x={0} />
      </Suspense>
    </Canvas>
  );
};

const App = () => {
  return (
    <>
      <Scene />

    </>
  );
};

export default App;
