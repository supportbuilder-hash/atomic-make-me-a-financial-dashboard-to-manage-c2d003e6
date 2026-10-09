"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Activity, ArrowDown, ArrowUp, ArrowUpDown, Circle, Home, Lock, Plus, Star, X } from 'lucide-react';
import { Reveal } from "@/components/Reveal";

const CATEGORY_ORDER = ["rent", "transport", "food", "saving"] as const;
type CategoryId = (typeof CATEGORY_ORDER)[number];

type Transaction = {
  id: string;
  description: string;
  categoryId: CategoryId;
  amount: number;
  date: string;
};

const CATEGORY_ICONS: Record<CategoryId, typeof Home> = {
  rent: Home,
  transport: ArrowUpDown,
  food: Circle,
  saving: Lock,
};

const CATEGORY_LIMITS: Record<CategoryId, number> = {
  rent: 1500,
  transport: 300,
  food: 600,
  saving: 500,
};

const CATEGORY_COLORS: Record<CategoryId, string> = {
  rent: "hsl(var(--primary))",
  transport: "hsl(var(--accent))",
  food: "hsl(var(--secondary))",
  saving: "hsl(var(--muted-foreground))",
};

const MONTHLY_INCOME = 4800;

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", description: "Monthly apartment rent", categoryId: "rent", amount: 1450, date: "Jun 01" },
  { id: "t2", description: "Metro monthly pass", categoryId: "transport", amount: 75, date: "Jun 02" },
  { id: "t3", description: "Grocery run, Whole Foods", categoryId: "food", amount: 128.4, date: "Jun 03" },
  { id: "t4", description: "Automatic savings transfer", categoryId: "saving", amount: 400, date: "Jun 05" },
  { id: "t5", description: "Ride share to airport", categoryId: "transport", amount: 42.5, date: "Jun 06" },
  { id: "t6", description: "Dinner with friends", categoryId: "food", amount: 63.2, date: "Jun 07" },
];

