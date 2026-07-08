import { useRef, useEffect } from 'react';
import './XMBNav.css';

export const navData = [
  { id: 'User', label: 'User', href: '#projects' },
  { id: 'Settings', label: 'Settings', href: '#about' },
  { id: 'Photos', label: 'Photo Projects', href: '#photos' },
  { id: 'SWE', label: 'SWE', href: '#swe' },
  { id: 'Games', label: 'Games', href: '#games' },
  { id: 'Network', label: 'Contact Me', href: '#contact' },
  { id: 'Friends', label: 'Friends', href: '#friends' }
];

function XMBNav({ focusColRef }) {
  const pendingNavigationRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!focusColRef.current) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          focusColRef.current.value = Math.max(0, focusColRef.current.value - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          focusColRef.current.value = Math.min(navData.length - 1, focusColRef.current.value + 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          const item = navData[focusColRef.current.value];
          if (item) {
            if (item.external) {
              window.open(item.href, '_blank', 'noopener,noreferrer');
            } else {
              window.location.hash = item.href;
            }
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusColRef]);

  return (
    <nav className="xmb-nav" aria-label="Main navigation">
    </nav>
  );
}

export default XMBNav;
