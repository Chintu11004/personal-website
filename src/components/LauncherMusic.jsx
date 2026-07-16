import { useEffect } from 'react';
import { getFocusedSubItem } from '../three/utils/selection';
import { stopLauncherMusic, updateLauncherMusic } from '../utils/launcherMusic';

function LauncherMusic({
  focusColRef,
  focusSubRowRef,
  contentPanelVisibleRef,
  contentPanelOpenRef,
  introCompleteRef,
}) {
  useEffect(() => {
    let frameId = 0;
    let tabVisible = document.visibilityState === 'visible';

    const onVisibilityChange = () => {
      tabVisible = document.visibilityState === 'visible';
      if (!tabVisible) {
        stopLauncherMusic();
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    const tick = () => {
      if (!introCompleteRef?.current || !tabVisible) {
        if (!tabVisible) stopLauncherMusic();
      } else {
        const panelOpen = contentPanelOpenRef?.current?.value ?? false;
        const panelOpacity = contentPanelVisibleRef?.current?.value ?? 0;
        const subItem = getFocusedSubItem(focusColRef, focusSubRowRef);
        const musicSrc =
          panelOpen && subItem?.type === 'launcher' ? subItem.content?.music : null;

        if (!musicSrc) {
          stopLauncherMusic();
        } else {
          void updateLauncherMusic(musicSrc, panelOpacity);
        }
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      cancelAnimationFrame(frameId);
      stopLauncherMusic();
    };
  }, [
    focusColRef,
    focusSubRowRef,
    contentPanelVisibleRef,
    contentPanelOpenRef,
    introCompleteRef,
  ]);

  return null;
}

export default LauncherMusic;
