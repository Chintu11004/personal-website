import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PLANE_WIDTH = 4;
const PLANE_HEIGHT = 1;

export function BackgroundRibbon({ contentPanelVisibleRef }) {
  const materialRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);

  sceneRef.current = scene;
  cameraRef.current = camera;

  useEffect(() => {
    let disposed = false;
    let mesh = null;
    let geometry = null;
    let material = null;
    let rafId = null;
    let started = false;

    const create = () => {
      const activeScene = sceneRef.current;
      const activeCamera = cameraRef.current;
      if (disposed || mesh || started || !activeCamera?.isOrthographicCamera) return;

      started = true;
      Promise.all([
        fetch('/shaders/vertex.glsl').then((res) => res.text()),
        fetch('/shaders/fragment.glsl').then((res) => res.text()),
      ]).then(([vertexShader, fragmentShader]) => {
        if (disposed || mesh) return;

        material = new THREE.ShaderMaterial({
          uniforms: {
            u_time: { value: 0.0 },
            u_cameraPosition: { value: activeCamera.position },
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

        geometry = new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, 128, 128);
        mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        mesh.renderOrder = 0;
        activeScene.add(mesh);
        materialRef.current = material;
      });
    };

    create();
    rafId = requestAnimationFrame(create);

    return () => {
      disposed = true;
      if (rafId !== null) cancelAnimationFrame(rafId);
      materialRef.current = null;
      if (mesh) sceneRef.current?.remove(mesh);
      geometry?.dispose();
      material?.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;

    const panelVisible = contentPanelVisibleRef?.current?.value ?? 0;
    materialRef.current.uniforms.u_opacity.value = 1 - panelVisible;
  });

  return null;
}
