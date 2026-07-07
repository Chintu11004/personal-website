import { Canvas } from '@react-three/fiber';
import { Scene } from './three/Scene';
import XMBNav from './components/XMBNav';
import './App.css';
import { useRef } from 'react';

function App() {
  const focusColRef = useRef({ value: 0 });

  return (
    <>
      <Canvas
        frameloop="always"
        gl={{ antialias: true, alpha: true }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: 'transparent',
        }}
      >
        <Scene focusColRef={focusColRef}/>
      </Canvas>
      <XMBNav focusColRef={focusColRef} />
    </>
  );
}

export default App;
