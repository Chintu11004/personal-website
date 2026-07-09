import { memo, Suspense, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { VerticalSubMenu } from './VerticalSubMenu';
import { IconShaderMesh } from './IconShaderMesh';
import { IconLabel } from './IconLabel';
import { useIconShaders } from './hooks/useIconShaders';
import { SELECTION, useSelectionAnimation } from './hooks/useSelectionAnimation';
import { lerp, lerpFactor } from './utils/animation';

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
};

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
  const focusCol = focusColRef.current?.value ?? 0;
  const colOffset = index - focusCol;
  const isSelected = index === focusCol;
  const initialPosition = new THREE.Vector3(
    (colOffset * LAYOUT.spacing) - 0.69,
    LAYOUT.verticalOffset,
    0
  );
  const initialScale = isSelected ? SELECTION.selectedScale : SELECTION.unselectedScale;
  const initialShaderOpacity = isSelected ? SELECTION.selectedOpacity : SELECTION.unselectedOpacity;
  const initialLabelOpacity = isSelected ? SELECTION.labelSelectedOpacity : SELECTION.labelUnselectedOpacity;

  const targetPosition = useRef(initialPosition.clone());
  const currentPosition = useRef(initialPosition.clone());
  const materialRef = useRef();
  const meshRef = useRef();
  const htmlRef = useRef();

  const { step, applyInitial } = useSelectionAnimation({
    meshRef,
    materialRef,
    htmlRef,
    initialScale,
    initialShaderOpacity,
    initialLabelOpacity,
  });

  const texture = useLoader(THREE.TextureLoader, item.image);

  useEffect(() => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }, [texture]);

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition.current);
    }
    applyInitial();
  }, [groupRef, applyInitial]);

  useFrame((state, delta) => {
    if (!groupRef.current || !focusColRef.current || !meshRef.current) return;

    const focusCol = focusColRef.current.value;
    const isSelected = index === focusCol;
    const colOffset = index - focusCol;

    targetPosition.current.set((colOffset * LAYOUT.spacing) - 0.69, LAYOUT.verticalOffset, 0);

    const t = lerpFactor(delta);
    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, t);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, t);
    currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, t);

    groupRef.current.position.copy(currentPosition.current);
    step(isSelected, delta, state.camera.position);
  }, -1);

  return (
    <>
      <IconShaderMesh
        texture={texture}
        shaders={shaders}
        size={0.18}
        position={[0, 0.045, 0]}
        meshRef={meshRef}
        materialRef={materialRef}
      />
      <IconLabel
        label={item.label}
        position={[0, -0.045, 0]}
        htmlRef={htmlRef}
        center
      />
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
  const shaders = useIconShaders();

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
