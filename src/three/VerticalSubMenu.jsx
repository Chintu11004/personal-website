import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { IconShaderMesh } from './IconShaderMesh';
import { IconLabel } from './IconLabel';
import { SELECTION, useSelectionAnimation } from './hooks/useSelectionAnimation';
import { lerp, lerpFactor } from './utils/animation';

const LAYOUT = {
  spacing: 0.2,
  startY: -0.2,
  aboveInitialOffset: 0.4,
  iconSize: 0.12,
  iconTextGap: 0.06,
};

const SUB_SELECTION = {
  selectedScale: 1.1,
  unselectedScale: 0.95,
  labelSelectedOpacity: SELECTION.selectedOpacity,
  labelUnselectedOpacity: SELECTION.unselectedOpacity,
};

const DEFAULT_SUB_ICON = '/icons/dif.png';

function getRowY(rowOffset) {
  if (rowOffset >= 0) {
    return LAYOUT.startY - rowOffset * LAYOUT.spacing;
  }
  return LAYOUT.startY + LAYOUT.aboveInitialOffset + (-rowOffset - 1) * LAYOUT.spacing;
}

function subItemPropsAreEqual(prev, next) {
  return (
    prev.index === next.index &&
    prev.item === next.item &&
    prev.colIndex === next.colIndex &&
    prev.masterOpacity === next.masterOpacity &&
    prev.focusSubRowRef === next.focusSubRowRef &&
    prev.shaders === next.shaders
  );
}

const SubItem = memo(function SubItem({ index, item, colIndex, masterOpacity, focusSubRowRef, shaders }) {
  const focusSubRow = focusSubRowRef?.current?.values?.[colIndex] ?? 0;
  const initialY = getRowY(index - focusSubRow);
  const isSelected = index === focusSubRow;
  const initialScale = isSelected ? SUB_SELECTION.selectedScale : SUB_SELECTION.unselectedScale;
  const initialShaderOpacity = isSelected ? SELECTION.selectedOpacity : SELECTION.unselectedOpacity;
  const initialLabelOpacity = initialShaderOpacity;

  const groupRef = useRef();
  const meshRef = useRef();
  const materialRef = useRef();
  const htmlRef = useRef();
  const targetY = useRef(initialY);
  const currentY = useRef(initialY);

  const { step, applyInitial } = useSelectionAnimation({
    meshRef,
    materialRef,
    htmlRef,
    ...SUB_SELECTION,
    masterOpacity,
    initialScale,
    initialShaderOpacity,
    initialLabelOpacity,
  });

  const texture = useLoader(THREE.TextureLoader, item.image ?? DEFAULT_SUB_ICON);

  useEffect(() => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }, [texture]);

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.y = currentY.current;
    }
    applyInitial();
  }, [applyInitial]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    const focusSubRow = focusSubRowRef?.current?.values?.[colIndex] ?? 0;
    const isSelected = index === focusSubRow;

    targetY.current = getRowY(index - focusSubRow);
    currentY.current = lerp(currentY.current, targetY.current, lerpFactor(delta));
    groupRef.current.position.y = currentY.current;

    step(isSelected, delta, state.camera.position);
  });

  return (
    <group ref={groupRef}>
      <IconShaderMesh
        texture={texture}
        shaders={shaders}
        size={LAYOUT.iconSize}
        meshRef={meshRef}
        materialRef={materialRef}
        initialOpacity={0}
      />
      <IconLabel
        label={item.label}
        position={[LAYOUT.iconSize, 0, 0]}
        htmlRef={htmlRef}
        fontSize="13px"
        style={{ textAlign: 'left' }}
      />
    </group>
  );
}, subItemPropsAreEqual);

export const VerticalSubMenu = memo(function VerticalSubMenu({
  items,
  colIndex,
  mode,
  onExitComplete,
  focusSubRowRef,
  shaders,
}) {
  const masterOpacity = useRef(mode === 'active' ? 0 : 1);
  const didComplete = useRef(false);

  useFrame((_, delta) => {
    const target = mode === 'active' ? 1 : 0;
    masterOpacity.current = lerp(masterOpacity.current, target, lerpFactor(delta));

    if (mode === 'exiting' && masterOpacity.current <= 0.01 && !didComplete.current) {
      didComplete.current = true;
      onExitComplete?.();
    }
  });

  if (!items?.length || !shaders) return null;

  return (
    <>
      {items.map((item, index) => (
        <SubItem
          key={index}
          index={index}
          item={item}
          colIndex={colIndex}
          masterOpacity={masterOpacity}
          focusSubRowRef={focusSubRowRef}
          shaders={shaders}
        />
      ))}
    </>
  );
});
