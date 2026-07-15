import { memo, useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import vertexShader from '../shaders/scene-gradient-vertex.glsl?raw';
import fragmentShader from '../shaders/scene-gradient-fragment.glsl?raw';
import { CAMERA } from './cameraConfig';

const CAMERA_PLANE_DISTANCE = 10;

// Computed directly from the known camera config (frustumSize/zoom), rather than
// reading camera.left/right/top/bottom off the live ortho camera. Those values are
// only corrected in Scene's useLayoutEffect *after* this component's first mount,
// so relying on them here would size the plane using stale defaults on cold load.
function getBackgroundPlaneSize(size) {
  const aspect = size.width / size.height;
  const frustumHalf = CAMERA.frustumSize / 2;

  return {
    width: (frustumHalf * 2 * aspect) / CAMERA.zoom,
    height: (frustumHalf * 2) / CAMERA.zoom,
  };
}

export const SceneBackground = memo(function SceneBackground({ introBackgroundOpacityRef }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    if (meshRef.current && camera) {
      meshRef.current.position.copy(camera.position);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.translateZ(-CAMERA_PLANE_DISTANCE);
    }
    invalidate();
  }, [camera, invalidate]);

  useFrame(() => {
    if (!meshRef.current || !camera) return;

    meshRef.current.position.copy(camera.position);
    meshRef.current.quaternion.copy(camera.quaternion);
    meshRef.current.translateZ(-CAMERA_PLANE_DISTANCE);

    if (materialRef.current) {
      materialRef.current.uniforms.u_opacity.value =
        introBackgroundOpacityRef?.current?.value ?? 1;
    }
  });
  
  if (!camera?.isOrthographicCamera) return null;

  const { width: planeWidth, height: planeHeight } = getBackgroundPlaneSize(size);

  return (
    <mesh ref={meshRef} renderOrder={-1}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_opacity: { value: 0.0 },
        }}
        toneMapped={false}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
});
