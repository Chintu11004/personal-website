import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { navItems } from './navItems';
import { lerp, lerpFactor } from './utils/animation';
import { PhotoGrid } from '../components/PhotoGrid';
import '../components/PhotoGrid.css';

export const HIDDEN_OFFSET_X = 0.12;

// Anchors top-left of the grid beside the depth-1 folder icon
const POSITION = [-0.45, 0.16, 0];

export function getSelectionFingerprint(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
  return `${col}:${subRow}`;
}

export function getFocusedSubItem(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
  return navItems[col]?.items?.[subRow] ?? null;
}

export const PhotoGridPanel = memo(function PhotoGridPanel({
  focusColRef,
  focusSubRowRef,
  navDepthRef,
  photoGridFocusRef,
  photoGridPanelVisibleRef,
}) {
  const groupRef = useRef();
  const htmlRef = useRef();
  const anchorRef = useRef();
  const opacity = useRef(0);
  const slideX = useRef(HIDDEN_OFFSET_X);
  const lastFingerprint = useRef('');
  const [photos, setPhotos] = useState([]);
  const [gridFocus, setGridFocus] = useState({ row: 0, col: 0 });
  const [anchorTop, setAnchorTop] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!anchorRef.current) return;
      setAnchorTop(anchorRef.current.getBoundingClientRect().top);
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (anchorRef.current) observer.observe(anchorRef.current);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [photos]);

  useFrame((_, delta) => {
    const depth = navDepthRef?.current?.value ?? 0;
    const fingerprint = getSelectionFingerprint(focusColRef, focusSubRowRef);

    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      const focusedItem = getFocusedSubItem(focusColRef, focusSubRowRef);
      setPhotos(focusedItem?.photos ?? []);
      if (photoGridFocusRef?.current) {
        photoGridFocusRef.current.row = 0;
        photoGridFocusRef.current.col = 0;
      }
    }

    const focusedItem = getFocusedSubItem(focusColRef, focusSubRowRef);
    const shouldShow = depth === 1 && focusedItem?.type === 'folder';

    if (photoGridFocusRef?.current) {
      setGridFocus({ row: photoGridFocusRef.current.row, col: photoGridFocusRef.current.col });
    }

    groupRef.current?.position.set(
      POSITION[0] + slideX.current,
      POSITION[1],
      POSITION[2]
    );

    const t = lerpFactor(delta);

    opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);
    slideX.current = lerp(slideX.current, shouldShow ? 0 : HIDDEN_OFFSET_X, t);

    if (photoGridPanelVisibleRef?.current) {
      photoGridPanelVisibleRef.current.value = opacity.current;
    }

    if (htmlRef.current) htmlRef.current.style.opacity = String(opacity.current);
  }, -1);

  return (
    <group ref={groupRef}>
      <Html ref={htmlRef} style={{ opacity: 0, pointerEvents: 'none' }}>
        <div ref={anchorRef} className="photo-grid-anchor" aria-hidden="true" />
        <div
          className="photo-grid-panel"
          style={{ '--photo-grid-anchor-top': `${anchorTop}px` }}
        >
          <PhotoGrid
            photos={photos}
            focusRow={gridFocus.row}
            focusCol={gridFocus.col}
            cols={5}
          />
        </div>
      </Html>
    </group>
  );
});
