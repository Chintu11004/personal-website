import iconVertex from '../../shaders/icon-vertex.glsl?raw';
import iconFragment from '../../shaders/icon-fragment.glsl?raw';
import iconThumbnailFragment from '../../shaders/icon-thumbnail-fragment.glsl?raw';

const ICON_SHADERS = {
  normal: { vertex: iconVertex, fragment: iconFragment },
  thumbnail: { vertex: iconVertex, fragment: iconThumbnailFragment },
};

export function useIconShaders() {
  return ICON_SHADERS;
}
