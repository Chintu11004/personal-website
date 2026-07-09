import { useCallback, useRef } from 'react';
import { lerp, lerpFactor } from '../utils/animation';

export const SELECTION = {
  selectedScale: 1.15,
  unselectedScale: 0.83,
  selectedOpacity: 0.8,
  unselectedOpacity: 0.5,
  labelSelectedOpacity: 1,
  labelUnselectedOpacity: 0,
};

function getMasterOpacity(masterOpacity) {
  if (masterOpacity && typeof masterOpacity === 'object' && 'current' in masterOpacity) {
    return masterOpacity.current;
  }
  return masterOpacity ?? 1;
}

export function useSelectionAnimation({
  meshRef,
  materialRef,
  htmlRef,
  selectedScale = SELECTION.selectedScale,
  unselectedScale = SELECTION.unselectedScale,
  selectedOpacity = SELECTION.selectedOpacity,
  unselectedOpacity = SELECTION.unselectedOpacity,
  labelSelectedOpacity = SELECTION.labelSelectedOpacity,
  labelUnselectedOpacity = SELECTION.labelUnselectedOpacity,
  masterOpacity = 1,
  initialScale,
  initialShaderOpacity,
  initialLabelOpacity,
}) {
  const currentScale = useRef(initialScale);
  const currentShaderOpacity = useRef(initialShaderOpacity);
  const currentLabelOpacity = useRef(initialLabelOpacity);

  const applyInitial = useCallback(() => {
    const master = getMasterOpacity(masterOpacity);

    if (meshRef.current) {
      meshRef.current.scale.setScalar(currentScale.current);
    }

    if (htmlRef.current) {
      htmlRef.current.style.opacity = String(currentLabelOpacity.current * master);
    }
  }, [meshRef, htmlRef, masterOpacity]);

  const step = useCallback(
    (isSelected, delta, cameraPosition) => {
      const t = lerpFactor(delta);
      const targetScale = isSelected ? selectedScale : unselectedScale;
      const targetShaderOpacity = isSelected ? selectedOpacity : unselectedOpacity;
      const targetLabelOpacity = isSelected ? labelSelectedOpacity : labelUnselectedOpacity;
      const master = getMasterOpacity(masterOpacity);

      currentScale.current = lerp(currentScale.current, targetScale, t);
      currentShaderOpacity.current = lerp(currentShaderOpacity.current, targetShaderOpacity, t);
      currentLabelOpacity.current = lerp(currentLabelOpacity.current, targetLabelOpacity, t);

      const finalShaderOpacity = currentShaderOpacity.current * master;
      const finalLabelOpacity = currentLabelOpacity.current * master;

      if (meshRef.current) {
        meshRef.current.scale.setScalar(currentScale.current);
      }

      if (htmlRef.current) {
        htmlRef.current.style.opacity = String(finalLabelOpacity);
      }

      if (materialRef.current) {
        materialRef.current.uniforms.u_selected.value = isSelected ? 1.0 : 0.0;
        materialRef.current.uniforms.u_opacity.value = finalShaderOpacity;
        materialRef.current.uniforms.u_cameraPosition.value.copy(cameraPosition);
      }
    },
    [
      meshRef,
      materialRef,
      htmlRef,
      masterOpacity,
      selectedScale,
      unselectedScale,
      selectedOpacity,
      unselectedOpacity,
      labelSelectedOpacity,
      labelUnselectedOpacity,
    ]
  );

  return { step, applyInitial };
}
