import { memo, useCallback, useEffect, useState } from 'react';
import { NAV_DECIDE_AUDIO } from '../three/introConfig';
import { playUiSound, unlockUiAudio } from '../utils/uiSound';
import './ProfileTrigger.css';

function ProfileTrigger({
  contentPanelVisibleRef,
  fullscreenPanelVisibleRef,
  profilePanelVisibleRef,
  profilePanelOpenRef,
  photoViewerOpenRef,
  introUiOpacityRef,
  introCompleteRef,
}) {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let frameId;

    const updateOpacity = () => {
      const panelVisible = contentPanelVisibleRef?.current?.value ?? 0;
      const fullscreenVisible = fullscreenPanelVisibleRef?.current?.value ?? 0;
      const profileVisible = profilePanelVisibleRef?.current?.value ?? 0;
      const overlayVisible = Math.max(fullscreenVisible, profileVisible);
      const viewerOpen = photoViewerOpenRef?.current ?? false;
      const introUi = introUiOpacityRef?.current?.value ?? 1;
      const baseOpacity = viewerOpen ? 0 : (1 - panelVisible) * (1 - overlayVisible);
      setOpacity(baseOpacity * introUi);
      frameId = requestAnimationFrame(updateOpacity);
    };

    updateOpacity();

    return () => cancelAnimationFrame(frameId);
  }, [
    contentPanelVisibleRef,
    fullscreenPanelVisibleRef,
    profilePanelVisibleRef,
    photoViewerOpenRef,
    introUiOpacityRef,
  ]);

  const handleClick = useCallback(() => {
    if (!introCompleteRef?.current || profilePanelOpenRef?.current) return;

    photoViewerOpenRef.current = false;
    profilePanelOpenRef.current = true;
    profilePanelVisibleRef.current.value = 0;

    unlockUiAudio([NAV_DECIDE_AUDIO]);
    void playUiSound(NAV_DECIDE_AUDIO);
  }, [photoViewerOpenRef, profilePanelOpenRef, profilePanelVisibleRef, introCompleteRef]);

  return (
    <button
      type="button"
      className="profile-trigger"
      style={{ opacity }}
      onClick={handleClick}
      aria-label="Click here for help in navigation"
    >
      <img src="/icons/31.png" alt="" />
      <span className="profile-trigger__label">Click here for help in navigation</span>
    </button>
  );
}

export default memo(ProfileTrigger);
