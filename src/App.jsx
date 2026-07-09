import { Canvas } from '@react-three/fiber';
import { Scene } from './three/Scene';
import XMBNav from './components/XMBNav';
import './App.css';
import { useCallback, useRef, useState } from 'react';
import { navItems } from './three/NavIcons';

function App() {
  const [focusCol, setFocusCol] = useState(4);
  const [exitingCols, setExitingCols] = useState([]);
  const focusColRef = useRef({value: 4});
  const focusSubRowRef = useRef({ values: navItems.map(() => 0) });

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

    focusColRef.current.value = newCol;
    setFocusCol(newCol);
  }, []);

  return (
    <>
      <div className="app-background" aria-hidden="true" />
      <Canvas
        frameloop="always"
        gl={{ antialias: true, alpha: true, premultipliedAlpha: false }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          background: 'transparent',
        }}
      >
        <Scene focusColRef={focusColRef} focusSubRowRef={focusSubRowRef} focusCol={focusCol} exitingCols={exitingCols} removingExitingCols={removingExitingCol}/>
      </Canvas>
      <XMBNav focusColRef={focusColRef} focusSubRowRef={focusSubRowRef} navigateToCol={navigateToCol}/>
    </>
  );
}

export default App;
