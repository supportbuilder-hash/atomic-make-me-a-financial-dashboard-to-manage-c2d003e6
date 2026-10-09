"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import Hero from "@/components/blocks/Hero";
import StatsBand, { type StatItem } from "@/components/blocks/StatsBand";
import FeatureGrid, { type FeatureItem } from "@/components/blocks/FeatureGrid";
import CTA from "@/components/blocks/CTA";
import { Section, SectionHeader } from "@/components/blocks/shared";

type GoalItem = { name: string; price: string; description: string };

function parseProgress(price: string): { current: number; target: number; percent: number } {
  const parts = price.split("/").map((part) => part.trim());
  const parseAmount = (raw: string | undefined): number => {
    if (!raw) return 0;
    const cleaned = raw.replace(/\$/g, "").replace(/,/g, "").trim();
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const current = parseAmount(parts[0]);
  const target = parseAmount(parts[1]);
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return { current, target, percent };
}

export default function GoalsPage() {
  const t = useTranslations();

  const statItems = (
    Array.isArray(t.raw("goals.stats.items")) ? t.raw("goals.stats.items") : []
  ) as StatItem[];

  const goalItems = (
    Array.isArray(t.raw("goals.list.items")) ? t.raw("goals.list.items") : []
  ) as GoalItem[];

  const tipItems = (
    Array.isArray(t.raw("goals.tips.items")) ? t.raw("goals.tips.items") : []
  ) as FeatureItem[];

  const goals = useMemo(
    () => goalItems.map((item) => ({ ...item, progress: parseProgress(item.price) })),
    [goalItems],
  );

  return (
    <main className="bg-background text-foreground">
      <Hero
        id="overview"
        variant="mesh"
        eyebrow={t("goals.hero.eyebrow")}
        title={t("goals.hero.title")}
        subtitle={t("goals.hero.subtitle")}
        primaryCta={{ label: t("goals.cta.primary"), href: "#list" }}
        secondaryCta={{ label: t("goals.cta.secondary"), href: "/budgets" }}
      />

      <StatsBand variant="glass" title={t("goals.stats.title")} items={statItems} />

      <Section id="list" className="bg-background">
        <SectionHeader
          eyebrow={t("goals.list.eyebrow")}
          title={t("goals.list.title")}
          subtitle={t("goals.list.subtitle")}
        />
        <div className="grid gap-6 md:grid-cols-2">
          {goals.map((goal, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-lg font-semibold">{goal.name}</h3>
                <span className="text-sm font-semibold text-primary">{goal.price}</span>
              </div>
              <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-brand transition-all duration-500 ease-out"
                  style={{ width: `${goal.progress.percent}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground">{goal.progress.percent}%</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{goal.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <FeatureGrid
        variant="minimal"
        columns={3}
        eyebrow={t("goals.tips.eyebrow")}
        title={t("goals.tips.title")}
        subtitle={t("goals.tips.subtitle")}
        items={tipItems}
      />

      <CTA
        variant="gradient"
        title={t("goals.cta.title")}
        subtitle={t("goals.cta.subtitle")}
        primaryCta={{ label: t("goals.cta.primary"), href: "#list" }}
        secondaryCta={{ label: t("goals.cta.secondary"), href: "/budgets" }}
      />
    </main>
  );
}
