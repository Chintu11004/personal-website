import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertexShader from '../shaders/vertex.glsl?raw';
import fragmentShader from '../shaders/fragment.glsl?raw';

const PLANE_WIDTH = 4;
const PLANE_HEIGHT = 1;

export function BackgroundRibbon({ contentPanelVisibleRef }) {
  const materialRef = useRef(null);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    if (!camera?.isOrthographicCamera) return;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_cameraPosition: { value: camera.position },
        u_fresnelBias: { value: -0.05 },
        u_noiseScale: { value: new THREE.Vector3(0.5, 0.8, 1.0) },
        u_displacement: { value: 0.8 },
        u_amplitude: { value: 0.3 },
        u_planeWidth: { value: PLANE_WIDTH },
        u_opacity: { value: 1.0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      side: THREE.DoubleSide,
    });

    const geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 128, 128);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 0;
    scene.add(mesh);
    materialRef.current = material;

    return () => {
      materialRef.current = null;
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
    };
  }, [scene, camera]);

  useFrame((state) => {
    if (!materialRef.current) {
      state.invalidate();
      return;
    }

    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;

    const panelVisible = contentPanelVisibleRef?.current?.value ?? 0;
    materialRef.current.uniforms.u_opacity.value = 1 - panelVisible;

    // Ribbon is continuously animated; keep the demand loop alive.
    state.invalidate();
  });

  return null;
}
