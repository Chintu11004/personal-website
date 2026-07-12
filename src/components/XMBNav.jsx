import { useEffect } from 'react';
import { navItems } from '../three/navItems';
import './XMBNav.css';

export const navData = navItems;

function XMBNav({ focusColRef, focusSubRowRef, navDepthRef, navigateToCol, photoGridFocusRef }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!focusColRef.current) return;

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
      };

      const GRID_COLS = 5;
      const currentSubItem = subItems[getSubRow()];
      const isFolder = currentSubItem?.type === 'folder';
      const photos = currentSubItem?.photos ?? [];
      const maxPhotoIndex = Math.max(0, photos.length - 1);

      // At depth 1 on a folder, all arrow keys control the photo grid
      if (depth === 1 && isFolder) {
        const gridRow = photoGridFocusRef?.current?.row ?? 0;
        const gridCol = photoGridFocusRef?.current?.col ?? 0;
        const currentIndex = gridRow * GRID_COLS + gridCol;

        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            if (gridCol > 0) {
              photoGridFocusRef.current.col = gridCol - 1;
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (currentIndex + 1 <= maxPhotoIndex && gridCol < GRID_COLS - 1) {
              photoGridFocusRef.current.col = gridCol + 1;
            }
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (gridRow > 0) {
              photoGridFocusRef.current.row = gridRow - 1;
            }
            break;
          case 'ArrowDown':
            e.preventDefault();
            const nextRowIndex = (gridRow + 1) * GRID_COLS + gridCol;
            if (nextRowIndex <= maxPhotoIndex) {
              photoGridFocusRef.current.row = gridRow + 1;
            }
            break;
          case 'Escape':
          case 'Backspace':
            e.preventDefault();
            setDepth(0);
            photoGridFocusRef.current.row = 0;
            photoGridFocusRef.current.col = 0;
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
            break;
          }
          navigateToCol(Math.max(0, col - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (depth > 0) {
            setDepth(0);
            break;
          }
          navigateToCol(Math.min(navItems.length - 1, col + 1));
          break;
        case 'ArrowUp':
          if (!focusSubRowRef?.current || subItems.length === 0) return;
          e.preventDefault();
          setSubRow(Math.max(0, getSubRow() - 1));
          break;
        case 'ArrowDown':
          if (!focusSubRowRef?.current || subItems.length === 0) return;
          e.preventDefault();
          setSubRow(Math.min(maxSubRow, getSubRow() + 1));
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (subItems.length > 0 && depth === 0) {
            const subItem = subItems[getSubRow()];
            // Only enter depth 1 for folders
            if (subItem?.type === 'folder') {
              setDepth(1);
              photoGridFocusRef.current.row = 0;
              photoGridFocusRef.current.col = 0;
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
                window.location.hash = href;
              }
            }
          }
          break;
        case 'Escape':
        case 'Backspace':
          if (depth > 0) {
            e.preventDefault();
            setDepth(0);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusColRef, focusSubRowRef, navDepthRef, navigateToCol, photoGridFocusRef]);

  return (
    <nav className="xmb-nav" aria-label="Main navigation">
    </nav>
  );
}

export default XMBNav;
