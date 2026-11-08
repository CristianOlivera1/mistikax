import "server-only";

import { asc, eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/db";
import { profiles, siteSettings } from "@/db/schema";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { SITE_SETTINGS } from "./fixtures";
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

export const getTeam = cache(async function getTeam(): Promise<TeamMember[]> {
  const rows = await db
    .select()
    .from(profiles)
    .orderBy(asc(profiles.createdAt));

  if (rows.length === 0) return [];

  const emails = new Map<string, string>();
  let page: number | null = 1;

  while (page) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) break;

    for (const user of data.users) {
      if (user.email) emails.set(user.id, user.email);
    }

    page = data.nextPage;
  }

  return rows.map((row) => {
    const email = emails.get(row.id);

    return {
      id: row.id,
      name: row.fullName || email || "Sin nombre",
      email: email ?? "—",
      role: row.role,
      active: row.active,
    };
  });
});
