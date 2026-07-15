import { memo, Suspense, useEffect, useLayoutEffect, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '../shaders/intro-logo-vertex.glsl?raw';
import fragmentShader from '../shaders/intro-logo-fragment.glsl?raw';
import { INTRO, getLogoLocalTime } from './introConfig';
import { getOrthoViewportSize } from './cameraConfig';

const LOGO_TEXTURE = '/images/PS3-Logo.jpg';
const LOGO_ASPECT = 6056 / 1438;
const LOGO_BASE_HEIGHT = 0.38;
const LOGO_SCALE = 0.5;
const LOGO_RIGHT_MARGIN = 0.25;
const LOGO_Z = 0.05;

const LOGO_HEIGHT = LOGO_BASE_HEIGHT * LOGO_SCALE;
const LOGO_WIDTH = LOGO_HEIGHT * LOGO_ASPECT;
const LOGO_SIZE = [LOGO_WIDTH, LOGO_HEIGHT];

function getLogoPosition(viewport) {
  return new THREE.Vector3(
    (viewport.width / 2 - LOGO_RIGHT_MARGIN - LOGO_WIDTH / 2),
    0,
    LOGO_Z
  );
}

const IntroLogoMesh = memo(function IntroLogoMesh() {
  const meshRef = useRef();
  const materialRef = useRef();
  const texture = useLoader(THREE.TextureLoader, LOGO_TEXTURE);
  const { camera, size, invalidate } = useThree();

  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  useLayoutEffect(() => {
    if (!meshRef.current) return;

    meshRef.current.position.copy(getLogoPosition(getOrthoViewportSize(camera, size)));
    invalidate();
  }, [camera, size, invalidate]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = getLogoLocalTime(
        state.clock.elapsedTime
      );
    }

    state.invalidate();
  });

  return (
    <mesh ref={meshRef} renderOrder={3}>
      <planeGeometry args={LOGO_SIZE} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          u_texture: { value: texture },
          u_time: { value: 0 },
          u_fadeInDuration: { value: INTRO.logoFadeInDuration },
          u_holdDuration: { value: INTRO.logoHoldDuration },
          u_fadeOutDuration: { value: INTRO.logoFadeOutDuration },
        }}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
      />
    </mesh>
  );
});

export const IntroLogo = memo(function IntroLogo() {
  return (
    <Suspense fallback={null}>
      <IntroLogoMesh />
    </Suspense>
  );
});
