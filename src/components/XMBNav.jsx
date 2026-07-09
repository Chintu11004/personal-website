import { useRef, useEffect } from 'react';
import { navItems } from '../three/NavIcons';
import './XMBNav.css';

export const navData = navItems;

function XMBNav({ focusColRef, focusSubRowRef }) {
  const pendingNavigationRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!focusColRef.current) return;

      const col = focusColRef.current.value;
      const subItems = navItems[col]?.items ?? [];
      const maxSubRow = Math.max(0, subItems.length - 1);

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          focusColRef.current.value = Math.max(0, col - 1);
          if (focusSubRowRef?.current) focusSubRowRef.current.value = 0;
          break;
        case 'ArrowRight':
          e.preventDefault();
          focusColRef.current.value = Math.min(navItems.length - 1, col + 1);
          if (focusSubRowRef?.current) focusSubRowRef.current.value = 0;
          break;
        case 'ArrowUp':
          if (!focusSubRowRef?.current || subItems.length === 0) return;
          e.preventDefault();
          focusSubRowRef.current.value = Math.max(0, focusSubRowRef.current.value - 1);
          break;
        case 'ArrowDown':
          if (!focusSubRowRef?.current || subItems.length === 0) return;
          e.preventDefault();
          focusSubRowRef.current.value = Math.min(maxSubRow, focusSubRowRef.current.value + 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          {
            const subItem = subItems[focusSubRowRef?.current?.value ?? 0];
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusColRef, focusSubRowRef]);

  return (
    <nav className="xmb-nav" aria-label="Main navigation">
    </nav>
  );
}

export default XMBNav;
