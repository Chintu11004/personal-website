import { memo } from 'react';

export const BackgroundImageMesh = memo(function BackgroundImageMesh({
  texture,
  shaders,
  size,
  meshRef,
  materialRef,
  initialOpacity = 0,
  renderOrder = 1,
}) {
  const args = Array.isArray(size) ? size : [size, size];

  return (
    <mesh ref={meshRef} renderOrder={renderOrder}>
      <planeGeometry args={args} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={shaders.vertex}
        fragmentShader={shaders.fragment}
        uniforms={{
          u_texture: { value: texture },
          u_opacity: { value: initialOpacity },
        }}
        transparent
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
});
