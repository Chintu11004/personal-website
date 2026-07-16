import { getAudioContext, loadAudioBuffer } from './uiSound';

const MAX_VOLUME = 0.45;

let activeSrc = null;
let sourceNode = null;
let gainNode = null;

function disconnectActive() {
  if (sourceNode) {
    try {
      sourceNode.stop();
    } catch {
      // already stopped
    }
    sourceNode.disconnect();
    sourceNode = null;
  }
  if (gainNode) {
    gainNode.disconnect();
    gainNode = null;
  }
  activeSrc = null;
}

export function stopLauncherMusic() {
  disconnectActive();
}

export async function updateLauncherMusic(src, panelOpacity) {
  if (!src) {
    stopLauncherMusic();
    return;
  }

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return;
    }
  }

  if (src !== activeSrc) {
    disconnectActive();

    let buffer;
    try {
      buffer = await loadAudioBuffer(src);
    } catch {
      return;
    }

    sourceNode = ctx.createBufferSource();
    gainNode = ctx.createGain();
    sourceNode.buffer = buffer;
    sourceNode.loop = true;
    gainNode.gain.value = 0;
    sourceNode.connect(gainNode);
    gainNode.connect(ctx.destination);
    sourceNode.start(0);
    activeSrc = src;
  }

  if (gainNode) {
    gainNode.gain.value = panelOpacity * MAX_VOLUME;
  }
}
