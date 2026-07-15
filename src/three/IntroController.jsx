import { useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { INTRO, getRibbonOpacity, getBackgroundOpacity, getSubMenuEnabledAt, isIntroPanelVisible } from './introConfig';
import { navItems } from './navItems';

export function IntroController({
  booted,
  introBackgroundOpacityRef,
  introRibbonOpacityRef,
  introUiOpacityRef,
  introCompleteRef,
  subMenuEnabledRef,
  onSubMenusEnabled,
  onIntroComplete,
}) {
  const introDone = useRef(false);
  const subMenuDone = useRef(false);
  const subMenuEnabledAt = getSubMenuEnabledAt(navItems.length);
  const { clock, invalidate } = useThree();

  useLayoutEffect(() => {
    clock.stop();
    invalidate();
  }, [clock, invalidate]);

  useEffect(() => {
    if (!booted) return;

    clock.elapsedTime = 0;
    clock.start();
    invalidate();
  }, [booted, clock, invalidate]);

  useFrame((state) => {
    if (!booted) {
      state.invalidate();
      return;
    }

    const t = state.clock.elapsedTime;

    introRibbonOpacityRef.current.value = getRibbonOpacity(t);
    introBackgroundOpacityRef.current.value = getBackgroundOpacity(t);

    const uiT = Math.max(0, Math.min((t - INTRO.uiStart) / INTRO.uiDuration, 1));
    introUiOpacityRef.current.value = 1 - Math.pow(1 - uiT, 3);

    // when to unlock navigation
    if (!introDone.current && t >= INTRO.completeAt) {
      introDone.current = true;
      introCompleteRef.current = true;
      onIntroComplete?.();
    }

    // when to show the submenus
    if (!subMenuDone.current && t >= subMenuEnabledAt) {
      subMenuDone.current = true;
      subMenuEnabledRef.current = true;
      onSubMenusEnabled?.();
    }

    if (!booted || !introCompleteRef.current || !subMenuEnabledRef.current || isIntroPanelVisible(t)) {
      state.invalidate();
    }
  });

  return null;
}
