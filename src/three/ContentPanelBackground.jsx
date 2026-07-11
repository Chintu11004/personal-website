import { memo, Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getFocusedSubItem, getSelectionFingerprint } from './ContentPanel';
import { BackgroundImageMesh } from './BackgroundImageMesh';
import { getOrthoViewportSize } from './cameraConfig';
import { useBackgroundShader } from './hooks/useBackgroundShader';
import { lerp, lerpFactor } from './utils/animation';

const CAMERA_PLANE_DISTANCE = 10;

const BackgroundImagePlane = memo(function BackgroundImagePlane({ url, shaders, contentPanelVisibleRef }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const opacity = useRef(0);
  const { camera, size } = useThree();
  const texture = useLoader(THREE.TextureLoader, url);
  const { width: planeWidth, height: planeHeight } = getOrthoViewportSize(camera, size);

  useEffect(() => {
    texture.colorSpace = THREE.LinearSRGBColorSpace;
  }, [texture]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.copy(camera.position);
      meshRef.current.quaternion.copy(camera.quaternion);
      meshRef.current.translateZ(-CAMERA_PLANE_DISTANCE);
    }

    const target = contentPanelVisibleRef?.current?.value ?? 0;
    opacity.current = lerp(opacity.current, target, lerpFactor(delta));

    if (materialRef.current) {
      materialRef.current.uniforms.u_opacity.value = opacity.current;
    }
  });

  return (
    <BackgroundImageMesh
      texture={texture}
      shaders={shaders}
      size={[planeWidth, planeHeight]}
      meshRef={meshRef}
      materialRef={materialRef}
      initialOpacity={0}
      renderOrder={1}
    />
  );
});

export const ContentPanelBackground = memo(function ContentPanelBackground({
  focusColRef,
  focusSubRowRef,
  contentPanelVisibleRef,
}) {
  const shaders = useBackgroundShader();
  const lastFingerprint = useRef('');
  const [bgUrl, setBgUrl] = useState(null);

  useFrame(() => {
    const fingerprint = getSelectionFingerprint(focusColRef, focusSubRowRef);
    if (fingerprint !== lastFingerprint.current) {
      lastFingerprint.current = fingerprint;
      setBgUrl(getFocusedSubItem(focusColRef, focusSubRowRef)?.content?.background ?? null);
    }
  });

  if (!bgUrl || !shaders) return null;

  return (
    <Suspense fallback={null}>
      <BackgroundImagePlane
        key={bgUrl}
        url={bgUrl}
        shaders={shaders}
        contentPanelVisibleRef={contentPanelVisibleRef}
      />
    </Suspense>
  );
});
