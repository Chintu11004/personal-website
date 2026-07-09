import { useCallback, useRef } from 'react';
import { lerp, lerpFactor } from '../utils/animation';

export const SELECTION = {
  selectedScale: 1.15,
  unselectedScale: 0.83,
  depthUnselectedScale: 0.55,
  selectedOpacity: 0.8,
  unselectedOpacity: 0.5,
  depthUnselectedOpacity: 0.15,
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
  positionRef,
  initialPosition = { x: 0, y: 0, z: 0 },
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
  const currentPosition = useRef({ ...initialPosition });

  const applyInitial = useCallback(() => {
    const master = getMasterOpacity(masterOpacity);

    if (meshRef.current) {
      meshRef.current.scale.setScalar(currentScale.current);
    }

    if (positionRef?.current) {
      positionRef.current.position.set(
        currentPosition.current.x,
        currentPosition.current.y,
        currentPosition.current.z
      );
    }

    if (htmlRef.current) {
      htmlRef.current.style.opacity = String(currentLabelOpacity.current * master);
    }
  }, [meshRef, htmlRef, positionRef, masterOpacity]);

  /**
   * Per-frame animation tick. Call once per frame from useFrame after computing targets.
   *
   * Callers own nav-state logic (focus, depth, selection) and pass explicit targets.
   * This hook lerps toward those targets and writes mesh scale, position, label opacity,
   * and shader uniforms.
   */
  const step = useCallback(
    (
      delta,
      cameraPosition,
      {
        isSelected,
        targetScale,
        targetShaderOpacity,
        targetLabelOpacity,
        targetX,
        targetY,
        targetZ,
      } = {}
    ) => {
      const t = lerpFactor(delta);
      const master = getMasterOpacity(masterOpacity);

      const resolvedScale = targetScale ?? (isSelected ? selectedScale : unselectedScale);
      const resolvedShaderOpacity =
        targetShaderOpacity ?? (isSelected ? selectedOpacity : unselectedOpacity);
      const resolvedLabelOpacity =
        targetLabelOpacity ?? (isSelected ? labelSelectedOpacity : labelUnselectedOpacity);

      currentScale.current = lerp(currentScale.current, resolvedScale, t);
      currentShaderOpacity.current = lerp(currentShaderOpacity.current, resolvedShaderOpacity, t);
      currentLabelOpacity.current = lerp(currentLabelOpacity.current, resolvedLabelOpacity, t);

      if (positionRef?.current) {
        if (targetX !== undefined) {
          currentPosition.current.x = lerp(currentPosition.current.x, targetX, t);
        }
        if (targetY !== undefined) {
          currentPosition.current.y = lerp(currentPosition.current.y, targetY, t);
        }
        if (targetZ !== undefined) {
          currentPosition.current.z = lerp(currentPosition.current.z, targetZ, t);
        }

        positionRef.current.position.set(
          currentPosition.current.x,
          currentPosition.current.y,
          currentPosition.current.z
        );
      }

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
      positionRef,
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
