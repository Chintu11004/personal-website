export function collectLauncherMusicUrls(items) {
  const urls = new Set();

  for (const item of items) {
    for (const subItem of item.items ?? []) {
      if (subItem.type === 'launcher' && subItem.content?.music) {
        urls.add(subItem.content.music);
      }
    }
  }

  return urls;
}
