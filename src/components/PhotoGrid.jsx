import { memo, useLayoutEffect, useRef, useState } from 'react';
import './PhotoGrid.css';

const GRID_ROW_GAP = 18;

export const PhotoGrid = memo(function PhotoGrid({ photos, focusRow, focusCol, cols = 5 }) {
  const viewportRef = useRef(null);
  const itemRef = useRef(null);
  const [rowHeight, setRowHeight] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!itemRef.current) return;

      const nextRowHeight = itemRef.current.offsetHeight + GRID_ROW_GAP;

      setRowHeight(nextRowHeight);
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (itemRef.current) observer.observe(itemRef.current);

    return () => observer.disconnect();
  }, [photos]);

  if (!photos || photos.length === 0) return null;

  const focusedIndex = focusRow * cols + focusCol;
  const translateY = rowHeight > 0 ? -focusRow * rowHeight : 0;

  return (
    <div className="photo-grid">
      <div className="photo-grid__viewport" ref={viewportRef}>
        <div
          className="photo-grid__track"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {photos.map((photo, index) => {
            const isFocused = index === focusedIndex;
            const isMeasureItem = index === 0;

            return (
              <div
                key={`${photo.src}-${index}`}
                ref={isMeasureItem ? itemRef : null}
                className={`photo-grid__item ${isFocused ? 'photo-grid__item--focused' : ''}`}
              >
                <div className="photo-grid__image">
                  <img src={photo.src} alt={photo.title || ''} loading="lazy" />
                </div>
                <div
                  className={`photo-grid__title ${isFocused ? 'photo-grid__title--visible' : ''}`}
                >
                  {photo.title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
