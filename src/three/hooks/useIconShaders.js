import { useEffect, useState } from 'react';

export function useIconShaders() {
  const [shaders, setShaders] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/shaders/icon-vertex.glsl').then((res) => res.text()),
      fetch('/shaders/icon-fragment.glsl').then((res) => res.text()),
    ]).then(([vertex, fragment]) => setShaders({ vertex, fragment }));
  }, []);

  return shaders;
}
