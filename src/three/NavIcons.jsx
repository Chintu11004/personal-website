import { Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { VerticalSubMenu } from './VerticalSubMenu';

export const navItems = [
  { label: 'User', image: '/icons/01.png' },
  { label: 'Settings', image: '/icons/02.png' },
  {
    label: 'Photo Projects',
    image: '/icons/03.png',
    items: [
      { label: 'University of Wisocnsin-Madison Campus' },
      { label: 'Dream Simulator' },
      { label: 'UW Arboretum' },
    ],
  },
  { label: 'SWE', image: '/icons/23.png' },
  {
    label: 'Games',
    image: '/icons/06.png',
    items: [
      { label: 'Tron: Jump-Man' },
      { label: 'Jungle Warriors' },
    ],
  },
  { label: 'Contact Me', image: '/icons/07.png' },
  { label: 'Friends', image: '/icons/08.png' },
];

const LAYOUT = {
  spacing: 0.33,
  verticalOffset: 0.32,
  selectedScale: 1.15,
  unselectedScale: 0.83,
};

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function Icon({ index, item, focusColRef, focusSubRowRef, shaders }) {
  const groupRef = useRef();
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  const isSelectedRef = useRef(false);
  const materialRef = useRef();
  const meshRef = useRef();
  const htmlRef = useRef();
  const targetLabelOpacity = useRef(0);
  const currentLabelOpacity = useRef(0);

  const texture = useLoader(THREE.TextureLoader, item.image);

  useEffect(() => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }, [texture]);

  useFrame((state, delta) => {
    if (!groupRef.current || !focusColRef.current) return;

    const focusCol = focusColRef.current.value;
    const isSelected = index === focusCol;
    const colOffset = index - focusCol;

    isSelectedRef.current = isSelected;
    targetLabelOpacity.current = isSelected ? 1 : 0;

    targetPosition.current.set((colOffset * LAYOUT.spacing) - 0.69, LAYOUT.verticalOffset, 0);
    targetScale.current = isSelected ? LAYOUT.selectedScale : LAYOUT.unselectedScale;

    const lerpFactor = Math.min(delta * 8, 1);

    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, lerpFactor);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, lerpFactor);
    currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, lerpFactor);

    currentScale.current = lerp(currentScale.current, targetScale.current, lerpFactor);

    groupRef.current.position.copy(currentPosition.current);
    meshRef.current.scale.setScalar(currentScale.current);

    currentLabelOpacity.current = lerp(
      currentLabelOpacity.current,
      targetLabelOpacity.current,
      lerpFactor
    );

    if (htmlRef.current) {
      htmlRef.current.style.opacity = String(currentLabelOpacity.current);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.u_selected.value = isSelected ? 1.0 : 0.0;
      materialRef.current.uniforms.u_opacity.value = isSelected ? 0.8 : 0.5;
    }

    materialRef.current.uniforms.u_cameraPosition.value.copy(state.camera.position);
  }, -1);

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[0, 0.045, 0]} renderOrder={2}>
        <planeGeometry args={[0.18, 0.18] }/>
        <shaderMaterial 
          ref={materialRef}
          vertexShader={shaders.vertex}
          fragmentShader={shaders.fragment}
          uniforms={{
            u_normData: {value: texture},
            u_opacity: {value: 0.5},
            u_selected: {value: 0.0},
            u_cameraPosition: {value: new THREE.Vector3()},
          }}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <Html ref={htmlRef} position={[0, -0.045, 0]}
        center
        style={{
          opacity: 0,
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
      {item.items?.length > 0 && (
        <VerticalSubMenu
          items={item.items}
          parentColIndex={index}
          focusColRef={focusColRef}
          focusSubRowRef={focusSubRowRef}
          shaders={shaders}
        />
      )}
    </group>
  );
}

export function NavIcons({ focusColRef, focusSubRowRef }) {
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
        <Icon
          key={index}
          index={index}
          item={item}
          focusColRef={focusColRef}
          focusSubRowRef={focusSubRowRef}
          shaders={shaders}
        />
      ))}
    </Suspense>
  );
}
