"use client";

import { useTranslations } from "next-intl";
import { Calendar } from 'lucide-react';
import Hero from "@/components/blocks/Hero";
import StatsBand, { type StatItem } from "@/components/blocks/StatsBand";
import FeatureGrid, { type FeatureItem } from "@/components/blocks/FeatureGrid";
import ProductGrid from "@/components/blocks/ProductGrid";
import CTA from "@/components/blocks/CTA";

type MonthlyItem = { title: string; description: string };
type DownloadItem = { name: string; price: string; description: string };

export default function ReportsPage() {
  const t = useTranslations();

  const statItems = (
    Array.isArray(t.raw("reports.stats.items")) ? t.raw("reports.stats.items") : []
  ) as StatItem[];

  const monthlyItems = (
    Array.isArray(t.raw("reports.monthly.items")) ? t.raw("reports.monthly.items") : []
  ) as MonthlyItem[];

  const downloadItems = (
    Array.isArray(t.raw("reports.downloads.items")) ? t.raw("reports.downloads.items") : []
  ) as DownloadItem[];

  const featureItems: FeatureItem[] = monthlyItems.map((item) => ({
    title: item.title,
    description: item.description,
    icon: <Calendar className="h-5 w-5" />,
  }));

  const products = downloadItems.map((item) => ({
    name: item.name,
    price: item.price,
    description: item.description,
  }));

  return (
    <main>
      <Hero
        id="overview"
        eyebrow={t("reports.hero.eyebrow")}
        title={t("reports.hero.title")}
        subtitle={t("reports.hero.subtitle")}
        primaryCta={{ label: t("reports.cta.primary"), href: "/transactions" }}
        secondaryCta={{ label: t("reports.cta.secondary"), href: "/budgets" }}
        variant="mesh"
      />

      <StatsBand
        id="stats"
        title={t("reports.stats.title")}
        items={statItems}
        variant="glass"
      />

      <FeatureGrid
        id="monthly"
        eyebrow={t("reports.monthly.eyebrow")}
        title={t("reports.monthly.title")}
        subtitle={t("reports.monthly.subtitle")}
        items={featureItems}
        columns={3}
        variant="cards"
      />

      <ProductGrid
        id="downloads"
        eyebrow={t("reports.downloads.eyebrow")}
        title={t("reports.downloads.title")}
        subtitle={t("reports.downloads.subtitle")}
        products={products}
        columns={3}
        variant="default"
      />

      <CTA
        title={t("reports.cta.title")}
        subtitle={t("reports.cta.subtitle")}
        primaryCta={{ label: t("reports.cta.primary"), href: "/transactions" }}
        secondaryCta={{ label: t("reports.cta.secondary"), href: "/budgets" }}
        variant="gradient"
      />
    </main>
  );
}
