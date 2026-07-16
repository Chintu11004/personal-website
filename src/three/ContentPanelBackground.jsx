import { memo, Suspense, useEffect, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getFocusedSubItem } from './utils/selection';
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
  contentPanelOpenRef,
  introCompleteRef,
}) {
  const shaders = useBackgroundShader();
  const bgUrlRef = useRef(null);
  const [bgUrl, setBgUrl] = useState(null);

  useFrame(() => {
    if (!introCompleteRef?.current) return;

    const panelOpen = contentPanelOpenRef?.current?.value ?? false;
    const panelOpacity = contentPanelVisibleRef?.current?.value ?? 0;

    if (panelOpen) {
      const nextBg =
        getFocusedSubItem(focusColRef, focusSubRowRef)?.content?.background ?? null;
      if (nextBg !== bgUrlRef.current) {
        bgUrlRef.current = nextBg;
        setBgUrl(nextBg);
      }
      return;
    }

    if (panelOpacity <= 0.01 && bgUrlRef.current !== null) {
      bgUrlRef.current = null;
      setBgUrl(null);
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
