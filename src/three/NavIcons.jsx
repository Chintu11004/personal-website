import { memo, Suspense, useCallback, useEffect, useRef, useState } from 'react';
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

function iconBodyPropsAreEqual(prev, next) {
  return (
    prev.index === next.index &&
    prev.item === next.item &&
    prev.groupRef === next.groupRef &&
    prev.focusColRef === next.focusColRef &&
    prev.shaders === next.shaders
  );
}

const IconBody = memo(function IconBody({ index, item, groupRef, focusColRef, shaders }) {
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  const targetScale = useRef(1);
  const currentScale = useRef(1);
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
    if (!groupRef.current || !focusColRef.current || !meshRef.current) return;

    const focusCol = focusColRef.current.value;
    const isSelected = index === focusCol;
    const colOffset = index - focusCol;

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
      materialRef.current.uniforms.u_cameraPosition.value.copy(state.camera.position);
    }
  }, -1);

  return (
    <>
      <mesh ref={meshRef} position={[0, 0.045, 0]} renderOrder={2}>
        <planeGeometry args={[0.18, 0.18]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={shaders.vertex}
          fragmentShader={shaders.fragment}
          uniforms={{
            u_normData: { value: texture },
            u_opacity: { value: 0.5 },
            u_selected: { value: 0.0 },
            u_cameraPosition: { value: new THREE.Vector3() },
          }}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
      <Html
        ref={htmlRef}
        position={[0, -0.045, 0]}
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
    </>
  );
}, iconBodyPropsAreEqual);

function Icon({ index, item, focusCol, exitingCols, removingExitingCols, focusColRef, focusSubRowRef, shaders }) {
  const groupRef = useRef();
  const isActive = index === focusCol;
  const isExiting = exitingCols.includes(index);
  const showSubMenu = item.items?.length > 0 && (isActive || isExiting);

  const handleExitComplete = useCallback(() => {
    removingExitingCols(index);
  }, [removingExitingCols, index]);

  return (
    <group ref={groupRef}>
      <IconBody
        index={index}
        item={item}
        groupRef={groupRef}
        focusColRef={focusColRef}
        shaders={shaders}
      />
      {showSubMenu && (
        <VerticalSubMenu
          items={item.items}
          colIndex={index}
          mode={isActive ? 'active' : 'exiting'}
          onExitComplete={handleExitComplete}
          focusSubRowRef={focusSubRowRef}
          shaders={shaders}
        />
      )}
    </group>
  );
}

export const NavIcons = memo(function NavIcons({
  focusCol,
  exitingCols,
  removingExitingCols,
  focusColRef,
  focusSubRowRef,
}) {
  const [shaders, setShaders] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/shaders/icon-vertex.glsl').then((res) => res.text()),
      fetch('/shaders/icon-fragment.glsl').then((res) => res.text()),
    ]).then(([vertex, fragment]) => setShaders({ vertex, fragment }));
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
          focusCol={focusCol}
          exitingCols={exitingCols}
          removingExitingCols={removingExitingCols}
        />
      ))}
    </Suspense>
  );
});
