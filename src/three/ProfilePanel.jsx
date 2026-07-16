import { memo, useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { lerp, lerpFactor } from './utils/animation';
import { profileSections } from './profileConfig';
import './ProfilePanel.css';

const PANEL_BLUR_MAX = 8;

function screenCenterPosition(_, camera, size) {
  return [size.width / 2, size.height / 2];
}

export const ProfilePanel = memo(function ProfilePanel({
  profilePanelOpenRef,
  profilePanelVisibleRef,
}) {
  const htmlRef = useRef();
  const backdropRef = useRef();
  const contentRef = useRef();
  const bodyRef = useRef();
  const opacity = useRef(0);
  const contentMountedRef = useRef(false);
  const showScrollHintRef = useRef(false);
  const [contentMounted, setContentMounted] = useState(false);
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
    if (!body || !contentMounted) {
      showScrollHintRef.current = false;
      setShowScrollHint(false);
      return undefined;
    }

    body.addEventListener('scroll', updateScrollHint, { passive: true });

    const resizeObserver = new ResizeObserver(updateScrollHint);
    resizeObserver.observe(body);

    requestAnimationFrame(() => {
      requestAnimationFrame(updateScrollHint);
    });

    return () => {
      body.removeEventListener('scroll', updateScrollHint);
      resizeObserver.disconnect();
    };
  }, [contentMounted]);

  useFrame((state, delta) => {
    const shouldShow = profilePanelOpenRef?.current ?? false;
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
      if (contentMountedRef.current) {
        contentMountedRef.current = false;
        setContentMounted(false);
      }
    } else if (shouldShow && !contentMountedRef.current) {
      contentMountedRef.current = true;
      setContentMounted(true);
      if (bodyRef.current) {
        bodyRef.current.scrollTop = 0;
        requestAnimationFrame(updateScrollHint);
      }
    }

    if (profilePanelVisibleRef?.current) {
      profilePanelVisibleRef.current.value = opacity.current;
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
        <div className="profile-panel" role="dialog" aria-modal="true">
          <div ref={backdropRef} className="profile-panel__backdrop" />
          <div ref={contentRef} className="profile-panel__content" style={{ opacity: 0 }}>
            <div className="profile-panel__line profile-panel__line--top" />
            <div className="profile-panel__line profile-panel__line--bottom" />
            {contentMounted && (
              <div className="profile-panel__body-wrap">
                <div ref={bodyRef} className="profile-panel__body">
                  {profileSections.map((section) => (
                    <section key={section.title} className="profile-panel__section">
                      <h1 className="profile-panel__title">{section.title}</h1>
                      <img
                        className="profile-panel__image"
                        src={section.image}
                        alt=""
                      />
                    </section>
                  ))}
                </div>
                <div
                  className={`profile-panel__scroll-hint${showScrollHint ? ' profile-panel__scroll-hint--visible' : ''}`}
                  aria-hidden="true"
                >
                  <div className="profile-panel__scroll-hint-column">
                    <div className="profile-panel__scroll-hint-gradient" />
                    <div className="profile-panel__scroll-hint-arrow" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Html>
    </group>
  );
});