const TREND_BASE = [62, 48, 91, 73, 130, 54, 88];

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function DashboardPage() {
  const t = useTranslations();
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<CategoryId>("rent");
  const idCounter = useRef(INITIAL_TRANSACTIONS.length);

  const categoryLabels = Array.isArray(t.raw("dashboard.categoryLabels"))
    ? (t.raw("dashboard.categoryLabels") as string[])
    : [];
  const trendDays = Array.isArray(t.raw("dashboard.trend.days"))
    ? (t.raw("dashboard.trend.days") as string[])
    : [];

  const labelFor = (id: CategoryId): string => {
    const index = CATEGORY_ORDER.indexOf(id);
    return categoryLabels[index] ?? id;
  };

  const spentByCategory = useMemo(() => {
    const totals: Record<CategoryId, number> = { rent: 0, transport: 0, food: 0, saving: 0 };
    for (const tx of transactions) {
      totals[tx.categoryId] = (totals[tx.categoryId] ?? 0) + tx.amount;
    }
    return totals;
  }, [transactions]);

  const totalSpent = useMemo(
    () => CATEGORY_ORDER.reduce((sum, id) => sum + (spentByCategory[id] ?? 0), 0),
    [spentByCategory]
  );
  const netBalance = MONTHLY_INCOME - totalSpent;
  const savedThisMonth = spentByCategory.saving ?? 0;

  const pieData = CATEGORY_ORDER.map((id) => ({
    id,
    label: labelFor(id),
    value: spentByCategory[id] ?? 0,
    color: CATEGORY_COLORS[id],
  }));

  const trendData = TREND_BASE.map((spend, i) => ({
    day: trendDays[i] ?? `D${i + 1}`,
    spend,
  }));

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || Number.isNaN(parsedAmount) || parsedAmount <= 0) return;
    idCounter.current += 1;
    const newTransaction: Transaction = {
      id: `t${idCounter.current}`,
      description: description.trim(),
      categoryId: category,
      amount: parsedAmount,
      date: "Today",
    };
    setTransactions((prev) => [newTransaction, ...prev]);
    setDescription("");
    setAmount("");
    setCategory("rent");
    setShowForm(false);
  };

  const stats = [
    { label: t("dashboard.stats.balance"), value: formatCurrency(netBalance), icon: Activity },
    { label: t("dashboard.stats.spent"), value: formatCurrency(totalSpent), icon: ArrowDown },
    { label: t("dashboard.stats.income"), value: formatCurrency(MONTHLY_INCOME), icon: ArrowUp },
    { label: t("dashboard.stats.saved"), value: formatCurrency(savedThisMonth), icon: Star },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <Reveal>
          <section className="relative overflow-hidden rounded-2xl bg-mesh p-8 md:p-12">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
                  {t("dashboard.eyebrow")}
                </span>
                <h1 className="mt-4 text-balance font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                  {t("dashboard.title")}
                </h1>
                <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
                  {t("dashboard.subtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm((prev) => !prev)}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:-translate-y-0.5 hover:shadow-lg motion-reduce:transition-none"
              >
                {showForm ? <X className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
                {t("dashboard.addExpense")}
              </button>
            </div>

            {showForm && (
              <form
                onSubmit={handleSubmit}
                className="glass-strong mt-8 grid grid-cols-1 gap-4 rounded-xl p-6 sm:grid-cols-2 lg:grid-cols-4"
              >
                <h2 className="col-span-full text-sm font-semibold text-foreground">
                  {t("dashboard.form.title")}
                </h2>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-description" className="text-xs font-medium text-muted-foreground">
                    {t("dashboard.form.description")}
                  </label>
                  <input
                    id="expense-description"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t("dashboard.form.descriptionPlaceholder")}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none ring-ring transition focus-visible:ring-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-amount" className="text-xs font-medium text-muted-foreground">
                    {t("dashboard.form.amount")}
                  </label>
                  <input
                    id="expense-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none ring-ring transition focus-visible:ring-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-category" className="text-xs font-medium text-muted-foreground">
                    {t("dashboard.form.category")}
                  </label>
                  <select
                    id="expense-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-card-foreground outline-none ring-ring transition focus-visible:ring-2"
                  >
                    {CATEGORY_ORDER.map((id) => (
                      <option key={id} value={id}>
                        {labelFor(id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 motion-reduce:transition-none"
                  >
                    {t("dashboard.form.submit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    {t("dashboard.form.cancel")}
                  </button>
                </div>
              </form>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="surface-elevated rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-1 motion-reduce:transition-none"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                  <stat.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">{stat.value}</div>
              </div>
            ))}
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-3">
              <h2 className="text-lg font-semibold text-foreground">{t("dashboard.trend.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.trend.subtitle")}</p>
              <div className="mt-4 flex h-64 items-end gap-2">
                {trendData.map((point) => {
                  const maxSpend = Math.max(...trendData.map((p) => p.spend), 1);
                  const heightPercent = Math.max(6, Math.round((point.spend / maxSpend) * 100));
                  return (
                    <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-48 w-full items-end">
                        <div
                          className="w-full rounded-t-md bg-primary/80 transition hover:bg-primary"
                          style={{ height: `${heightPercent}%` }}
                          title={formatCurrency(point.spend)}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">{point.day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground">{t("dashboard.breakdown.title")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.breakdown.subtitle")}</p>
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-muted">
                {pieData.map((entry) => {
                  const widthPercent = totalSpent > 0 ? Math.max(2, (entry.value / totalSpent) * 100) : 0;
                  return (
                    <div
                      key={entry.id}
                      style={{ width: `${widthPercent}%`, backgroundColor: entry.color }}
                      title={`${entry.label}: ${formatCurrency(entry.value)}`}
                    />
                  );
                })}
              </div>
              <ul className="mt-2 space-y-2">
                {pieData.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-foreground">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                        aria-hidden="true"
                      />
                      {entry.label}
                    </span>
                    <span className="font-medium text-muted-foreground">{formatCurrency(entry.value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.15}>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t("dashboard.budgets.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.budgets.subtitle")}</p>
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              {CATEGORY_ORDER.map((id) => {
                const Icon = CATEGORY_ICONS[id];
                const spent = spentByCategory[id] ?? 0;
                const limit = CATEGORY_LIMITS[id];
                const percent = Math.min(100, Math.round((spent / limit) * 100));
                const isOver = spent > limit;
                return (
                  <div key={id} className="rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
                        {labelFor(id)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(spent)} / {formatCurrency(limit)}
                      </span>
                    </div>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={isOver ? "h-full rounded-full bg-accent" : "h-full rounded-full bg-primary"}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      {isOver
                        ? `${formatCurrency(spent - limit)} ${t("dashboard.budgets.over")}`
                        : `${formatCurrency(limit - spent)} ${t("dashboard.budgets.remaining")}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.2}>
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold text-foreground">{t("dashboard.transactions.title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.transactions.subtitle")}</p>
            {transactions.length === 0 ? (
              <p className="mt-6 text-sm text-muted-foreground">{t("dashboard.transactions.empty")}</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border text-left text-muted-foreground">
                    <tr>
                      <th className="p-3 font-medium">{t("dashboard.transactions.columns.description")}</th>
                      <th className="p-3 font-medium">{t("dashboard.transactions.columns.category")}</th>
                      <th className="p-3 font-medium">{t("dashboard.transactions.columns.date")}</th>
                      <th className="p-3 text-right font-medium">{t("dashboard.transactions.columns.amount")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="p-3 text-foreground">{tx.description}</td>
                        <td className="p-3 text-muted-foreground">{labelFor(tx.categoryId)}</td>
                        <td className="p-3 text-muted-foreground">{tx.date}</td>
                        <td className="p-3 text-right font-medium text-foreground">{formatCurrency(tx.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </Reveal>
      </div>
    </main>
  );
}