"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, Calendar, Sparkles, Activity, type LucideIcon } from 'lucide-react';
import Hero from "@/components/blocks/Hero";
import StatsBand, { type StatItem } from "@/components/blocks/StatsBand";
import FeatureGrid, { type FeatureItem } from "@/components/blocks/FeatureGrid";
import CTA from "@/components/blocks/CTA";
import { Section, SectionHeader } from "@/components/blocks/shared";

type AlertItem = { title: string; description: string };

function iconFor(title: string): LucideIcon {
  const lower = title.toLowerCase();
  if (lower.includes("exceeded") || lower.includes("overrun")) return AlertTriangle;
  if (lower.includes("due")) return Calendar;
  if (lower.includes("milestone")) return Sparkles;
  return Activity;
}

export default function NotificationsPage() {
  const t = useTranslations();

  const statItems = (
    Array.isArray(t.raw("notifications.stats.items")) ? t.raw("notifications.stats.items") : []
  ) as StatItem[];

  const alertItems = (
    Array.isArray(t.raw("notifications.alerts.items")) ? t.raw("notifications.alerts.items") : []
  ) as AlertItem[];

  const preferenceItems = (
    Array.isArray(t.raw("notifications.preferences.items")) ? t.raw("notifications.preferences.items") : []
  ) as FeatureItem[];

  return (
    <main className="bg-background">
      <Hero
        id="overview"
        eyebrow={t("notifications.hero.eyebrow")}
        title={t("notifications.hero.title")}
        subtitle={t("notifications.hero.subtitle")}
        primaryCta={{ label: t("notifications.cta.primary"), href: "/settings" }}
        secondaryCta={{ label: t("notifications.cta.secondary"), href: "/goals" }}
        variant="mesh"
      />

      <StatsBand
        title={t("notifications.stats.title")}
        items={statItems}
        variant="glass"
      />

      <Section id="alerts" className="bg-background">
        <SectionHeader
          eyebrow={t("notifications.alerts.eyebrow")}
          title={t("notifications.alerts.title")}
          subtitle={t("notifications.alerts.subtitle")}
        />
        <ul className="space-y-4">
          {alertItems.map((item) => {
            const Icon = iconFor(item.title);
            return (
              <li
                key={item.title}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      <FeatureGrid
        id="preferences"
        eyebrow={t("notifications.preferences.eyebrow")}
        title={t("notifications.preferences.title")}
        subtitle={t("notifications.preferences.subtitle")}
        items={preferenceItems}
        columns={3}
        variant="cards"
      />

      <CTA
        title={t("notifications.cta.title")}
        subtitle={t("notifications.cta.subtitle")}
        primaryCta={{ label: t("notifications.cta.primary"), href: "/settings" }}
        secondaryCta={{ label: t("notifications.cta.secondary"), href: "/goals" }}
        variant="gradient"
      />
    </main>
  );
}
