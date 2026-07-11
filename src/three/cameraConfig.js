export const CAMERA = {
  frustumSize: 10,
  position: [-0.09479328005746984, 0.01034594383217302, 2.230247723145003],
  target: [0, 0, 0],
  zoom: 6.264789413459975,
};

/** Visible world size for the ortho camera (frustum ÷ zoom). */
export function getOrthoViewportSize(camera, size) {
  if (camera?.isOrthographicCamera) {
    return {
      width: (camera.right - camera.left) / camera.zoom,
      height: (camera.top - camera.bottom) / camera.zoom,
    };
  }

  const aspect = size.width / size.height;
  const frustumHalf = CAMERA.frustumSize / 2;

  return {
    width: (frustumHalf * 2 * aspect) / CAMERA.zoom,
    height: (frustumHalf * 2) / CAMERA.zoom,
  };
}
