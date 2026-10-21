"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Home as HomeIcon, ArrowUpDown, Circle, Lock, Layout, ArrowDown, ArrowUp, Calendar, Bell, Activity, Sparkles } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { BRAND } from "@/lib/data";
import { Button } from "@/components/ui/button";

type CategoryCopy = { name: string; description: string };
type StatCopy = { value: string; label: string };
type FeatureCopy = { title: string; description: string };
type StepCopy = { title: string; description: string };

const CATEGORY_META = [
  { icon: HomeIcon, amount: 1450, budget: 1500 },
  { icon: ArrowUpDown, amount: 220, budget: 300 },
  { icon: Circle, amount: 540, budget: 600 },
  { icon: Lock, amount: 400, budget: 500 },
] as const;

const STAT_META = [
  { icon: Layout },
  { icon: ArrowDown },
  { icon: ArrowUp },
  { icon: Calendar },
] as const;

const FEATURE_META = [
  { icon: Layout },
  { icon: Bell },
  { icon: Activity },
  { icon: Lock },
] as const;

export default function Home() {
  const t = useTranslations();

  const categoryItems = (
    Array.isArray(t.raw("home.categories.items")) ? t.raw("home.categories.items") : []
  ) as CategoryCopy[];
  const statItems = (
    Array.isArray(t.raw("home.stats.items")) ? t.raw("home.stats.items") : []
  ) as StatCopy[];
  const featureItems = (
    Array.isArray(t.raw("home.features.items")) ? t.raw("home.features.items") : []
  ) as FeatureCopy[];
  const stepItems = (
    Array.isArray(t.raw("home.insights.steps")) ? t.raw("home.insights.steps") : []
  ) as StepCopy[];
  const chartDays = (
    Array.isArray(t.raw("home.insights.chartDays")) ? t.raw("home.insights.chartDays") : []
  ) as string[];

  const categories = useMemo(
    () =>
      categoryItems.map((item, i) => ({
        ...item,
        icon: CATEGORY_META[i]?.icon ?? Circle,
        amount: CATEGORY_META[i]?.amount ?? 0,
        budget: CATEGORY_META[i]?.budget ?? 1,
      })),
    [categoryItems],
  );

  const stats = useMemo(
    () =>
      statItems.map((item, i) => ({
        ...item,
        icon: STAT_META[i]?.icon ?? Layout,
      })),
    [statItems],
  );

  const features = useMemo(
    () =>
      featureItems.map((item, i) => ({
        ...item,
        icon: FEATURE_META[i]?.icon ?? Layout,
      })),
    [featureItems],
  );

  const weeklySpend = useMemo(
    () =>
      chartDays.map((day, i) => ({
        day,
        amount: Math.round(60 + 40 * Math.sin(i / 1.3) + i * 4),
      })),
    [chartDays],
  );

  return (
    <main className="bg-background text-foreground">
      {/* HERO */}
      <Reveal>
        <section id="overview" className="relative overflow-hidden bg-mesh">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-24 md:py-32 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
                {BRAND.name}
              </span>
              <h1 className="mt-6 text-balance font-display text-4xl font-bold tracking-tight md:text-6xl">
                {t("home.hero.titleStart")}{" "}
                <span className="text-gradient">dollar goes...</span>
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="shadow-glow">
                  <a href="/transactions">{t("home.hero.primaryCta")}</a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="/budgets">{t("home.hero.secondaryCta")}</a>
                </Button>
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }} className="glass-strong rounded-2xl p-6 shadow-glow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("home.hero.cardLabel")}
                </span>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {t("home.hero.cardBadge")}
                </span>
              </div>
              <div className="mt-4 font-display text-4xl font-bold tracking-tight">{t("home.hero.cardAmount")}</div>
              <p className="mt-1 text-sm text-muted-foreground">{t("home.hero.cardHint")}</p>

              <div className="mt-6 flex h-24 w-full items-end gap-1">
                {weeklySpend.map((d) => {
                  const max = Math.max(...weeklySpend.map((w) => w.amount), 1);
                  const h = Math.max(8, Math.round((d.amount / max) * 100));
                  return (<div key={d.day} className="flex-1 rounded-t-sm bg-primary/70" style={{ height: `${h}%` }} title={`${d.day}: $${d.amount}`} />);
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {categories.map((cat) => (<span key={cat.name} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground">
                  <cat.icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                  {cat.name}
                </span>))}
              </div>
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* STATS */}
      <Reveal>
        <section id="summary" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("home.stats.title")}
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">{t("home.stats.subtitle")}</p>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (<motion.div key={stat.label} variants={fadeInUp} className="glass surface-elevated rounded-lg p-6">
              <stat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>))}
          </motion.div>
        </section>
      </Reveal>

      {/* CATEGORIES */}
      <Reveal>
        <section id="categories" className="bg-secondary/40 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("home.categories.title")}
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">{t("home.categories.subtitle")}</p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => {
                const pct = Math.min(100, Math.round((cat.amount / cat.budget) * 100));
                return (
                  <motion.div key={cat.name} variants={fadeInUp} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <cat.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold">{cat.name}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{cat.description}</p>
                    <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary transition-all duration-500 ease-out" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">${cat.amount} / ${cat.budget}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* FEATURES */}
      <Reveal>
        <section id="features" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
              {t("home.features.title")}
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">{t("home.features.subtitle")}</p>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </Reveal>

      {/* INSIGHTS / STEPS */}
      <Reveal>
        <section id="insights" className="bg-secondary/40 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-2xl">
              <h2 className="text-balance font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("home.insights.title")}
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">{t("home.insights.subtitle")}</p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {stepItems.map((step, i) => (
                <motion.div key={step.title} variants={fadeInUp} className="rounded-lg border border-border bg-card p-6 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </Reveal>

      {/* CTA */}
      <Reveal>
        <section id="cta" className="bg-gradient-brand py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-balance font-display text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              {t("home.cta.title")}
            </h2>
            <p className="mt-4 text-pretty text-primary-foreground/80">{t("home.cta.subtitle")}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg" variant="secondary">
                <a href="/transactions">{t("home.cta.primary")}</a>
              </Button>
              <Button asChild size="lg" variant="outline" className="glass border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="/budgets">{t("home.cta.secondary")}</a>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}
