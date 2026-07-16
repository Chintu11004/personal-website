import { navItems } from '../navItems';
import { NAV_CANCEL_AUDIO } from '../introConfig';
import { playUiSound, unlockUiAudio } from '../../utils/uiSound';

const NAV_SOUNDS = [NAV_CANCEL_AUDIO];

export function performNavCancel({
  focusColRef,
  focusSubRowRef,
  navDepthRef,
  photoViewerOpenRef,
  fullscreenOpenRef,
  introCompleteRef,
}) {
  if (!focusColRef?.current) return false;
  if (!introCompleteRef?.current) return false;

  unlockUiAudio(NAV_SOUNDS);

  if (fullscreenOpenRef?.current) {
    fullscreenOpenRef.current = false;
    playUiSound(NAV_CANCEL_AUDIO);
    return true;
  }

  const col = focusColRef.current.value;
  const depth = navDepthRef?.current?.value ?? 0;
  const subItems = navItems[col]?.items ?? [];
  const getSubRow = () => focusSubRowRef?.current?.values?.[col] ?? 0;

  const setDepth = (val) => {
    if (navDepthRef?.current) navDepthRef.current.value = val;
    if (val === 0) {
      if (photoViewerOpenRef) photoViewerOpenRef.current = false;
      if (fullscreenOpenRef) fullscreenOpenRef.current = false;
    }
  };

  const currentSubItem = subItems[getSubRow()];
  const isFolder = currentSubItem?.type === 'folder';
  const isPhoto = currentSubItem?.type === 'photo';

  if (depth === 1 && isPhoto) {
    if (photoViewerOpenRef?.current) {
      photoViewerOpenRef.current = false;
      setDepth(0);
      playUiSound(NAV_CANCEL_AUDIO);
      return true;
    }
    return false;
  }

  if (depth === 1 && isFolder) {
    const viewerOpen = photoViewerOpenRef?.current ?? false;

    if (viewerOpen) {
      photoViewerOpenRef.current = false;
      playUiSound(NAV_CANCEL_AUDIO);
      return true;
    }

    photoViewerOpenRef.current = false;
    setDepth(0);
    playUiSound(NAV_CANCEL_AUDIO);
    return true;
  }

  if (depth > 0) {
    setDepth(0);
    playUiSound(NAV_CANCEL_AUDIO);
    return true;
  }

  return false;
}
