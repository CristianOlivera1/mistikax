import "server-only";

import { SITE_SETTINGS, TEAM } from "./fixtures";
import {
  SETTINGS_TABS,
  type SettingsTab,
  type SiteSettings,
  type TeamMember,
} from "./types";

export function parseSettingsTab(
  value: string | string[] | undefined,
): SettingsTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return SETTINGS_TABS.some((item) => item.value === tab)
    ? (tab as SettingsTab)
    : "general";
}

export function getSiteSettings(): SiteSettings {
  return { ...SITE_SETTINGS };
}

export function getTeam(): TeamMember[] {
  return TEAM.map((member) => ({ ...member }));
}
