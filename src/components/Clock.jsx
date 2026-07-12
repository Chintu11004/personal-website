import { useState, useEffect } from 'react';
import './Clock.css';

function Clock({ contentPanelVisibleRef, photoViewerOpenRef }) {
  const [time, setTime] = useState(new Date());
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let frameId;

    const updateOpacity = () => {
      const panelVisible = contentPanelVisibleRef?.current?.value ?? 0;
      const viewerOpen = photoViewerOpenRef?.current ?? false;
      setOpacity(viewerOpen ? 0 : 1 - panelVisible);
      frameId = requestAnimationFrame(updateOpacity);
    };

    updateOpacity();

    return () => cancelAnimationFrame(frameId);
  }, [contentPanelVisibleRef, photoViewerOpenRef]);

  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <div className="clock" style={{ opacity }}>
      <div className="clock-date">{formatDate(time)}</div>
      <div className="clock-time">{formatTime(time)}</div>
    </div>
  );
}

export default Clock;
