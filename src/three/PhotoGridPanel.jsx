import { memo, useLayoutEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { lerp, lerpFactor } from './utils/animation';
import { getFocusedSubItem, getSelectionFingerprint } from './utils/selection';
import { FolderConnectorArrow } from '../components/FolderConnectorArrow';
import { PhotoGrid } from '../components/PhotoGrid';
import '../components/PhotoGrid.css';

export const HIDDEN_OFFSET_X = 0.12;
const OPACITY_RESET_THRESHOLD = 0.01;

const CONNECTOR_X = -75;
const GRID_THUMB_HEIGHT = 125;

// Anchors top-left of the grid beside the depth-1 folder icon
// Tuned at reference window: 1512x859
const POSITION = [-0.45, 0.16, 0];
const REFERENCE_WIDTH = 1512;
const REFERENCE_HEIGHT = 859;
const PANEL_BASE_SCALE = 1;

export const PhotoGridPanel = memo(function PhotoGridPanel({
  focusColRef,
  focusSubRowRef,
  navDepthRef,
  photoGridFocusRef,
  photoGridPanelVisibleRef,
  photoViewerOpenRef,
}) {
  const groupRef = useRef();
  const htmlRef = useRef();
  const anchorRef = useRef();
  const opacity = useRef(0);
  const slideX = useRef(HIDDEN_OFFSET_X);
  const lastFingerprint = useRef('');
  const photosFingerprint = useRef('');
  const lastGridFocus = useRef({ row: 0, col: 0 });
  const [photos, setPhotos] = useState([]);
  const [gridFocus, setGridFocus] = useState({ row: 0, col: 0 });
  const [anchorTop, setAnchorTop] = useState(0);
  const size = useThree((state) => state.size);
  const panelScaleY = (size.height / REFERENCE_HEIGHT) * PANEL_BASE_SCALE;
  const panelScaleX = (REFERENCE_WIDTH / size.width) * panelScaleY;

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
      photosFingerprint.current = '';
      setPhotos([]);
      if (photoGridFocusRef?.current) {
        photoGridFocusRef.current.row = 0;
        photoGridFocusRef.current.col = 0;
      }
      if (photoViewerOpenRef) {
        photoViewerOpenRef.current = false;
      }
      lastGridFocus.current = { row: 0, col: 0 };
      setGridFocus({ row: 0, col: 0 });
    }

    const focusedItem = getFocusedSubItem(focusColRef, focusSubRowRef);
    const shouldShow = depth === 1 && focusedItem?.type === 'folder';

    if (shouldShow && photosFingerprint.current !== fingerprint) {
      photosFingerprint.current = fingerprint;
      setPhotos(focusedItem?.photos ?? []);
    }

    if (shouldShow && photoGridFocusRef?.current) {
      const nextRow = photoGridFocusRef.current.row;
      const nextCol = photoGridFocusRef.current.col;
      if (nextRow !== lastGridFocus.current.row || nextCol !== lastGridFocus.current.col) {
        lastGridFocus.current = { row: nextRow, col: nextCol };
        setGridFocus({ row: nextRow, col: nextCol });
      }
    }

    groupRef.current?.position.set(
      POSITION[0] + slideX.current,
      POSITION[1],
      POSITION[2]
    );

    const t = lerpFactor(delta);

    opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);
    slideX.current = lerp(slideX.current, shouldShow ? 0 : HIDDEN_OFFSET_X, t);

    if (
      !shouldShow &&
      opacity.current < OPACITY_RESET_THRESHOLD &&
      photoGridFocusRef?.current &&
      (photoGridFocusRef.current.row !== 0 || photoGridFocusRef.current.col !== 0)
    ) {
      photoGridFocusRef.current.row = 0;
      photoGridFocusRef.current.col = 0;
      lastGridFocus.current = { row: 0, col: 0 };
      setGridFocus({ row: 0, col: 0 });
    }

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
          <div
            className="photo-grid-panel__scaled"
            style={{
              transform: `scale(${panelScaleX}, ${panelScaleY})`,
              transformOrigin: 'top left',
            }}
          >
            <FolderConnectorArrow
              x={CONNECTOR_X}
              y={GRID_THUMB_HEIGHT / 2}
            />
            <PhotoGrid
              photos={photos}
              focusRow={gridFocus.row}
              focusCol={gridFocus.col}
              cols={5}
            />
          </div>
        </div>
      </Html>
    </group>
  );
});
