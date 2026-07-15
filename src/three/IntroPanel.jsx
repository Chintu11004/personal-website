import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { BOOT_PANEL_CONTENT, INTRO_PANEL_CONTENT, isIntroPanelVisible } from './introConfig';
import { lerp, lerpFactor } from './utils/animation';
import './IntroPanel.css';

const PANEL_BLUR_MAX = 8;

function screenCenterPosition(_, camera, size) {
  return [size.width / 2, size.height / 2];
}

export const IntroPanel = memo(function IntroPanel({ booted }) {
  const htmlRef = useRef();
  const panelRef = useRef();
  const backdropRef = useRef();
  const contentRef = useRef();
  const textRef = useRef();
  const opacity = useRef(0);
  const introShownRef = useRef(false);

  useFrame((state, delta) => {
    const bootVisible = !booted;
    const introVisible = booted && isIntroPanelVisible(state.clock.elapsedTime);
    const shouldShow = bootVisible || introVisible;

    if (introVisible) {
      introShownRef.current = true;
    }

    if (bootVisible) {
      opacity.current = 1;
    } else {
      const t = lerpFactor(delta);
      opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);
      if (!shouldShow && opacity.current < 0.01) {
        opacity.current = 0;
      }
    }

    if (htmlRef.current) {
      htmlRef.current.style.visibility = opacity.current > 0.01 ? 'visible' : 'hidden';
    }
    if (contentRef.current) {
      contentRef.current.style.opacity = String(opacity.current);
    }
    if (panelRef.current) {
      panelRef.current.classList.toggle('intro-panel--intro', introShownRef.current);
    }
    if (textRef.current) {
      textRef.current.textContent = introShownRef.current
        ? INTRO_PANEL_CONTENT.text
        : BOOT_PANEL_CONTENT.text;
    }
    if (backdropRef.current) {
      const blur = opacity.current * PANEL_BLUR_MAX;
      const blurValue = `blur(${blur}px)`;
      backdropRef.current.style.backdropFilter = blurValue;
      backdropRef.current.style.webkitBackdropFilter = blurValue;
    }

    if (shouldShow || opacity.current > 0.01) {
      state.invalidate();
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
        <div ref={panelRef} className="intro-panel" aria-live="polite">
          <div ref={backdropRef} className="intro-panel__backdrop" />
          <div ref={contentRef} className="intro-panel__content" style={{ opacity: 0 }}>
            <div className="intro-panel__body">
              <div className="intro-panel__text-wrap">
                <p ref={textRef} className="intro-panel__text">
                  {BOOT_PANEL_CONTENT.text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
});
