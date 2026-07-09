import { useLayoutEffect, memo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { BackgroundRibbon } from './BackgroundRibbon';
import { NavIcons } from './NavIcons';

const CAMERA = {
  frustumSize: 10,
  position: [-0.09479328005746984, 0.01034594383217302, 2.230247723145003],
  target: [0, 0, 0],
  zoom: 6.264789413459975,
};

export const Scene = memo( function Scene({ focusColRef, focusSubRowRef, navDepthRef, focusCol, exitingCols, removingExitingCols }) {
  const size = useThree((state) => state.size);
  const camera = useThree((state) => state.camera);
  const aspect = size.width / size.height;
  const frustumHalf = CAMERA.frustumSize / 2;

  useLayoutEffect(() => {
    if (!camera?.isOrthographicCamera) return;

    camera.left = -frustumHalf * aspect;
    camera.right = frustumHalf * aspect;
    camera.top = frustumHalf;
    camera.bottom = -frustumHalf;
    camera.updateProjectionMatrix();
  }, [aspect, frustumHalf, camera]);

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={CAMERA.position}
        zoom={CAMERA.zoom}
        near={0.1}
        far={1000}
      />
      <BackgroundRibbon />
      <NavIcons
        focusCol={focusCol}
        exitingCols={exitingCols}
        removingExitingCols={removingExitingCols}
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        navDepthRef={navDepthRef}
      />
    </>
  );
});
