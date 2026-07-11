import { useEffect, useState } from 'react';

export function useIconShaders() {
  const [shaders, setShaders] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/shaders/icon-vertex.glsl').then((res) => res.text()),
      fetch('/shaders/icon-fragment.glsl').then((res) => res.text()),
      fetch('/shaders/icon-thumbnail-fragment.glsl').then((res) => res.text()),
    ]).then(([vertex, normalFragment, thumbnailFragment]) => {
      setShaders({
        normal: { vertex, fragment: normalFragment },
        thumbnail: { vertex, fragment: thumbnailFragment },
      });
    });
  }, []);

  return shaders;
}
