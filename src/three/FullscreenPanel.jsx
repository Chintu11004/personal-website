import { memo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { lerp, lerpFactor } from './utils/animation';
import { getFocusedSubItem, getSelectionFingerprint } from './utils/selection';
import { FullscreenPanelContent } from './FullscreenPanelContent';
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
  const bodyRef = useRef();
  const descRef = useRef();
  const opacity = useRef(0);
  const lastFingerprint = useRef('');
  const showScrollHintRef = useRef(false);
  const [subItem, setSubItem] = useState(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const updateScrollHint = () => {
    const el = bodyRef.current;
    if (!el) return;

    const hasMore = el.scrollHeight - el.scrollTop - el.clientHeight > 8;
    if (hasMore === showScrollHintRef.current) return;

    showScrollHintRef.current = hasMore;
    setShowScrollHint(hasMore);
  };

  useEffect(() => {
    const body = bodyRef.current;
    const desc = descRef.current;
    if (!body || !desc || !subItem?.content) {
      showScrollHintRef.current = false;
      setShowScrollHint(false);
      return undefined;
    }

    body.addEventListener('scroll', updateScrollHint, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(body);
    resizeObserver.observe(desc);

    requestAnimationFrame(() => {
      requestAnimationFrame(updateScrollHint);
    });

    return () => {
      body.removeEventListener('scroll', updateScrollHint);
      resizeObserver.disconnect();
    };
  }, [subItem]);

  useFrame((state, delta) => {
    const fingerprint = getSelectionFingerprint(focusColRef, focusSubRowRef);
    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      setSubItem(getFocusedSubItem(focusColRef, focusSubRowRef));
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
        requestAnimationFrame(updateScrollHint);
      }
    }

    const shouldShow = fullscreenOpenRef?.current ?? false;
    const t = lerpFactor(delta);
    const prevOpacity = opacity.current;

    opacity.current = lerp(opacity.current, shouldShow ? 1 : 0, t);

    if (
      shouldShow ||
      opacity.current > 0.001 ||
      Math.abs(prevOpacity - opacity.current) > 0.0001
    ) {
      state.invalidate();
    }

    if (!shouldShow && opacity.current < 0.01) {
      opacity.current = 0;
      lastFingerprint.current = '';
    }

    if (fullscreenPanelVisibleRef?.current) {
      fullscreenPanelVisibleRef.current.value = opacity.current;
    }

    if (htmlRef.current) {
      htmlRef.current.style.visibility = opacity.current > 0.01 ? 'visible' : 'hidden';
    }
    if (contentRef.current) contentRef.current.style.opacity = String(opacity.current);
    if (bodyRef.current) {
      bodyRef.current.style.pointerEvents = opacity.current > 0.01 ? 'auto' : 'none';
    }
    if (shouldShow) {
      updateScrollHint();
    } else if (showScrollHintRef.current) {
      showScrollHintRef.current = false;
      setShowScrollHint(false);
    }
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
                <div className="fullscreen-panel__body-wrap">
                  <div ref={bodyRef} className="fullscreen-panel__body">
                    <FullscreenPanelContent
                      description={subItem.content.description}
                      contentRef={descRef}
                    />
                  </div>
                  <div
                    className={`fullscreen-panel__scroll-hint${showScrollHint ? ' fullscreen-panel__scroll-hint--visible' : ''}`}
                    aria-hidden="true"
                  >
                    <div className="fullscreen-panel__scroll-hint-column">
                      <div className="fullscreen-panel__scroll-hint-gradient" />
                      <div className="fullscreen-panel__scroll-hint-arrow" />
                    </div>
                  </div>
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
