import { memo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { lerp, lerpFactor } from './utils/animation';
import { getFocusedSubItem, getSelectionFingerprint } from './utils/selection';
import './FullscreenPanel.css';

const DEFAULT_SUB_ICON = '/icons/dif.png';
const PANEL_BLUR_MAX = 8;

function screenCenterPosition(_, camera, size) {
  return [size.width / 2, size.height / 2];
}

export const FullscreenPanel = memo(function FullscreenPanel({
  focusColRef,
  focusSubRowRef,
  fullscreenPanelVisibleRef,
  fullscreenOpenRef,
}) {
  const htmlRef = useRef();
  const backdropRef = useRef();
  const contentRef = useRef();
  const opacity = useRef(0);
  const lastFingerprint = useRef('');
  const [subItem, setSubItem] = useState(null);

  useFrame((_, delta) => {
    const fingerprint = getSelectionFingerprint(focusColRef, focusSubRowRef);
    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      setSubItem(getFocusedSubItem(focusColRef, focusSubRowRef));
    }

    const shouldShow = fullscreenOpenRef?.current ?? false;
    const t = lerpFactor(delta);

    opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);

    if (fullscreenPanelVisibleRef?.current) {
      fullscreenPanelVisibleRef.current.value = opacity.current;
    }

    if (contentRef.current) contentRef.current.style.opacity = String(opacity.current);
    if (backdropRef.current) {
      const blur = opacity.current * PANEL_BLUR_MAX;
      const blurValue = `blur(${blur}px)`;
      backdropRef.current.style.backdropFilter = blurValue;
      backdropRef.current.style.webkitBackdropFilter = blurValue;
    }
  }, -1);

  return (
    <group>
      <Html
        ref={htmlRef}
        fullscreen
        calculatePosition={screenCenterPosition}
        style={{ pointerEvents: 'none' }}
      >
        <div className="fullscreen-panel" role="dialog" aria-modal="true">
          <div ref={backdropRef} className="fullscreen-panel__backdrop" />
          <div ref={contentRef} className="fullscreen-panel__content" style={{ opacity: 0 }}>
            <div className="fullscreen-panel__line fullscreen-panel__line--top" />
            <div className="fullscreen-panel__line fullscreen-panel__line--bottom" />
            {subItem?.content && (
              <>
                <div className="fullscreen-panel__header">
                  <img
                    className="fullscreen-panel__icon"
                    src={subItem.image ?? DEFAULT_SUB_ICON}
                    alt=""
                  />
                  <p className="fullscreen-panel__title">{subItem.content.title}</p>
                </div>
                <div className="fullscreen-panel__body">
                  <p className="fullscreen-panel__desc">{subItem.content.description}</p>
                </div>
                <div className="fullscreen-panel__footer">
                  <p className="fullscreen-panel__label">ESC exit</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
});
