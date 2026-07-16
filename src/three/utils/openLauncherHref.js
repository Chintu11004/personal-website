export function openLauncherHref(href) {
  if (href.startsWith('mailto:')) {
    window.location.href = href;
    return;
  }

  window.open(href, '_blank', 'noopener,noreferrer');
}
