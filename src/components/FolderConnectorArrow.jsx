import { memo } from 'react';
import './FolderConnectorArrow.css';

export const FolderConnectorArrow = memo(function FolderConnectorArrow({ x, y }) {
  return (
    <div
      className="folder-connector-arrow"
      style={{ left: x, top: y }}
      aria-hidden="true"
    />
  );
});
