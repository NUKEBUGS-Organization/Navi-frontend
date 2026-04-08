const TOUR_VERSION = "v1";

export function orgWelcomeTourStorageKey(userId: string): string {
  return `navi_welcome_tour_${TOUR_VERSION}_${userId}`;
}

export function superAdminWelcomeTourStorageKey(userId: string): string {
  return `navi_super_welcome_tour_${TOUR_VERSION}_${userId}`;
}

export function isOrgWelcomeTourDone(userId: string): boolean {
  return localStorage.getItem(orgWelcomeTourStorageKey(userId)) === "1";
}

export function markOrgWelcomeTourDone(userId: string): void {
  localStorage.setItem(orgWelcomeTourStorageKey(userId), "1");
}

export function clearOrgWelcomeTour(userId: string): void {
  localStorage.removeItem(orgWelcomeTourStorageKey(userId));
}

export function isSuperAdminWelcomeTourDone(userId: string): boolean {
  return localStorage.getItem(superAdminWelcomeTourStorageKey(userId)) === "1";
}

export function markSuperAdminWelcomeTourDone(userId: string): void {
  localStorage.setItem(superAdminWelcomeTourStorageKey(userId), "1");
}

export function clearSuperAdminWelcomeTour(userId: string): void {
  localStorage.removeItem(superAdminWelcomeTourStorageKey(userId));
}

/** Settings page can dispatch this to reopen the org-app tour. */
export const REPLAY_ORG_TOUR_EVENT = "navi-replay-org-tour";
export const REPLAY_SUPER_TOUR_EVENT = "navi-replay-super-tour";
