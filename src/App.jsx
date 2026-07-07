import { useEffect, useRef } from 'react';
import { initScene } from './three/scene';
import XMBNav from './components/XMBNav';
import './App.css';


function App() {
  const sceneInitialized = useRef(false);

  useEffect(() => {
    if (sceneInitialized.current) return;

    const container = document.getElementById('container');
    if (!container) {
      console.error('Container element not found');
      return;
    }

    initScene(container).then((sceneData) => {
      if (sceneData) {
        sceneInitialized.current = true;
        console.log('Three.js scene ready');
      }
    }).catch(error => {
      console.error('Failed to initialize Three.js scene:', error);
    });
  }, []);

  return (
    <>
      <XMBNav />
    </>
  );
}

export default App;
