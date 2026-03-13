/**
 * Central theme and color constants.
 * Import from '@/constants' to avoid duplicate hex values across the app.
 */
export const THEME_BLUE = "#0f2b5c";
export const NAVY = "#0F2B5B";
export const TEAL = "#00A99D";
export const TEAL_BLUE = "#00a99d";

export const PAGE_BG = "#F7F8FA";

export const COLORS = {
  sidebarBg: THEME_BLUE,
  sidebarActive: "rgba(255, 255, 255, 0.1)",
  sidebarText: "#94A3B8",
  activeText: "#FFFFFF",
  mainBg: "#F8F9FA",
  cardBg: "#F7F8FA",
  border: "#E9ECEF",
  borderLight: "#dee2e6",
  muted: "#94A3B8",
  dimmed: "#868e96",
} as const;
