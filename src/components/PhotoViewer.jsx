import { memo } from 'react';
import './PhotoViewer.css';

export const PhotoViewer = memo(function PhotoViewer({ photo }) {
  if (!photo) return null;

  return (
    <div className="photo-viewer">
      <img
        src={photo.src}
        alt={photo.title || ''}
        className="photo-viewer__image"
      />
    </div>
  );
});
