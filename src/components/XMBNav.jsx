import { useState, useEffect, useCallback, useRef } from 'react';
import './XMBNav.css';
import { syncNavIcons } from '../three/scene';

const navData = [
  {
    id: 'main',
    items: [
      { id: 'User', label: 'User', href: '#projects', image: '/images/retroarch.png' },
      { id: 'Settings', label: 'Settings', href: '#about', image: '/images/setting.png'},
      { id: 'Photos', label: 'Photo Projects', href: '#photos', image: '/images/images.png' },
      { id: 'SWE', label: 'SWE', href: '#swe', image: '/images/Source Code - Various.png' },
      { id: 'Games', label: 'Games', href: '#games', image: '/images/default-content.png' },
      { id: 'Network', label: 'Contact Me', href: '#contact', image: '/images/wifi.png' },
      { id: 'Friends', label: 'Friends', href: '#friends', image: '/images/friends.png' }

    ]
  }
];

function XMBNav() {
  const [focus, setFocus] = useState({ row: 0, col: 0 });
  const iconRefs = useRef([]);

  const getCurrentItem = useCallback(() => {
    const row = navData[focus.row];
    return row?.items[focus.col];
  }, [focus]);

  const moveLeft = useCallback(() => {
    setFocus(prev => {
      const row = navData[prev.row];
      if (!row) return prev;
      const newCol = Math.max(0, prev.col - 1);
      return { ...prev, col: newCol };
    });
  }, []);

  const moveRight = useCallback(() => {
    setFocus(prev => {
      const row = navData[prev.row];
      if (!row) return prev;
      const newCol = Math.min(row.items.length - 1, prev.col + 1);
      return { ...prev, col: newCol };
    });
  }, []);

  const moveUp = useCallback(() => {
    setFocus(prev => {
      if (prev.row === 0) return prev;
      const newRow = prev.row - 1;
      const newRowData = navData[newRow];
      const newCol = Math.min(prev.col, newRowData.items.length - 1);
      return { row: newRow, col: newCol };
    });
  }, []);

  const moveDown = useCallback(() => {
    setFocus(prev => {
      if (prev.row >= navData.length - 1) return prev;
      const newRow = prev.row + 1;
      const newRowData = navData[newRow];
      const newCol = Math.min(prev.col, newRowData.items.length - 1);
      return { row: newRow, col: newCol };
    });
  }, []);

  const activate = useCallback(() => {
    const item = getCurrentItem();
    if (!item) return;
    
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.hash = item.href;
    }
  }, [getCurrentItem]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveLeft();
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveRight();
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveUp();
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveDown();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          activate();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveLeft, moveRight, moveUp, moveDown, activate]);

  const handleItemClick = (rowIdx, colIdx, item) => {
    setFocus({ row: rowIdx, col: colIdx });
    
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.hash = item.href;
    }
  };

  useEffect(() => {
    syncNavIcons({
      iconElements: iconRefs.current,
      focusCol: focus.col,
      focusRow: focus.row
    });
  }, [focus]);

  // TODO on screen resize

  return (
    <nav className="xmb-nav" aria-label="Main navigation">
      {navData.map((row, rowIdx) => (
        <div
          key={row.id}
          className={`xmb-row ${focus.row === rowIdx ? 'active-row' : ''}`}
          data-row={rowIdx}
        >
          {row.items.map((item, colIdx) => {
            const isSelected = focus.row === rowIdx && focus.col === colIdx;
            const colOffset = colIdx - focus.col;

            return (
              <div
                key={item.id}
                className={`xmb-item ${isSelected ? 'selected' : ''}`}
                onClick={() => handleItemClick(rowIdx, colIdx, item)}
                aria-current={isSelected ? 'true' : undefined}
                style={{ '--col-offset': colOffset }}
              >
                <div
                  className="xmb-icon-wrap"
                  ref={(el) => {
                    if (el) iconRefs.current[colIdx] = el;
                  }}
                  aria-hidden="true"
                />
                <span className="xmb-item-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      ))}
      
      <div className="xmb-hint">
        Use arrow keys to navigate • Enter to select
      </div>
    </nav>
  );
}

export default XMBNav;
