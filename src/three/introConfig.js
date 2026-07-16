export const INTRO = {
  ribbonStart: 1,
  ribbonDuration: 6,

  bgStart: 3,
  bgDuration: 5,

  logoStart: 2.5,
  logoFadeInDuration: 1.5,
  logoHoldDuration: 1.5,
  logoFadeOutDuration: 1.0,

  iconStart: 13.5,
  iconDuration: 0.8,
  iconStagger: 0.06,
  iconScaleStart: 5,

  uiStart: 13.5,
  uiDuration: 0.8,
  completeAt: 17.0,

  introPanelStart: 7.5,
  introPanelDuration: 5,

  /** Seconds after the last icon finishes its intro before vertical submenus appear. */
  subMenuDelay: 1,
};

export const BOOT_PANEL_CONTENT = {
  text: 'Press any Key to Boot',
};

export const INTRO_PANEL_CONTENT = {
  text: 'PHOTOSENSITIVE EPILEPSY\nIF YOU HAVE A HISTORY OF EPILEPSY OR SEIZURES, CONSULT A DOCTOR BEFORE USE. CERTAIN PATTERNS MAY TRIGGER SEIZURES WITH NO PRIOR HISTORY. BEFORE USING THIS PRODUCT, CAREFULLY READ THE INSTRUCTION MANUAL.',
};

export const STARTUP_AUDIO = '/music/start-up.mp3';
export const STARTUP_AUDIO_VOLUME = 1.8;
export const NAV_DECIDE_AUDIO = '/music/decide.mp3';
export const NAV_CANCEL_AUDIO = '/music/cancel.mp3';

function clampedProgress(elapsedTime, start, duration) {
  return Math.max(0, Math.min((elapsedTime - start) / duration, 1));
}

export function getRibbonOpacity(elapsedTime) {
  return clampedProgress(elapsedTime, INTRO.ribbonStart, INTRO.ribbonDuration);
}

export function getBackgroundOpacity(elapsedTime) {
  return clampedProgress(elapsedTime, INTRO.bgStart, INTRO.bgDuration);
}

export function getLogoLocalTime(elapsedTime) {
  return Math.max(0, elapsedTime - INTRO.logoStart);
}

export function getLogoAnimationEnd() {
  return (
    INTRO.logoStart +
    INTRO.logoFadeInDuration +
    INTRO.logoHoldDuration +
    INTRO.logoFadeOutDuration
  );
}

export function isIntroPanelVisible(elapsedTime) {
  return (
    elapsedTime >= INTRO.introPanelStart &&
    elapsedTime < INTRO.introPanelStart + INTRO.introPanelDuration
  );
}

export function getSubMenuEnabledAt(itemCount) {
  const lastIconFinish =
    INTRO.iconStart +
    Math.max(0, itemCount - 1) * INTRO.iconStagger +
    INTRO.iconDuration;

  return lastIconFinish + INTRO.subMenuDelay;
}

export function getIconIntroProgress(elapsedTime, index) {
  const iconT = clampedProgress(
    elapsedTime - index * INTRO.iconStagger,
    INTRO.iconStart,
    INTRO.iconDuration
  );
  const eased = 1 - Math.pow(1 - iconT, 3);

  return {
    opacity: eased,
    scale: INTRO.iconScaleStart - eased * (INTRO.iconScaleStart - 1),
  };
}
