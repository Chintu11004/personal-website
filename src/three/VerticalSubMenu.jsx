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
  depthSelectOffsetX: -0.45,
  depthUnselectOffsetX: -0.2
};

const SUB_SELECTION = {
  selectedScale: 1.1,
  unselectedScale: 0.95,
  depthUnselectedScale: 0.55,
  labelSelectedOpacity: SELECTION.selectedOpacity,
  labelUnselectedOpacity: SELECTION.unselectedOpacity,
  depthUnselectedLabelOpacity: 0,
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
    prev.focusColRef === next.focusColRef &&
    prev.navDepthRef === next.navDepthRef &&
    prev.shaders === next.shaders
  );
}

const SubItem = memo(function SubItem({
  index,
  item,
  colIndex,
  masterOpacity,
  focusSubRowRef,
  focusColRef,
  navDepthRef,
  shaders,
}) {
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

  const { step, applyInitial } = useSelectionAnimation({
    meshRef,
    materialRef,
    htmlRef,
    positionRef: groupRef,
    initialPosition: { x: 0, y: initialY, z: 0 },
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
    applyInitial();
  }, [applyInitial]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    const focusSubRow = focusSubRowRef?.current?.values?.[colIndex] ?? 0;
    const isSelected = index === focusSubRow;
    const isFocusCol = (focusColRef?.current?.value ?? 0) === colIndex;
    const depth = navDepthRef?.current?.value ?? 0;
    const entered = isFocusCol && depth > 0;

    step(delta, state.camera.position, {
      isSelected,
      targetX: isSelected && entered ? LAYOUT.depthSelectOffsetX : entered ? LAYOUT.depthUnselectOffsetX : 0,
      targetY: getRowY(index - focusSubRow),
      targetScale: isSelected ? SUB_SELECTION.selectedScale : entered ? SUB_SELECTION.depthUnselectedScale : SUB_SELECTION.unselectedScale,
      targetShaderOpacity: isSelected ? SELECTION.selectedOpacity : entered ? SELECTION.depthUnselectedOpacity + 0.25 : SELECTION.unselectedOpacity,
      targetLabelOpacity: isSelected ? SUB_SELECTION.labelSelectedOpacity : entered ? SUB_SELECTION.depthUnselectedLabelOpacity : SUB_SELECTION.labelUnselectedOpacity,
    });
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
        style={{textAlign:"left", transform: 'translateY(-50%)'}}
        center
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
  focusColRef,
  navDepthRef,
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
          focusColRef={focusColRef}
          navDepthRef={navDepthRef}
          shaders={shaders}
        />
      ))}
    </>
  );
});
