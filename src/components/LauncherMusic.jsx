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

    const tick = () => {
      if (!introCompleteRef?.current) {
        stopLauncherMusic();
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
