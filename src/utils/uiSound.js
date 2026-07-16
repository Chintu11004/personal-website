let audioContext = null;
const buffers = new Map();
const loading = new Map();

export function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

export async function loadAudioBuffer(src) {
  if (buffers.has(src)) return buffers.get(src);
  if (loading.has(src)) return loading.get(src);

  const promise = (async () => {
    const response = await fetch(src);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await getAudioContext().decodeAudioData(arrayBuffer);
    buffers.set(src, buffer);
    loading.delete(src);
    return buffer;
  })();

  loading.set(src, promise);
  return promise;
}

export function preloadUiSound(src) {
  void loadAudioBuffer(src).catch(() => {});
}

/** Call once from a user gesture (keydown/click) to satisfy autoplay policy. */
export function unlockUiAudio(sources) {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {});
  }
  for (const src of sources) {
    preloadUiSound(src);
  }
}

export async function playUiSound(src, volume = 1) {
  const ctx = getAudioContext();
  let buffer = buffers.get(src);

  if (!buffer) {
    try {
      buffer = await loadAudioBuffer(src);
    } catch {
      return false;
    }
  }

  if (ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }

  try {
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
    return true;
  } catch {
    return false;
  }
}
