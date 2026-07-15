import { memo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { INTRO_PANEL_CONTENT, isIntroPanelVisible } from './introConfig';
import { lerp, lerpFactor } from './utils/animation';
import './IntroPanel.css';

const PANEL_BLUR_MAX = 8;

function screenCenterPosition(_, camera, size) {
  return [size.width / 2, size.height / 2];
}

export const IntroPanel = memo(function IntroPanel() {
  const htmlRef = useRef();
  const backdropRef = useRef();
  const textRef = useRef();
  const opacity = useRef(0);

  useFrame((state, delta) => {
    const shouldShow = isIntroPanelVisible(state.clock.elapsedTime);
    const t = lerpFactor(delta);

    opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);

    if (!shouldShow && opacity.current < 0.01) {
      opacity.current = 0;
    }

    if (htmlRef.current) {
      htmlRef.current.style.visibility = opacity.current > 0.01 ? 'visible' : 'hidden';
    }
    if (textRef.current) {
      textRef.current.style.opacity = String(opacity.current);
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
        <div className="intro-panel" aria-live="polite">
          <div ref={backdropRef} className="intro-panel__backdrop" />
          <p ref={textRef} className="intro-panel__text">
            {INTRO_PANEL_CONTENT.text}
          </p>
        </div>
      </Html>
    </group>
  );
});
