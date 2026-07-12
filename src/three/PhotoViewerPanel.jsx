import { memo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { PhotoViewer } from '../components/PhotoViewer';
import { lerp, lerpFactor } from './utils/animation';
import { getFocusedSubItem, getSelectionFingerprint } from './PhotoGridPanel';
import './PhotoViewerPanel.css';

const GRID_COLS = 5;

function screenCenterPosition(_, camera, size) {
  return [size.width / 2, size.height / 2];
}

export const PhotoViewerPanel = memo(function PhotoViewerPanel({
  focusColRef,
  focusSubRowRef,
  photoGridFocusRef,
  photoViewerOpenRef,
}) {
  const htmlRef = useRef();
  const opacity = useRef(0);
  const lastFingerprint = useRef('');
  const lastPhotoKey = useRef('');
  const [photos, setPhotos] = useState([]);
  const [activePhoto, setActivePhoto] = useState(null);

  useFrame((_, delta) => {
    const fingerprint = getSelectionFingerprint(focusColRef, focusSubRowRef);

    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      const focusedItem = getFocusedSubItem(focusColRef, focusSubRowRef);
      setPhotos(focusedItem?.photos ?? []);
      lastPhotoKey.current = '';
      setActivePhoto(null);
    }

    const viewerOpen = photoViewerOpenRef?.current ?? false;
    const focusedIndex =
      (photoGridFocusRef?.current?.row ?? 0) * GRID_COLS +
      (photoGridFocusRef?.current?.col ?? 0);
    const photo = viewerOpen ? photos[focusedIndex] ?? null : null;

    if (photo) {
      const photoKey = `${photo.src}:${focusedIndex}`;
      if (photoKey !== lastPhotoKey.current) {
        lastPhotoKey.current = photoKey;
        setActivePhoto(photo);
      }
    }

    const t = lerpFactor(delta);
    opacity.current = lerp(opacity.current, viewerOpen ? 1 : 0, t);

    if (htmlRef.current) htmlRef.current.style.opacity = String(opacity.current);
  }, -1);

  return (
    <group>
      <Html
        ref={htmlRef}
        fullscreen
        calculatePosition={screenCenterPosition}
        style={{ opacity: 0, pointerEvents: 'none' }}
      >
        <div
          className="photo-viewer-panel"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto?.title || 'Photo'}
        >
          {activePhoto && (
            <>
              <PhotoViewer photo={activePhoto} />
              {(activePhoto.title || activePhoto.date) && (
                <div className="photo-viewer-panel__caption">
                  {activePhoto.title && (
                    <div className="photo-viewer-panel__title">{activePhoto.title}</div>
                  )}
                  {activePhoto.date && (
                    <div className="photo-viewer-panel__date">{activePhoto.date}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Html>
    </group>
  );
});
