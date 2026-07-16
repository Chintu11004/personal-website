import { memo } from 'react';
import * as THREE from 'three';

export const ThumbnailIconMesh = memo(function ThumbnailIconMesh({
  texture,
  shaders,
  size,
  position = [0, 0, 0],
  meshRef,
  materialRef,
  initialOpacity = 0.5,
  renderOrder = 2,
  onClick,
  onPointerOver,
  onPointerOut,
}) {
  const args = Array.isArray(size) ? size : [size, size];

  return (
    <mesh
      ref={meshRef}
      position={position}
      renderOrder={renderOrder}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <planeGeometry args={args} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={shaders.vertex}
        fragmentShader={shaders.fragment}
        uniforms={{
          u_texture: { value: texture },
          u_opacity: { value: initialOpacity },
          u_selected: { value: 0.0 },
          u_cameraPosition: { value: new THREE.Vector3() },
        }}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
});
