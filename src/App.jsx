import { Canvas } from '@react-three/fiber';
import { Scene } from './three/Scene';
import XMBNav from './components/XMBNav';
import Clock from './components/Clock';
import './App.css';
import { useCallback, useEffect, useRef, useState } from 'react';
import { navItems } from './three/navItems';
import { NAV_CANCEL_AUDIO, NAV_DECIDE_AUDIO, STARTUP_AUDIO, STARTUP_AUDIO_VOLUME } from './three/introConfig';
import { preloadNavTextures } from './three/utils/preloadNavTextures';
import { playUiSound, preloadUiSound, unlockUiAudio } from './utils/uiSound';

const BOOT_SOUNDS = [STARTUP_AUDIO, NAV_DECIDE_AUDIO, NAV_CANCEL_AUDIO];

preloadUiSound(STARTUP_AUDIO);
preloadNavTextures();

function App() {
  const [focusCol, setFocusCol] = useState(4);
  const [exitingCols, setExitingCols] = useState([]);
  const focusColRef = useRef({value: 4});
  const focusSubRowRef = useRef({ values: navItems.map(() => 0) });
  const navDepthRef = useRef({ value: 0 });
  const contentPanelVisibleRef = useRef({ value: 0 });
  const fullscreenPanelVisibleRef = useRef({ value: 0 });
  const fullscreenOpenRef = useRef(false);
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

  useEffect(() => {
    const onKeyDown = (e) => {
      if (bootedRef.current || e.key !== 'Enter') return;

      e.preventDefault();
      bootedRef.current = true;
      setBooted(true);
      unlockUiAudio(BOOT_SOUNDS);
      void playUiSound(STARTUP_AUDIO, STARTUP_AUDIO_VOLUME);
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

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
    focusColRef.current.value = newCol;
    setFocusCol(newCol);
  }, []);

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
          focusColRef={focusColRef}
          focusSubRowRef={focusSubRowRef}
          navDepthRef={navDepthRef}
          contentPanelVisibleRef={contentPanelVisibleRef}
          fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
          fullscreenOpenRef={fullscreenOpenRef}
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
        introCompleteRef={introCompleteRef}
        subMenusEnabled={subMenusEnabled}
      />
      <Clock
        contentPanelVisibleRef={contentPanelVisibleRef}
        photoViewerOpenRef={photoViewerOpenRef}
        fullscreenOpenRef={fullscreenOpenRef}
        introUiOpacityRef={introUiOpacityRef}
      />
    </>
  );
}

export default App;
