"use client";

import { useTranslations } from "next-intl";
import { Bell } from 'lucide-react';
import Hero from "@/components/blocks/Hero";
import StatsBand, { type StatItem } from "@/components/blocks/StatsBand";
import ProductGrid from "@/components/blocks/ProductGrid";
import FeatureGrid, { type FeatureItem } from "@/components/blocks/FeatureGrid";
import CTA from "@/components/blocks/CTA";

type BillItem = { name: string; price: string; description: string };
type ReminderItem = { title: string; description: string };

export default function RecurringPage() {
  const t = useTranslations();

  const statItems = (
    Array.isArray(t.raw("recurring.stats.items")) ? t.raw("recurring.stats.items") : []
  ) as StatItem[];

  const billItems = (
    Array.isArray(t.raw("recurring.bills.items")) ? t.raw("recurring.bills.items") : []
  ) as BillItem[];

  const reminderItems = (
    Array.isArray(t.raw("recurring.reminders.items")) ? t.raw("recurring.reminders.items") : []
  ) as ReminderItem[];

  const products = billItems.map((item) => ({
    name: item.name,
    price: item.price,
    description: item.description,
  }));

  const features: FeatureItem[] = reminderItems.map((item) => ({
    title: item.title,
    description: item.description,
    icon: <Bell className="h-5 w-5" />,
  }));

  return (
    <main className="bg-background text-foreground">
      <Hero
        id="hero"
        variant="mesh"
        eyebrow={t("recurring.hero.eyebrow")}
        title={t("recurring.hero.title")}
        subtitle={t("recurring.hero.subtitle")}
        primaryCta={{ label: t("recurring.cta.primary"), href: "#bills" }}
        secondaryCta={{ label: t("recurring.cta.secondary"), href: "/budgets" }}
      />

      <StatsBand
        variant="glass"
        title={t("recurring.stats.title")}
        items={statItems}
      />

      <ProductGrid
        id="bills"
        eyebrow={t("recurring.bills.eyebrow")}
        title={t("recurring.bills.title")}
        subtitle={t("recurring.bills.subtitle")}
        products={products}
        columns={3}
        variant="compact"
      />

      <FeatureGrid
        variant="list"
        columns={2}
        eyebrow={t("recurring.reminders.eyebrow")}
        title={t("recurring.reminders.title")}
        subtitle={t("recurring.reminders.subtitle")}
        items={features}
      />

      <CTA
        variant="gradient"
        title={t("recurring.cta.title")}
        subtitle={t("recurring.cta.subtitle")}
        primaryCta={{ label: t("recurring.cta.primary"), href: "#bills" }}
        secondaryCta={{ label: t("recurring.cta.secondary"), href: "/budgets" }}
      />
    </main>
  );
}
