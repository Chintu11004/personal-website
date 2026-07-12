import iconVertex from '../../shaders/icon-vertex.glsl?raw';
import backgroundFragment from '../../shaders/background-fragment.glsl?raw';

const BACKGROUND_SHADERS = {
  vertex: iconVertex,
  fragment: backgroundFragment,
};

export function useBackgroundShader() {
  return BACKGROUND_SHADERS;
}
