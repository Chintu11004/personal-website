import { Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NURBSVolume } from 'three/examples/jsm/Addons.js';

export const navItems = [
  { label: 'User', image: '/images/retroarch.png' },
  { label: 'Settings', image: '/images/setting.png' },
  { label: 'Photo Projects', image: '/images/images.png' },
  { label: 'SWE', image: '/images/Source Code - Various.png' },
  { label: 'Games', image: '/images/default-content.png' },
  { label: 'Contact Me', image: '/images/wifi.png' },
  { label: 'Friends', image: '/images/friends.png' },
];

const LAYOUT = {
  spacing: 0.35,
  verticalOffset: 0.3,
  selectedScale: 1.15,
  unselectedScale: 0.9,
};

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function Icon({ index, item, focusColRef, shaders}) {
  const groupRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  const isSelectedRef = useRef(false);
  const materialRef = useRef();

  const texture = useLoader(THREE.TextureLoader, item.image);

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  useFrame((state, delta) => {
    if (!groupRef.current || !focusColRef.current) return;

    const focusCol = focusColRef.current.value;
    const isSelected = index === focusCol;
    const colOffset = index - focusCol;

    isSelectedRef.current = isSelected;

    targetPosition.current.set((colOffset * LAYOUT.spacing) - 0.6, LAYOUT.verticalOffset, 0);
    targetScale.current = isSelected ? LAYOUT.selectedScale : LAYOUT.unselectedScale;

    const lerpFactor = Math.min(delta * 8, 1);

    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, lerpFactor);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, lerpFactor);
    currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, lerpFactor);

    currentScale.current = lerp(currentScale.current, targetScale.current, lerpFactor);

    groupRef.current.position.copy(currentPosition.current);
    groupRef.current.scale.setScalar(currentScale.current);

    if (materialRef.current) {
      materialRef.current.uniforms.u_selected.value = isSelected ? 1.0 : 0.0;
      materialRef.current.uniforms.u_opacity.value = isSelected ? 0.8 : 0.5;
    }
  }, -1);

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.045, 0]} renderOrder={2}>
        <planeGeometry args={[0.12, 0.12] }/>
        <shaderMaterial 
          ref={materialRef}
          vertexShader={shaders.vertex}
          fragmentShader={shaders.fragment}
          uniforms={{
            u_texture: {value: texture},
            u_opacity: {value: 0.5},
            u_selected: {value: 0.0}
          }}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <Html position={[0, -0.045, 0]}
        center
        style={{
          color: 'white',
          fontSize: '14px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {item.label}
      </Html>
    </group>
  );
}

export function NavIcons({ focusColRef }) {
  const [shaders, setShaders] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/shaders/icon-vertex.glsl').then((res) => res.text()),
      fetch('/shaders/icon-fragment.glsl').then((res) => res.text()),
    ]).then(([vertex, fragment]) => setShaders({vertex, fragment}));
  }, []);

  if (!shaders) return null;

  return (
    <Suspense fallback={null}>
      {navItems.map((item, index) => (
        <Icon key={index} index={index} item={item} focusColRef={focusColRef} shaders={shaders} />
      ))}
    </Suspense>
  );
}
