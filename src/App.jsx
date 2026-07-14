import { Canvas } from '@react-three/fiber';
import { Scene } from './three/Scene';
import XMBNav from './components/XMBNav';
import Clock from './components/Clock';
import './App.css';
import { useCallback, useRef, useState } from 'react';
import { navItems } from './three/navItems';

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
      <div className="app-background" aria-hidden="true" />
      <Canvas
        frameloop="demand"
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: 'transparent',
        }}
      >
        <Scene
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
      />
      <Clock
        contentPanelVisibleRef={contentPanelVisibleRef}
        photoViewerOpenRef={photoViewerOpenRef}
        fullscreenOpenRef={fullscreenOpenRef}
      />
    </>
  );
}

export default App;
