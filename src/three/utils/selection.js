import { navItems } from '../navItems';

export function getSelectionFingerprint(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
  return `${col}:${subRow}`;
}

export function getFocusedSubItem(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
  const item = navItems[col];
  const subItem = item?.items?.[subRow];
  if (subItem) return subItem;
  if (item?.type === 'describe' && item?.content) return item;
  return null;
}

export function isLauncherIdleCandidate(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const items = navItems[col]?.items;
  if (!items?.length) return false;
  return getFocusedSubItem(focusColRef, focusSubRowRef)?.type === 'launcher';
}

export function getSubItemPhotos(item) {
  if (!item) return [];
  if (item.type === 'folder') return item.photos ?? [];
  if (item.type === 'photo' && item.src) {
    return [{
      src: item.src,
      title: item.title ?? item.label ?? '',
      date: item.date ?? '',
    }];
  }
  return [];
}
