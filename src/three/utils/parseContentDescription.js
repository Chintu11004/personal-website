const CONTENT_MARKER_PATTERN = /\[(youtube|image):\s*([^\]]+)\]/gi;

function extractYoutubeId(value) {
  const trimmed = value.trim();

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtube.com')) return url.searchParams.get('v');
    if (url.hostname === 'youtu.be') return url.pathname.replace(/^\//, '');
  } catch {
    // Not a URL — treat as a bare video id.
  }

  return trimmed;
}

function normalizeImageSrc(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return trimmed;
  return `/${trimmed}`;
}

export function parseContentDescription(description) {
  if (!description) return [];

  const blocks = [];
  let lastIndex = 0;

  for (const match of description.matchAll(CONTENT_MARKER_PATTERN)) {
    const text = description.slice(lastIndex, match.index);
    if (text) blocks.push({ type: 'text', content: text });

    const kind = match[1].toLowerCase();
    const value = match[2].trim();

    if (kind === 'youtube') {
      const videoId = extractYoutubeId(value);
      if (videoId) blocks.push({ type: 'youtube', videoId });
    } else if (kind === 'image') {
      const src = normalizeImageSrc(value);
      if (src) blocks.push({ type: 'image', src });
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = description.slice(lastIndex);
  if (remaining) blocks.push({ type: 'text', content: remaining });

  return blocks.length ? blocks : [{ type: 'text', content: description }];
}
