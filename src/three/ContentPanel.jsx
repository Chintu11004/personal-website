import { memo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { lerp, lerpFactor } from './utils/animation';
import {
  getFocusedSubItem,
  getSelectionFingerprint,
  isLauncherIdleCandidate,
} from './utils/selection';
import './ContentPanel.css';

export const IDLE_DELAY = 2.0;
export const HIDDEN_OFFSET_X = 0.12;

// Focused icon (-0.69, 0.32) + selected submenu local (-0.37, -0.27) + panel offset (0.85, 0)
const POSITION = [0.28, -0.21, 0];

export const ContentPanel = memo(function ContentPanel({ focusColRef, focusSubRowRef, contentPanelVisibleRef }) {
  const groupRef = useRef();
  const htmlRef = useRef();
  const opacity = useRef(0);
  const slideX = useRef(HIDDEN_OFFSET_X);
  const idleTime = useRef(0);
  const lastFingerprint = useRef('');
  const [content, setContent] = useState(null);

  useFrame((_, delta) => {
    // idle timer + visibility lerp
    const fingerprint = getSelectionFingerprint(focusColRef, focusSubRowRef);
    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      idleTime.current = 0;
      setContent(getFocusedSubItem(focusColRef, focusSubRowRef)?.content ?? null);
    }

    if (isLauncherIdleCandidate(focusColRef, focusSubRowRef)) {
      idleTime.current = Math.min(idleTime.current + delta, IDLE_DELAY);
    }
    else {
      idleTime.current = 0;
    }

    const shouldShow = idleTime.current >= IDLE_DELAY;
    groupRef.current?.position.set(
      POSITION[0] + slideX.current,
      POSITION[1],
      POSITION[2]
    );

    const t = lerpFactor(delta);

    opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);
    slideX.current = lerp(slideX.current, shouldShow ? 0 : HIDDEN_OFFSET_X, t);

    if (contentPanelVisibleRef?.current) {
      contentPanelVisibleRef.current.value = opacity.current;
    }

    if (htmlRef.current) htmlRef.current.style.opacity = String(opacity.current);
  }, -1);

  return (
    <group ref={groupRef}>
      <Html ref={htmlRef} center style={{ opacity: 0 }}>
        <div className="content-panel">
          <div className="content-panel__fill" />
          <div className="content-panel__line content-panel__line--top" />
          <div className="content-panel__line content-panel__line--bottom" />
          <div className="content-panel__body">
            {content && (
              <>
                <h2 className="content-panel__title">{content.title}</h2>
                <p className="content-panel__desc">{content.description}</p>
                {content.images?.length > 0 && (
                  <div className="content-panel__images">
                    {content.images.map((src) => (
                      <img
                        key={src}
                        className="content-panel__image"
                        src={src}
                        alt=""
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
});
