import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { IconShaderMesh } from './IconShaderMesh';
import { ThumbnailIconMesh } from './ThumbnailIconMesh';
import { IconLabel } from './IconLabel';
import { SELECTION, useSelectionAnimation } from './hooks/useSelectionAnimation';
import { lerp, lerpFactor } from './utils/animation';

const LAYOUT = {
  spacing: 0.24,
  startY: -0.27,
  aboveInitialOffset: 0.53,
  iconSize: 0.12,
  iconTextGap: 0.06,
  depthSelectOffsetX: -0.37,
  depthUnselectOffsetX: -0.17,
};

const SUB_SELECTION = {
  selectedScale: 1.1,
  unselectedScale: 0.55,
  depthUnselectedScale: 0.4,
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

function getThumbnailSize(item) {
  const base = LAYOUT.iconSize;
  const width = item.widthOfTB != null ? base * Number(item.widthOfTB) : base;
  const height = item.heightOfTB != null ? base * Number(item.heightOfTB) : base;
  return [width, height];
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
    prev.contentPanelVisibleRef === next.contentPanelVisibleRef &&
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
  contentPanelVisibleRef,
  shaders,
}) {
  const isCustomThumbnail = item.thumbnail === 'custom';
  const activeShaders = isCustomThumbnail ? shaders.thumbnail : shaders.normal;
  const thumbnailSize = isCustomThumbnail ? getThumbnailSize(item) : [LAYOUT.iconSize, LAYOUT.iconSize];
  const focusSubRow = focusSubRowRef?.current?.values?.[colIndex] ?? 0;
  const isSelected = index === focusSubRow;
  const baseLabelX = isCustomThumbnail ? thumbnailSize[0] / 2 : LAYOUT.iconTextGap;
  const initialY = getRowY(index - focusSubRow);
  const initialScale = isSelected ? SUB_SELECTION.selectedScale : SUB_SELECTION.unselectedScale;
  const initialShaderOpacity = isSelected ? SELECTION.selectedOpacity : SELECTION.unselectedOpacity;
  const initialLabelOpacity = initialShaderOpacity;

  const groupRef = useRef();
  const meshRef = useRef();
  const materialRef = useRef();
  const htmlRef = useRef();
  const labelGroupRef = useRef();
  const currentLabelX = useRef(baseLabelX);

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
    if (labelGroupRef.current) {
      labelGroupRef.current.position.set(baseLabelX, 0, 0);
    }
    currentLabelX.current = baseLabelX;
  }, [applyInitial, baseLabelX]);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    const focusSubRow = focusSubRowRef?.current?.values?.[colIndex] ?? 0;
    const isSelected = index === focusSubRow;
    const isFocusCol = (focusColRef?.current?.value ?? 0) === colIndex;
    const depth = navDepthRef?.current?.value ?? 0;
    const entered = isFocusCol && depth > 0;
    const panelVisible = contentPanelVisibleRef?.current?.value ?? 0;

    let targetLabelOpacity = isSelected
      ? SUB_SELECTION.labelSelectedOpacity
      : entered
        ? SUB_SELECTION.depthUnselectedLabelOpacity
        : SUB_SELECTION.labelUnselectedOpacity;

    const targetLabelX = baseLabelX + (isSelected ? 0.04 : 0);
    currentLabelX.current = lerp(currentLabelX.current, targetLabelX, lerpFactor(delta));

    if (labelGroupRef.current) {
      labelGroupRef.current.position.x = currentLabelX.current;
    }

    if (panelVisible > 0) {
      targetLabelOpacity *= 1 - panelVisible;
    }

    step(delta, state.camera.position, {
      isSelected,
      targetX: isSelected && entered ? LAYOUT.depthSelectOffsetX : entered ? LAYOUT.depthUnselectOffsetX : 0,
      targetY: getRowY(index - focusSubRow),
      targetScale: isSelected ? SUB_SELECTION.selectedScale : entered ? SUB_SELECTION.depthUnselectedScale : SUB_SELECTION.unselectedScale,
      targetShaderOpacity: isSelected ? SELECTION.selectedOpacity : entered ? SELECTION.depthUnselectedOpacity + 0.25 : SELECTION.unselectedOpacity,
      targetLabelOpacity,
    });
  });

  return (
    <group ref={groupRef}>
      {isCustomThumbnail ? (
        <ThumbnailIconMesh
          texture={texture}
          shaders={activeShaders}
          size={thumbnailSize}
          meshRef={meshRef}
          materialRef={materialRef}
          initialOpacity={0}
        />
      ) : (
        <IconShaderMesh
          texture={texture}
          shaders={activeShaders}
          size={LAYOUT.iconSize}
          meshRef={meshRef}
          materialRef={materialRef}
          initialOpacity={0}
        />
      )}
      <group ref={labelGroupRef}>
        <IconLabel
          label={item.label}
          position={[0, 0, 0]}
          htmlRef={htmlRef}
          fontSize="13px"
          style={{
            textAlign: 'left',
            transform: 'translateY(-50%)',
            width: '175px',
            whiteSpace: 'normal',
            lineHeight: 1.2,
          }}
          center
        />
      </group>
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
  contentPanelVisibleRef,
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

  if (!items?.length || !shaders?.normal || !shaders?.thumbnail) return null;

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
          contentPanelVisibleRef={contentPanelVisibleRef}
          shaders={shaders}
        />
      ))}
    </>
  );
});
