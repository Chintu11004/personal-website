import { navItems } from '../navItems';
import { openLauncherHref } from './openLauncherHref';
import { NAV_DECIDE_AUDIO } from '../introConfig';
import { playUiSound, unlockUiAudio } from '../../utils/uiSound';

const GRID_COLS = 5;
const NAV_SOUNDS = [NAV_DECIDE_AUDIO];

function setPhotoIndex(index, photoGridFocusRef) {
  if (!photoGridFocusRef?.current) return;
  photoGridFocusRef.current.row = Math.floor(index / GRID_COLS);
  photoGridFocusRef.current.col = index % GRID_COLS;
}

export function createPointerNavHandlers(refs, { navigateToCol, subMenusEnabled }) {
  const {
    focusColRef,
    focusSubRowRef,
    navDepthRef,
    photoGridFocusRef,
    photoViewerOpenRef,
    fullscreenOpenRef,
    introCompleteRef,
  } = refs;

  const canInteract = () =>
    introCompleteRef?.current && !fullscreenOpenRef?.current;

  const setDepth = (val) => {
    if (navDepthRef?.current) navDepthRef.current.value = val;
    if (val === 0) {
      if (photoViewerOpenRef) photoViewerOpenRef.current = false;
      if (fullscreenOpenRef) fullscreenOpenRef.current = false;
    }
  };

  const playDecide = () => {
    unlockUiAudio(NAV_SOUNDS);
    playUiSound(NAV_DECIDE_AUDIO);
  };

  const activateSubItem = (col, subRow) => {
    const subItems = navItems[col]?.items ?? [];
    const subItem = subItems[subRow];
    if (!subItem) return;

    if (subItem.type === 'folder') {
      setDepth(1);
      if (photoGridFocusRef?.current) {
        photoGridFocusRef.current.row = 0;
        photoGridFocusRef.current.col = 0;
      }
      playDecide();
      return;
    }
    if (subItem.type === 'photo' && subItem.src) {
      setDepth(1);
      photoViewerOpenRef.current = true;
      playDecide();
      return;
    }
    if (subItem.type === 'launcher' && subItem.href) {
      openLauncherHref(subItem.href);
      return;
    }
    if (subItem.type === 'describe') {
      fullscreenOpenRef.current = true;
      playDecide();
    }
  };

  return {
    onIconClick(colIndex) {
      if (!canInteract()) return;
      const depth = navDepthRef?.current?.value ?? 0;
      if (depth > 0) setDepth(0);
      if (focusColRef.current.value !== colIndex) {
        navigateToCol(colIndex);
        playDecide();
      }
    },

    onSubItemClick(colIndex, rowIndex) {
      if (!canInteract() || !subMenusEnabled) return;
      const depth = navDepthRef?.current?.value ?? 0;
      if (depth > 0) return;

      const col = focusColRef.current.value;
      const subRow = focusSubRowRef?.current?.values?.[colIndex] ?? 0;

      if (colIndex !== col) {
        navigateToCol(colIndex);
        if (focusSubRowRef?.current?.values) {
          focusSubRowRef.current.values[colIndex] = rowIndex;
        }
        playDecide();
        return;
      }

      if (rowIndex !== subRow) {
        if (focusSubRowRef?.current?.values) {
          focusSubRowRef.current.values[colIndex] = rowIndex;
        }
        playDecide();
        return;
      }

      activateSubItem(colIndex, rowIndex);
    },

    onPhotoClick(index) {
      if (!canInteract()) return;
      const depth = navDepthRef?.current?.value ?? 0;
      if (depth !== 1) return;

      const col = focusColRef.current.value;
      const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
      const subItem = navItems[col]?.items?.[subRow];
      if (subItem?.type !== 'folder') return;

      const gridRow = photoGridFocusRef?.current?.row ?? 0;
      const gridCol = photoGridFocusRef?.current?.col ?? 0;
      const currentIndex = gridRow * GRID_COLS + gridCol;

      if (index !== currentIndex) {
        setPhotoIndex(index, photoGridFocusRef);
        photoViewerOpenRef.current = false;
        playDecide();
        return;
      }

      const photos = subItem.photos ?? [];
      if (photos.length > 0) {
        photoViewerOpenRef.current = true;
        playDecide();
      }
    },
  };
}

export function createMeshPointerProps(introCompleteRef) {
  return {
    onPointerOver(e) {
      e.stopPropagation();
      if (!introCompleteRef?.current) return;
      document.body.style.cursor = 'pointer';
    },
    onPointerOut() {
      document.body.style.cursor = '';
    },
  };
}
