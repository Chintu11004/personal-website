import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './three/Scene';
import XMBNav from './components/XMBNav';
import Clock from './components/Clock';
import LauncherMusic from './components/LauncherMusic';
import ProfileTrigger from './components/ProfileTrigger';
import './App.css';
import { navItems } from './three/navItems';
import { NAV_CANCEL_AUDIO, NAV_DECIDE_AUDIO, STARTUP_AUDIO, STARTUP_AUDIO_VOLUME } from './three/introConfig';
import { collectLauncherMusicUrls } from './three/utils/collectLauncherMusicUrls';
import { preloadNavTextures } from './three/utils/preloadNavTextures';
import { createPointerNavHandlers } from './three/utils/pointerNav';
import { playUiSound, preloadUiSound, unlockUiAudio } from './utils/uiSound';

const LAUNCHER_MUSIC = [...collectLauncherMusicUrls(navItems)];
const BOOT_SOUNDS = [STARTUP_AUDIO, NAV_DECIDE_AUDIO, NAV_CANCEL_AUDIO, ...LAUNCHER_MUSIC];

preloadUiSound(STARTUP_AUDIO);
preloadNavTextures();

function App() {
  const [focusCol, setFocusCol] = useState(4);
  const [exitingCols, setExitingCols] = useState([]);
  const focusColRef = useRef({value: 4});
  const focusSubRowRef = useRef({ values: navItems.map(() => 0) });
  const navDepthRef = useRef({ value: 0 });
  const contentPanelVisibleRef = useRef({ value: 0 });
  const contentPanelOpenRef = useRef({ value: false });
  const fullscreenPanelVisibleRef = useRef({ value: 0 });
  const profilePanelVisibleRef = useRef({ value: 0 });
  const fullscreenOpenRef = useRef(false);
  const profilePanelOpenRef = useRef(false);
  const photoGridPanelVisibleRef = useRef({ value: 0 });
  const photoGridFocusRef = useRef({ row: 0, col: 0 });
  const photoViewerOpenRef = useRef(false);
  const introBackgroundOpacityRef = useRef({ value: 0 });
  const introRibbonOpacityRef = useRef({ value: 0 });
  const introUiOpacityRef = useRef({ value: 0 });
  const introCompleteRef = useRef(false);
  const subMenuEnabledRef = useRef(false);
  const [subMenusEnabled, setSubMenusEnabled] = useState(false);
  const [introLogoMounted, setIntroLogoMounted] = useState(true);
  const [booted, setBooted] = useState(false);
  const bootedRef = useRef(false);
  const enableSubMenus = useCallback(() => setSubMenusEnabled(true), []);
  const finishIntro = useCallback(() => setIntroLogoMounted(false), []);

  const boot = useCallback(() => {
    if (bootedRef.current) return;
    bootedRef.current = true;
    setBooted(true);
    unlockUiAudio(BOOT_SOUNDS);
    void playUiSound(STARTUP_AUDIO, STARTUP_AUDIO_VOLUME);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (bootedRef.current || e.key !== 'Enter') return;
      e.preventDefault();
      boot();
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [boot]);

  const removingExitingCol = useCallback((colIndex) => {
    setExitingCols((prev) => prev.filter((c) => c !== colIndex));
  }, []);

  const navigateToCol = useCallback((newCol) => {
    const oldCol = focusColRef.current.value;
    if (oldCol === newCol) return;

    if (navItems[oldCol]?.items?.length) {
      setExitingCols((prev) => prev.includes(oldCol) ? prev : [...prev, oldCol]);
    }

    setExitingCols((prev) => prev.filter((c) => c !== newCol));

    navDepthRef.current.value = 0;
    photoViewerOpenRef.current = false;
    fullscreenOpenRef.current = false;
    profilePanelOpenRef.current = false;
    focusColRef.current.value = newCol;
    setFocusCol(newCol);
  }, []);

  const pointerNav = useMemo(
    () =>
      createPointerNavHandlers(
        {
          focusColRef,
          focusSubRowRef,
          navDepthRef,
          photoGridFocusRef,
          photoViewerOpenRef,
          fullscreenOpenRef,
          introCompleteRef,
        },
        { navigateToCol, subMenusEnabled }
      ),
    [navigateToCol, subMenusEnabled]
  );

  return (
    <>
      <Canvas
        frameloop="demand"
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 1);
          invalidate();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
        }}
      >
        <Scene
          booted={booted}
          onBoot={boot}
          focusColRef={focusColRef}
          focusSubRowRef={focusSubRowRef}
          navDepthRef={navDepthRef}
          contentPanelVisibleRef={contentPanelVisibleRef}
          contentPanelOpenRef={contentPanelOpenRef}
          fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
          profilePanelVisibleRef={profilePanelVisibleRef}
          fullscreenOpenRef={fullscreenOpenRef}
          profilePanelOpenRef={profilePanelOpenRef}
          photoGridPanelVisibleRef={photoGridPanelVisibleRef}
          focusCol={focusCol}
          exitingCols={exitingCols}
          removingExitingCols={removingExitingCol}
          photoGridFocusRef={photoGridFocusRef}
          photoViewerOpenRef={photoViewerOpenRef}
          introBackgroundOpacityRef={introBackgroundOpacityRef}
          introRibbonOpacityRef={introRibbonOpacityRef}
          introUiOpacityRef={introUiOpacityRef}
          introCompleteRef={introCompleteRef}
          subMenuEnabledRef={subMenuEnabledRef}
          onSubMenusEnabled={enableSubMenus}
          onIntroComplete={finishIntro}
          subMenusEnabled={subMenusEnabled}
          introLogoMounted={introLogoMounted}
          pointerNav={pointerNav}
        />
      </Canvas>
      <XMBNav
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        navDepthRef={navDepthRef}
        navigateToCol={navigateToCol}
        photoGridFocusRef={photoGridFocusRef}
        photoViewerOpenRef={photoViewerOpenRef}
        fullscreenOpenRef={fullscreenOpenRef}
        profilePanelOpenRef={profilePanelOpenRef}
        introCompleteRef={introCompleteRef}
        subMenusEnabled={subMenusEnabled}
      />
      <Clock
        contentPanelVisibleRef={contentPanelVisibleRef}
        photoViewerOpenRef={photoViewerOpenRef}
        fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
        profilePanelVisibleRef={profilePanelVisibleRef}
        introUiOpacityRef={introUiOpacityRef}
      />
      <LauncherMusic
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        contentPanelVisibleRef={contentPanelVisibleRef}
        contentPanelOpenRef={contentPanelOpenRef}
        introCompleteRef={introCompleteRef}
      />
      <ProfileTrigger
        contentPanelVisibleRef={contentPanelVisibleRef}
        fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
        profilePanelVisibleRef={profilePanelVisibleRef}
        photoViewerOpenRef={photoViewerOpenRef}
        introUiOpacityRef={introUiOpacityRef}
        introCompleteRef={introCompleteRef}
        profilePanelOpenRef={profilePanelOpenRef}
      />
    </>
  );
}

export default App;
