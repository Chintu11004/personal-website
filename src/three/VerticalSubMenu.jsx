import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const LAYOUT = {
  spacing: 0.2,
  startY: -0.2,
  aboveInitialOffset: 0.4,
  iconSize: 0.12,
  iconTextGap: 0.06,
};

const DEFAULT_SUB_ICON = '/icons/dif.png';

function getRowY(rowOffset) {
  if (rowOffset >= 0) {
    return LAYOUT.startY - rowOffset * LAYOUT.spacing;
  }
  return LAYOUT.startY + LAYOUT.aboveInitialOffset + (-rowOffset - 1) * LAYOUT.spacing;
}

function lerp(start, end, t) {
  return start + (end - start) * t;
}

function SubItem({ index, item, parentColIndex, focusColRef, focusSubRowRef, shaders }) {
  const groupRef = useRef();
  const meshRef = useRef();
  const materialRef = useRef();
  const htmlRef = useRef();
  const currentOpacity = useRef(0);
  const wasActiveParent = useRef(false);

  const texture = useLoader(THREE.TextureLoader, item.image ?? DEFAULT_SUB_ICON);

  useEffect(() => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }, [texture]);

  useFrame((state, delta) => {
    if (!groupRef.current || !focusColRef.current) return;

    const focusCol = focusColRef.current.value;
    const focusSubRow = focusSubRowRef?.current?.value ?? 0;
    const isActiveParent = parentColIndex === focusCol;
    const isSelected = isActiveParent && index === focusSubRow;
    const rowOffset = isActiveParent ? index - focusSubRow : index;

    groupRef.current.position.y = getRowY(rowOffset);

    const targetOpacity = isActiveParent ? (isSelected ? 0.8 : 0.45) : 0;
    const lerpFactor = Math.min(delta * 8, 1);

    if (isActiveParent && !wasActiveParent.current) {
      currentOpacity.current = 0;
    }
    wasActiveParent.current = isActiveParent;

    if (!isActiveParent) {
      currentOpacity.current = 0;
    } else {
      currentOpacity.current = lerp(currentOpacity.current, targetOpacity, lerpFactor);
    }

    groupRef.current.visible = currentOpacity.current > 0.01;

    if (htmlRef.current) {
      htmlRef.current.style.opacity = String(currentOpacity.current);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.u_selected.value = isSelected ? 1.0 : 0.0;
      materialRef.current.uniforms.u_opacity.value = currentOpacity.current;
      materialRef.current.uniforms.u_cameraPosition.value.copy(state.camera.position);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[0, 0, 0]} renderOrder={2}>
        <planeGeometry args={[LAYOUT.iconSize, LAYOUT.iconSize]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={shaders.vertex}
          fragmentShader={shaders.fragment}
          uniforms={{
            u_normData: { value: texture },
            u_opacity: { value: 0 },
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
        position={[LAYOUT.iconSize, 0, 0]}
        style={{
          opacity: 0,
          color: 'white',
          fontSize: '13px',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          textAlign: 'left',
        }}
      >
        {item.label}
      </Html>
    </group>
  );
}

export function VerticalSubMenu({ items, parentColIndex, focusColRef, focusSubRowRef, shaders }) {
  if (!items?.length || !shaders) return null;

  return (
    <>
      {items.map((item, index) => (
        <SubItem
          key={index}
          index={index}
          item={item}
          parentColIndex={parentColIndex}
          focusColRef={focusColRef}
          focusSubRowRef={focusSubRowRef}
          shaders={shaders}
        />
      ))}
    </>
  );
}
