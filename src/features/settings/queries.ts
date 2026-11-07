import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { SITE_SETTINGS, TEAM } from "./fixtures";
import {
  SETTINGS_TABS,
  type SettingsTab,
  type SiteSettings,
  type TeamMember,
} from "./types";

function parseSettingsTabValue(
  value: string | string[] | undefined,
): SettingsTab {
  const tab = Array.isArray(value) ? value[0] : value;
  return SETTINGS_TABS.some((item) => item.value === tab)
    ? (tab as SettingsTab)
    : "general";
}

export function parseSettingsTab(
  value: string | string[] | undefined,
): SettingsTab {
  return parseSettingsTabValue(value);
}

export const getSiteSettings = cache(
  async function getSiteSettings(): Promise<SiteSettings> {
    const [row] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);

    if (!row) return { ...SITE_SETTINGS };

    return {
      storeName: row.storeName,
      description: row.description,
      contactEmail: row.email,
      whatsapp: row.whatsapp,
      address: row.address,
      stockThreshold: row.lowStockThreshold,
      shippingCents: row.shippingCents,
      freeShippingCents: row.freeShippingThresholdCents,
      leadTime: row.leadTime,
      paymentCard: row.paymentCard,
      paymentTransfer: row.paymentTransfer,
      paymentCod: row.paymentCod,
      paymentWallet: row.paymentWallet,
      transferInstructions: row.transferInstructions,
      primaryColor: row.primaryColor,
      accentColor: row.accentColor,
    };
  },
);

export function getTeam(): TeamMember[] {
  return TEAM.map((member) => ({ ...member }));
}
