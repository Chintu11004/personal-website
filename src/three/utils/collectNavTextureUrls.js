export function collectNavTextureUrls(items) {
  const urls = new Set();

  const visit = (item) => {
    if (item.image) urls.add(item.image);
    if (item.src) urls.add(item.src);
    if (item.content?.background) urls.add(item.content.background);
    item.items?.forEach(visit);
  };

  items.forEach(visit);
  urls.add('/icons/dif.png');
  urls.add('/icons/63.png');

  return [...urls];
}
