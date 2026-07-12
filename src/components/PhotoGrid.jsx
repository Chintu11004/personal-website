import { memo, useLayoutEffect, useMemo, useRef, useState } from 'react';
import './PhotoGrid.css';

const GRID_ROW_GAP = 18;

function getTranslateY(rowHeights, focusRow) {
  let offset = 0;
  for (let row = 0; row < focusRow; row += 1) {
    offset += (rowHeights[row] ?? 0) + GRID_ROW_GAP;
  }
  return -offset;
}

export const PhotoGrid = memo(function PhotoGrid({ photos, focusRow, focusCol, cols = 5 }) {
  const viewportRef = useRef(null);
  const itemRefs = useRef([]);
  const [rowHeights, setRowHeights] = useState([]);

  const rowCount = useMemo(
    () => Math.ceil(photos.length / cols),
    [photos.length, cols]
  );

  useLayoutEffect(() => {
    itemRefs.current.length = photos.length;

    const measure = () => {
      const heights = Array.from({ length: rowCount }, (_, row) => {
        let maxHeight = 0;

        for (let col = 0; col < cols; col += 1) {
          const index = row * cols + col;
          const item = itemRefs.current[index];
          if (item) {
            maxHeight = Math.max(maxHeight, item.offsetHeight);
          }
        }

        return maxHeight;
      });

      setRowHeights(heights);
    };

    measure();

    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    itemRefs.current.forEach((item) => {
      if (item) observer.observe(item);
    });

    return () => observer.disconnect();
  }, [photos, rowCount, cols, focusRow, focusCol]);

  if (!photos || photos.length === 0) return null;

  const focusedIndex = focusRow * cols + focusCol;
  const translateY = getTranslateY(rowHeights, focusRow);

  return (
    <div className="photo-grid">
      <div className="photo-grid__viewport" ref={viewportRef}>
        <div
          className="photo-grid__track"
          style={{ transform: `translateY(${translateY}px)` }}
        >
          {photos.map((photo, index) => {
            const isFocused = index === focusedIndex;

            return (
              <div
                key={`${photo.src}-${index}`}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
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
