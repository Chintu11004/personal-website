import { memo, Suspense, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { VerticalSubMenu } from './VerticalSubMenu';
import { IconShaderMesh } from './IconShaderMesh';
import { IconLabel } from './IconLabel';
import { useIconShaders } from './hooks/useIconShaders';
import { SELECTION, useSelectionAnimation } from './hooks/useSelectionAnimation';
import { lerp, lerpFactor } from './utils/animation';
import { getIconIntroProgress, INTRO } from './introConfig';
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
    prev.introCompleteRef === next.introCompleteRef &&
    prev.subMenusEnabled === next.subMenusEnabled &&
    prev.shaders === next.shaders
  );
}

const IconBody = memo(function IconBody({ index, item, groupRef, focusColRef, navDepthRef, fullscreenPanelVisibleRef, introCompleteRef, shaders }) {
  const focusCol = focusColRef.current?.value ?? 0;
  const colOffset = index - focusCol;
  const isSelected = index === focusCol;
  const initialPosition = new THREE.Vector3(
    (colOffset * LAYOUT.spacing) - 0.69,
    LAYOUT.verticalOffset,
    0
  );
  const baseScale = isSelected ? SELECTION.selectedScale : SELECTION.unselectedScale;
  const iconIntroOpacity = useRef(0);
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
    initialScale: baseScale * INTRO.iconScaleStart,
    initialShaderOpacity: 0,
    initialLabelOpacity: 0,
    masterOpacity: iconIntroOpacity,
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
    const { opacity: introOpacity, scale: introScale } = introCompleteRef?.current
      ? { opacity: 1, scale: 1 }
      : getIconIntroProgress(state.clock.elapsedTime, index);

    iconIntroOpacity.current = introOpacity;

    targetPosition.current.set((colOffset * LAYOUT.spacing) - 0.64, LAYOUT.verticalOffset, 0);

    currentPosition.current.x = lerp(currentPosition.current.x, targetPosition.current.x, t);
    currentPosition.current.y = lerp(currentPosition.current.y, targetPosition.current.y, t);
    currentPosition.current.z = lerp(currentPosition.current.z, targetPosition.current.z, t);

    groupRef.current.position.copy(currentPosition.current);

    step(delta, state.camera.position, {
      isSelected,
      targetX: isSelected && (depth > 0) ? LAYOUT.depthSelect_OffsetX : depth > 0 ? LAYOUT.depthUnselect_OffsetX : 0,
      targetScale: (isSelected ? SELECTION.selectedScale : (depth > 0) ? SELECTION.depthUnselectedScale : SELECTION.unselectedScale) * introScale,
      targetShaderOpacity: (isSelected ? SELECTION.selectedOpacity : (depth > 0) ? SELECTION.depthUnselectedOpacity : SELECTION.unselectedOpacity) * hide,
      targetLabelOpacity: (isSelected ? SELECTION.labelSelectedOpacity : SELECTION.labelUnselectedOpacity) * hide,
    });

    if (!introCompleteRef?.current) {
      state.invalidate();
    }
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

function Icon({ index, item, focusCol, exitingCols, removingExitingCols, focusColRef, focusSubRowRef, navDepthRef, contentPanelVisibleRef, fullscreenPanelVisibleRef, introCompleteRef, subMenusEnabled, shaders }) {
  const groupRef = useRef();
  const isActive = index === focusCol;
  const isExiting = exitingCols.includes(index);
  const showSubMenu = subMenusEnabled && item.items?.length > 0 && (isActive || isExiting);

  const handleExitComplete = useCallback(() => {
    removingExitingCols(index);
  }, [removingExitingCols, index]);

  return (
    <group ref={groupRef}>
      <Suspense fallback={null}>
        <IconBody
          index={index}
          item={item}
          groupRef={groupRef}
          focusColRef={focusColRef}
          navDepthRef={navDepthRef}
          fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
          introCompleteRef={introCompleteRef}
          shaders={shaders}
        />
      </Suspense>
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
  introCompleteRef,
  subMenusEnabled,
}) {
  const shaders = useIconShaders();

  if (!shaders?.normal || !shaders?.thumbnail) return null;

  return (
    <>
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
          introCompleteRef={introCompleteRef}
          subMenusEnabled={subMenusEnabled}
          shaders={shaders}
          focusCol={focusCol}
          exitingCols={exitingCols}
          removingExitingCols={removingExitingCols}
        />
      ))}
    </>
  );
});
