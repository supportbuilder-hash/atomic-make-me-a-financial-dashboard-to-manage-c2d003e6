"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Home as HomeIcon, ArrowUpDown, Circle, Lock, Layout, ArrowDown, ArrowUp, Calendar, Bell, Activity, Check, Sparkles } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { fadeInUp, staggerContainer } from "@/lib/motion";
import { BRAND } from "@/lib/data";
import { cn } from "@/lib/utils";

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
              <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight md:text-6xl">
                {t("home.hero.titleStart")}{" "}
                <span
                  className="text-gradient"
                  style={{
                    color: "#f97316"
                  }}>dollar goes...</span>
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
                {t("home.hero.subtitle")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/transactions" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {t("home.hero.primaryCta")}
                </Link>
                <Link href="/budgets" className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  {t("home.hero.secondaryCta")}
                </Link>
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
              <div className="mt-4 text-4xl font-bold tracking-tight">{t("home.hero.cardAmount")}</div>
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
        <section id="summary" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-12 max-w-2xl">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {t("home.stats.title")}
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">{t("home.stats.subtitle")}</p>
          </div>
          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (<motion.div key={stat.label} variants={fadeInUp} className="glass surface-elevated rounded-2xl p-6">
              <stat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <div className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{stat.value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>))}
          </motion.div>
        </section>
      </Reveal>
      {/* CATEGORIES */}
      <Reveal>
        <section id="categories" className="bg-secondary/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t("home.categories.eyebrow")}
              </span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("home.categories.title")}
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">{t("home.categories.subtitle")}</p>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {categories.map((cat, i) => {
                const pct = Math.min(100, Math.round((cat.amount / cat.budget) * 100));
                return (
                  <Reveal key={cat.name} delay={i * 0.08}>
                    <div
                      className={cn(
                        "rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-1",
                        i === 0 && "md:col-span-2",
                      )}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <cat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                          </span>
                          <div>
                            <div className="font-semibold">{cat.name}</div>
                            <div className="text-sm text-muted-foreground">{cat.description}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${cat.amount.toLocaleString("en-US")}</div>
                          <div className="text-xs text-muted-foreground">
                            {t("home.categories.of")} ${cat.budget.toLocaleString("en-US")}
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      </Reveal>
      {/* INSIGHTS */}
      <Reveal>
        <section id="insights" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t("home.insights.eyebrow")}
              </span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("home.insights.title")}
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">{t("home.insights.subtitle")}</p>
              <ul className="mt-8 space-y-5">
                {stepItems.map((step, i) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div>
                      <div className="font-semibold">{step.title}</div>
                      <div className="text-sm text-muted-foreground">{step.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("home.insights.chartTitle")}
                </span>
                <Activity className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <div className="flex h-64 w-full items-end gap-2">
                {weeklySpend.map((d) => {
                  const max = Math.max(...weeklySpend.map((w) => w.amount), 1);
                  const h = Math.max(6, Math.round((d.amount / max) * 100));
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex w-full flex-1 items-end">
                        <div className="w-full rounded-t-md bg-primary/80 transition-all duration-300" style={{ height: `${h}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </Reveal>
      {/* FEATURES */}
      <Reveal>
        <section id="features" className="bg-secondary/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-12 max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-wide text-primary">
                {t("home.features.eyebrow")}
              </span>
              <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight md:text-4xl">
                {t("home.features.title")}
              </h2>
              <p className="mt-4 text-pretty text-muted-foreground">{t("home.features.subtitle")}</p>
            </div>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} className="divide-y divide-border rounded-2xl border border-border bg-card">
              {features.map((feature) => (<motion.div key={feature.title} variants={fadeInUp} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:gap-8">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <div className="font-semibold">{feature.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{feature.description}</div>
                </div>
              </motion.div>))}
            </motion.div>
          </div>
        </section>
      </Reveal>
      {/* CTA */}
      <Reveal>
        <section id="get-started" className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-brand px-8 py-16 text-center shadow-glow md:px-16">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground md:text-4xl">
              {t("home.cta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
              {t("home.cta.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/transactions" className="inline-flex items-center justify-center rounded-lg bg-primary-foreground px-6 py-3 text-sm font-semibold text-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {t("home.cta.primaryCta")}
              </Link>
              <Link href="/budgets" className="glass inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                {t("home.cta.secondaryCta")}
              </Link>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}