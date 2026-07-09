import { Canvas } from '@react-three/fiber';
import { Scene } from './three/Scene';
import XMBNav from './components/XMBNav';
import './App.css';
import { useRef } from 'react';

function App() {
  const focusColRef = useRef({ value: 4 });
  const focusSubRowRef = useRef({ value: 0 });

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
        <Scene focusColRef={focusColRef} focusSubRowRef={focusSubRowRef} />
      </Canvas>
      <XMBNav focusColRef={focusColRef} focusSubRowRef={focusSubRowRef} />
    </>
  );
}

export default App;
