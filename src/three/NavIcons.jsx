import { memo, Suspense, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { VerticalSubMenu } from './VerticalSubMenu';
import { IconShaderMesh } from './IconShaderMesh';
import { IconLabel } from './IconLabel';
import { useIconShaders } from './hooks/useIconShaders';
import { SELECTION, useSelectionAnimation } from './hooks/useSelectionAnimation';
import { lerp, lerpFactor } from './utils/animation';
import { navItems } from './navItems';

const LAYOUT = {
  spacing: 0.33,
  verticalOffset: 0.32,
  depthSelect_OffsetX: -0.37,
  depthUnselect_OffsetX: -0.2
};

function iconBodyPropsAreEqual(prev, next) {
  return (
    prev.index === next.index &&
    prev.item === next.item &&
    prev.groupRef === next.groupRef &&
    prev.focusColRef === next.focusColRef &&
    prev.navDepthRef === next.navDepthRef &&
    prev.fullscreenPanelVisibleRef === next.fullscreenPanelVisibleRef &&
    prev.shaders === next.shaders
  );
}

const IconBody = memo(function IconBody({ index, item, groupRef, focusColRef, navDepthRef, fullscreenPanelVisibleRef, shaders }) {
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
  const contentRef = useRef();
  const materialRef = useRef();
  const meshRef = useRef();
  const htmlRef = useRef();

  const { step, applyInitial } = useSelectionAnimation({
    meshRef,
    materialRef,
    htmlRef,
    positionRef: contentRef,
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
    const depth = navDepthRef?.current?.value ?? 0;
    const hide = 1 - (fullscreenPanelVisibleRef?.current?.value ?? 0);
    const t = lerpFactor(delta);

    targetPosition.current.set((colOffset * LAYOUT.spacing) - 0.64, LAYOUT.verticalOffset, 0);

    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, t);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, t);
    currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, t);

    groupRef.current.position.copy(currentPosition.current);

    step(delta, state.camera.position, {
      isSelected,
      targetX: isSelected && (depth > 0) ? LAYOUT.depthSelect_OffsetX : depth > 0 ? LAYOUT.depthUnselect_OffsetX : 0,
      targetScale: isSelected ? SELECTION.selectedScale : (depth > 0) ? SELECTION.depthUnselectedScale : SELECTION.unselectedScale,
      targetShaderOpacity: (isSelected ? SELECTION.selectedOpacity : (depth > 0) ? SELECTION.depthUnselectedOpacity : SELECTION.unselectedOpacity) * hide,
      targetLabelOpacity: (isSelected ? SELECTION.labelSelectedOpacity : SELECTION.labelUnselectedOpacity) * hide,
    });
  }, -1);

  return (
    <group ref={contentRef}>
      <IconShaderMesh
        texture={texture}
        shaders={shaders.normal}
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
    </group>
  );
}, iconBodyPropsAreEqual);

function Icon({ index, item, focusCol, exitingCols, removingExitingCols, focusColRef, focusSubRowRef, navDepthRef, contentPanelVisibleRef, fullscreenPanelVisibleRef, shaders }) {
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
        navDepthRef={navDepthRef}
        fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
        shaders={shaders}
      />
      {showSubMenu && (
        <VerticalSubMenu
          items={item.items}
          colIndex={index}
          mode={isActive ? 'active' : 'exiting'}
          onExitComplete={handleExitComplete}
          focusSubRowRef={focusSubRowRef}
          focusColRef={focusColRef}
          navDepthRef={navDepthRef}
          contentPanelVisibleRef={contentPanelVisibleRef}
          fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
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
  navDepthRef,
  contentPanelVisibleRef,
  fullscreenPanelVisibleRef,
}) {
  const shaders = useIconShaders();

  if (!shaders?.normal || !shaders?.thumbnail) return null;

  return (
    <Suspense fallback={null}>
      {navItems.map((item, index) => (
        <Icon
          key={index}
          index={index}
          item={item}
          focusColRef={focusColRef}
          focusSubRowRef={focusSubRowRef}
          navDepthRef={navDepthRef}
          contentPanelVisibleRef={contentPanelVisibleRef}
          fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
          shaders={shaders}
          focusCol={focusCol}
          exitingCols={exitingCols}
          removingExitingCols={removingExitingCols}
        />
      ))}
    </Suspense>
  );
});
