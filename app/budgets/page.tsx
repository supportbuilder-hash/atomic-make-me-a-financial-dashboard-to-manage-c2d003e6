"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { Home, Activity, Circle, Star, Check, AlertTriangle, AlertCircle, Save, PiggyBank as PiggyBankFallback } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

type CategoryData = {
  id: string;
  name: string;
  icon: string;
  limit: number;
  spent: number;
};

type BudgetStatus = "good" | "warning" | "over";

const ICONS: Record<string, typeof Home> = {
  home: Home,
  activity: Activity,
  circle: Circle,
  star: Star,
};

function formatUSD(value: number): string {
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function getStatus(pct: number): BudgetStatus {
  if (pct >= 100) return "over";
  if (pct >= 80) return "warning";
  return "good";
}

export default function BudgetsPage() {
  const t = useTranslations();

  const categoryData = (
    Array.isArray(t.raw("budgets.categories")) ? t.raw("budgets.categories") : []
  ) as CategoryData[];

  const [budgets, setBudgets] = useState<CategoryData[]>(() =>
    categoryData.map((c) => ({ ...c })),
  );
  const [editingLimits, setEditingLimits] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    categoryData.forEach((c) => {
      initial[c.id] = String(c.limit);
    });
    return initial;
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const totals = useMemo(() => {
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const remaining = totalBudgeted - totalSpent;
    const saving = budgets.find((b) => b.id === "saving");
    const savingsRate = saving && saving.limit > 0 ? Math.round((saving.spent / saving.limit) * 100) : 0;
    return { totalBudgeted, totalSpent, remaining, savingsRate };
  }, [budgets]);

  const chartData = useMemo(
    () => budgets.map((b) => ({ name: b.name, budget: b.limit, actual: b.spent })),
    [budgets],
  );

  const handleLimitChange = (id: string, value: string) => {
    setEditingLimits((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = () => {
    setBudgets((prev) =>
      prev.map((b) => {
        const parsed = Number(editingLimits[b.id]);
        return Number.isFinite(parsed) && parsed > 0 ? { ...b, limit: parsed } : b;
      }),
    );
    setShowSuccess(true);
    window.setTimeout(() => setShowSuccess(false), 2500);
  };

  const statusBadge = (status: BudgetStatus) => {
    if (status === "over") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
          {t("budgets.cards.statusOver")}
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-foreground">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
          {t("budgets.cards.statusWarning")}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        {t("budgets.cards.statusGood")}
      </span>
    );
  };

  const progressBarClasses = (status: BudgetStatus) =>
    cn(
      "h-full rounded-full transition-all duration-500 ease-out",
      status === "good" && "bg-primary",
      status === "warning" && "bg-accent",
      status === "over" && "bg-foreground/70",
    );

  return (
    <main className="bg-background">
      {/* Overview */}
      <Reveal>
        <section className="relative overflow-hidden bg-mesh">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t("budgets.hero.eyebrow")}
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t("budgets.hero.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground md:text-lg">
              {t("budgets.hero.subtitle")}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("budgets.stats.totalBudgeted")}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
                  {formatUSD(totals.totalBudgeted)}
                </p>
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("budgets.stats.totalSpent")}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
                  {formatUSD(totals.totalSpent)}
                </p>
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("budgets.stats.remaining")}
                </p>
                <p className="mt-2 text-2xl font-bold text-gradient md:text-3xl">
                  {formatUSD(totals.remaining)}
                </p>
              </div>
              <div className="glass rounded-2xl p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t("budgets.stats.savingsRate")}
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground md:text-3xl">
                  {totals.savingsRate}%
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Budget cards */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {t("budgets.cards.sectionTitle")}
            </h2>
            <p className="mt-2 text-muted-foreground">{t("budgets.cards.sectionSubtitle")}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {budgets.map((b, i) => {
              const Icon = ICONS[b.icon] ?? PiggyBankFallback;
              const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
              const status = getStatus(pct);
              const remainingAmount = b.limit - b.spent;
              return (
                <Reveal key={b.id} delay={i * 0.06}>
                  <div className="surface-elevated flex h-full flex-col rounded-2xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                      </span>
                      {statusBadge(status)}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground">{b.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("budgets.cards.spentOf", {
                        spent: formatUSD(b.spent),
                        limit: formatUSD(b.limit),
                      })}
                    </p>

                    <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={progressBarClasses(status)}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{pct}%</span>
                      <span className="text-muted-foreground">
                        {remainingAmount >= 0
                          ? t("budgets.cards.remainingLabel", { value: formatUSD(remainingAmount) })
                          : t("budgets.cards.remainingLabel", { value: formatUSD(0) })}
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      </Reveal>

      {/* Budget vs actual chart */}
      <Reveal delay={0.05}>
        <section className="border-y border-border bg-muted/40">
          <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t("budgets.chart.sectionTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("budgets.chart.sectionSubtitle")}</p>
            </div>

            <div className="surface-elevated mt-8 rounded-2xl border border-border bg-card p-4 md:p-6">
              <div className="flex items-center gap-6 pb-4 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                  {t("budgets.chart.budgetLabel")}
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
                  {t("budgets.chart.actualLabel")}
                </span>
              </div>
              <div className="flex h-[300px] items-end gap-6 border-t border-border pt-6">
                {chartData.map((row) => {
                  const maxVal = Math.max(...chartData.map((r) => Math.max(r.budget, r.actual)), 1);
                  const budgetHeight = Math.max((row.budget / maxVal) * 100, 2);
                  const actualHeight = Math.max((row.actual / maxVal) * 100, 2);
                  return (
                    <div key={row.name} className="flex flex-1 flex-col items-center gap-3">
                      <div className="flex h-[220px] w-full items-end justify-center gap-2">
                        <div
                          className="w-5 rounded-t-md bg-primary transition-all duration-500 ease-out sm:w-7"
                          style={{ height: `${budgetHeight}%` }}
                          title={`${t("budgets.chart.budgetLabel")}: ${formatUSD(row.budget)}`}
                        />
                        <div
                          className="w-5 rounded-t-md bg-accent transition-all duration-500 ease-out sm:w-7"
                          style={{ height: `${actualHeight}%` }}
                          title={`${t("budgets.chart.actualLabel")}: ${formatUSD(row.actual)}`}
                        />
                      </div>
                      <span className="text-center text-xs font-medium text-muted-foreground">{row.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Budget form */}
      <Reveal delay={0.05}>
        <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="max-w-md">
              <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                {t("budgets.form.sectionTitle")}
              </h2>
              <p className="mt-2 text-muted-foreground">{t("budgets.form.sectionSubtitle")}</p>
            </div>

            <div className="surface-elevated rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {budgets.map((b) => {
                  const Icon = ICONS[b.icon] ?? PiggyBankFallback;
                  return (
                    <div key={b.id} className="flex flex-col gap-2">
                      <label
                        htmlFor={`limit-${b.id}`}
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        {b.name}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">$</span>
                        <input
                          id={`limit-${b.id}`}
                          type="number"
                          min={0}
                          step={10}
                          value={editingLimits[b.id] ?? ""}
                          onChange={(e) => handleLimitChange(b.id, e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("budgets.form.currentSpent", { value: formatUSD(b.spent) })}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {t("budgets.form.saveButton")}
                </button>

                <AnimatePresence>
                  {showSuccess && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm font-medium text-foreground"
                    >
                      {t("budgets.form.successMessage")}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}