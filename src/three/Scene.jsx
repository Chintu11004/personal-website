import { useLayoutEffect, memo } from 'react';
import { useThree } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { BackgroundRibbon } from './BackgroundRibbon';
import { SceneBackground } from './SceneBackground';
import { ContentPanel } from './ContentPanel';
import { PhotoGridPanel } from './PhotoGridPanel';
import { PhotoViewerPanel } from './PhotoViewerPanel';
import { ContentPanelBackground } from './ContentPanelBackground';
import { FullscreenPanel } from './FullscreenPanel';
import { NavIcons } from './NavIcons';
import { IntroController } from './IntroController';
import { IntroLogo } from './IntroLogo';
import { IntroPanel } from './IntroPanel';
import { CAMERA } from './cameraConfig';

export const Scene = memo( function Scene({ focusColRef, focusSubRowRef, navDepthRef, contentPanelVisibleRef, fullscreenPanelVisibleRef, fullscreenOpenRef, photoGridPanelVisibleRef, focusCol, exitingCols, removingExitingCols, photoGridFocusRef, photoViewerOpenRef, introBackgroundOpacityRef, introRibbonOpacityRef, introUiOpacityRef, introCompleteRef, subMenuEnabledRef, onSubMenusEnabled, onIntroComplete, subMenusEnabled, introLogoMounted }) {
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
      <SceneBackground introBackgroundOpacityRef={introBackgroundOpacityRef} />
      <BackgroundRibbon
        contentPanelVisibleRef={contentPanelVisibleRef}
        introRibbonOpacityRef={introRibbonOpacityRef}
      />
      {introLogoMounted && <IntroLogo />}
      <IntroPanel />
      <ContentPanelBackground
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        contentPanelVisibleRef={contentPanelVisibleRef}
        introCompleteRef={introCompleteRef}
      />
      <ContentPanel
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        contentPanelVisibleRef={contentPanelVisibleRef}
        introCompleteRef={introCompleteRef}
      />
      <PhotoGridPanel
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        navDepthRef={navDepthRef}
        photoGridFocusRef={photoGridFocusRef}
        photoGridPanelVisibleRef={photoGridPanelVisibleRef}
        photoViewerOpenRef={photoViewerOpenRef}
      />
      <PhotoViewerPanel
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        photoGridFocusRef={photoGridFocusRef}
        photoViewerOpenRef={photoViewerOpenRef}
      />
      <FullscreenPanel
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
        fullscreenOpenRef={fullscreenOpenRef}
      />
      <NavIcons
        focusCol={focusCol}
        exitingCols={exitingCols}
        removingExitingCols={removingExitingCols}
        focusColRef={focusColRef}
        focusSubRowRef={focusSubRowRef}
        navDepthRef={navDepthRef}
        contentPanelVisibleRef={contentPanelVisibleRef}
        fullscreenPanelVisibleRef={fullscreenPanelVisibleRef}
        introCompleteRef={introCompleteRef}
        subMenusEnabled={subMenusEnabled}
      />
      <IntroController
        introBackgroundOpacityRef={introBackgroundOpacityRef}
        introRibbonOpacityRef={introRibbonOpacityRef}
        introUiOpacityRef={introUiOpacityRef}
        introCompleteRef={introCompleteRef}
        subMenuEnabledRef={subMenuEnabledRef}
        onSubMenusEnabled={onSubMenusEnabled}
        onIntroComplete={onIntroComplete}
      />
    </>
  );
});
