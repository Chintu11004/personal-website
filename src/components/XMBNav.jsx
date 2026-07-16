import { useEffect } from 'react';
import { navItems } from '../three/navItems';
import { openLauncherHref } from '../three/utils/openLauncherHref';
import { NAV_CANCEL_AUDIO, NAV_DECIDE_AUDIO } from '../three/introConfig';
import { performNavCancel } from '../three/utils/navCancel';
import { playUiSound, preloadUiSound, unlockUiAudio } from '../utils/uiSound';
import './XMBNav.css';

export const navData = navItems;

const GRID_COLS = 5;
const NAV_SOUNDS = [NAV_DECIDE_AUDIO, NAV_CANCEL_AUDIO];

preloadUiSound(NAV_DECIDE_AUDIO);
preloadUiSound(NAV_CANCEL_AUDIO);

function playDecide() {
  playUiSound(NAV_DECIDE_AUDIO);
}

function setPhotoIndex(index, photoGridFocusRef) {
  if (!photoGridFocusRef?.current) return;
  photoGridFocusRef.current.row = Math.floor(index / GRID_COLS);
  photoGridFocusRef.current.col = index % GRID_COLS;
}

function XMBNav({ focusColRef, focusSubRowRef, navDepthRef, navigateToCol, photoGridFocusRef, photoViewerOpenRef, fullscreenOpenRef, profilePanelOpenRef, introCompleteRef, subMenusEnabled }) {
  useEffect(() => {
    const cancelRefs = {
      focusColRef,
      focusSubRowRef,
      navDepthRef,
      photoViewerOpenRef,
      fullscreenOpenRef,
      profilePanelOpenRef,
      introCompleteRef,
    };

    const cancel = () => performNavCancel(cancelRefs);

    const handleContextMenu = (e) => {
      if (!introCompleteRef?.current) return;
      e.preventDefault();
      cancel();
    };

    const handleKeyDown = (e) => {
      if (!focusColRef.current) return;
      if (!introCompleteRef?.current) return;

      unlockUiAudio(NAV_SOUNDS);

      if (fullscreenOpenRef?.current || profilePanelOpenRef?.current) {
        switch (e.key) {
          case 'Escape':
          case 'Backspace':
            e.preventDefault();
            cancel();
            break;
          default:
            break;
        }
        return;
      }

      const col = focusColRef.current.value;
      const depth = navDepthRef?.current?.value ?? 0;
      const subItems = navItems[col]?.items ?? [];
      const maxSubRow = Math.max(0, subItems.length - 1);
      const getSubRow = () => focusSubRowRef?.current?.values?.[col] ?? 0;
      const setSubRow = (val) => {
        if (focusSubRowRef?.current?.values) focusSubRowRef.current.values[col] = val;
      };
      const setDepth = (val) => {
        if (navDepthRef?.current) navDepthRef.current.value = val;
        if (val === 0) {
          if (photoViewerOpenRef) photoViewerOpenRef.current = false;
          if (fullscreenOpenRef) fullscreenOpenRef.current = false;
          if (profilePanelOpenRef) profilePanelOpenRef.current = false;
        }
      };

      const currentSubItem = subItems[getSubRow()];
      const isFolder = currentSubItem?.type === 'folder';
      const isPhoto = currentSubItem?.type === 'photo';
      const photos = currentSubItem?.photos ?? [];
      const maxPhotoIndex = Math.max(0, photos.length - 1);

      // At depth 1 on a photo item, only the viewer is open (no grid)
      if (depth === 1 && isPhoto) {
        if (photoViewerOpenRef?.current) {
          switch (e.key) {
            case 'Escape':
            case 'Backspace':
              e.preventDefault();
              cancel();
              break;
            default:
              break;
          }
        }
        return;
      }

      // At depth 1 on a folder, arrow keys control the photo grid or viewer carousel
      if (depth === 1 && isFolder) {
        const gridRow = photoGridFocusRef?.current?.row ?? 0;
        const gridCol = photoGridFocusRef?.current?.col ?? 0;
        const currentIndex = gridRow * GRID_COLS + gridCol;
        const viewerOpen = photoViewerOpenRef?.current ?? false;

        if (viewerOpen) {
          switch (e.key) {
            case 'ArrowLeft':
              e.preventDefault();
              if (currentIndex > 0) {
                setPhotoIndex(currentIndex - 1, photoGridFocusRef);
              }
              break;
            case 'ArrowRight':
              e.preventDefault();
              if (currentIndex < maxPhotoIndex) {
                setPhotoIndex(currentIndex + 1, photoGridFocusRef);
              }
              break;
            case 'Escape':
            case 'Backspace':
              e.preventDefault();
              cancel();
              break;
            default:
              break;
          }
          return;
        }

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (gridCol > 0) {
              photoGridFocusRef.current.col = gridCol - 1;
              playDecide();
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentIndex + 1 <= maxPhotoIndex && gridCol < GRID_COLS - 1) {
              photoGridFocusRef.current.col = gridCol + 1;
              playDecide();
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (gridRow > 0) {
              photoGridFocusRef.current.row = gridRow - 1;
              playDecide();
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            {
              const nextRowIndex = (gridRow + 1) * GRID_COLS + gridCol;
              if (nextRowIndex <= maxPhotoIndex) {
                photoGridFocusRef.current.row = gridRow + 1;
                playDecide();
              }
            }
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            if (photos.length > 0) {
              photoViewerOpenRef.current = true;
              playDecide();
            }
            break;
          case 'Escape':
          case 'Backspace':
            e.preventDefault();
            cancel();
            break;
          default:
            break;
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (depth > 0) {
            setDepth(0);
            playDecide();
            break;
          }
          {
            const nextCol = Math.max(0, col - 1);
            if (nextCol !== col) {
              navigateToCol(nextCol);
              playDecide();
            }
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (depth > 0) {
            setDepth(0);
            playDecide();
            break;
          }
          {
            const nextCol = Math.min(navItems.length - 1, col + 1);
            if (nextCol !== col) {
              navigateToCol(nextCol);
              playDecide();
            }
          }
          break;
        case 'ArrowUp':
          if (!subMenusEnabled || !focusSubRowRef?.current || subItems.length === 0) return;
          e.preventDefault();
          {
            const nextSubRow = Math.max(0, getSubRow() - 1);
            if (nextSubRow !== getSubRow()) {
              setSubRow(nextSubRow);
              playDecide();
            }
          }
          break;
        case 'ArrowDown':
          if (!subMenusEnabled || !focusSubRowRef?.current || subItems.length === 0) return;
          e.preventDefault();
          {
            const nextSubRow = Math.min(maxSubRow, getSubRow() + 1);
            if (nextSubRow !== getSubRow()) {
              setSubRow(nextSubRow);
              playDecide();
            }
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (subMenusEnabled && subItems.length > 0 && depth === 0) {
            const subItem = subItems[getSubRow()];
            if (subItem?.type === 'folder') {
              setDepth(1);
              photoGridFocusRef.current.row = 0;
              photoGridFocusRef.current.col = 0;
              playDecide();
              break;
            }
            if (subItem?.type === 'photo' && subItem?.src) {
              setDepth(1);
              photoViewerOpenRef.current = true;
              playDecide();
              break;
            }
            if (subItem?.type === 'launcher' && subItem?.href) {
              openLauncherHref(subItem.href);
              break;
            }
            if (subItem?.type === 'describe') {
              fullscreenOpenRef.current = true;
              playDecide();
              break;
            }
            break;
          }
          {
            const subItem = subItems[getSubRow()];
            const item = navItems[col];
            const href = subItem?.href ?? item?.href;
            if (href) {
              if (item?.external) {
                window.open(href, '_blank', 'noopener,noreferrer');
              } else {
                window.location.href = href;
              }
            }
          }
          break;
        case 'Escape':
        case 'Backspace':
          if (depth > 0) {
            e.preventDefault();
            cancel();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [focusColRef, focusSubRowRef, navDepthRef, navigateToCol, photoGridFocusRef, photoViewerOpenRef, fullscreenOpenRef, profilePanelOpenRef, introCompleteRef, subMenusEnabled]);

  return (
    <nav className="xmb-nav" aria-label="Main navigation">
    </nav>
  );
}

export default XMBNav;
