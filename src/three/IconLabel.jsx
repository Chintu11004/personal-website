import { memo } from 'react';
import { Html } from '@react-three/drei';

const LABEL_STYLE = {
  color: 'white',
  fontFamily: 'var(--font-sans)',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
};

export const IconLabel = memo(function IconLabel({
  label,
  position,
  htmlRef,
  fontSize = '14px',
  center = false,
  style = {},
}) {
  return (
    <Html
      ref={htmlRef}
      position={position}
      center={center}
      style={{ opacity: 0, ...LABEL_STYLE, fontSize, ...style }}
    >
      {label}
    </Html>
  );
});
