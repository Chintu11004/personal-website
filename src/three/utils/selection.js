import { navItems } from '../navItems';

export function getSelectionFingerprint(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
  return `${col}:${subRow}`;
}

export function getFocusedSubItem(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const subRow = focusSubRowRef?.current?.values?.[col] ?? 0;
  return navItems[col]?.items?.[subRow] ?? null;
}

export function isLauncherIdleCandidate(focusColRef, focusSubRowRef) {
  const col = focusColRef?.current?.value ?? 0;
  const items = navItems[col]?.items;
  if (!items?.length) return false;
  return getFocusedSubItem(focusColRef, focusSubRowRef)?.type === 'launcher';
}
