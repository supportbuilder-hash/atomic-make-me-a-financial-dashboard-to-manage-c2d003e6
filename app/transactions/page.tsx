"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { Plus, Search, Check, X, Edit, Trash2, Download, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpDown, Calendar } from 'lucide-react';

type Category = "Rent" | "Transport" | "Food" | "Saving";
type SortKey = "date" | "description" | "category" | "amount";
type SortDir = "asc" | "desc";

interface Txn {
  id: string;
  date: string;
  description: string;
  category: Category;
  amount: number;
}

const CATEGORIES: Category[] = ["Rent", "Transport", "Food", "Saving"];
const PAGE_SIZE = 6;

const INITIAL_TRANSACTIONS: Txn[] = [
  { id: "t1", date: "2024-06-01", description: "June Rent Payment", category: "Rent", amount: 1450 },
  { id: "t2", date: "2024-06-02", description: "Whole Foods Market", category: "Food", amount: 86.42 },
  { id: "t3", date: "2024-06-03", description: "Metro Monthly Pass", category: "Transport", amount: 95 },
  { id: "t4", date: "2024-06-04", description: "Automatic Savings Transfer", category: "Saving", amount: 300 },
  { id: "t5", date: "2024-06-06", description: "Uber Rides", category: "Transport", amount: 42.15 },
  { id: "t6", date: "2024-06-08", description: "Trader Joe's Groceries", category: "Food", amount: 64.9 },
  { id: "t7", date: "2024-06-10", description: "Blue Bottle Coffee", category: "Food", amount: 12.5 },
  { id: "t8", date: "2024-06-12", description: "Gas Station Fill-up", category: "Transport", amount: 48.3 },
  { id: "t9", date: "2024-06-14", description: "Renters Insurance", category: "Rent", amount: 22 },
  { id: "t10", date: "2024-06-16", description: "Emergency Fund Deposit", category: "Saving", amount: 250 },
  { id: "t11", date: "2024-06-18", description: "Dinner at Oliveto", category: "Food", amount: 58.7 },
  { id: "t12", date: "2024-06-20", description: "Parking Garage Monthly", category: "Transport", amount: 120 },
  { id: "t13", date: "2024-06-24", description: "Retirement Contribution", category: "Saving", amount: 400 },
  { id: "t14", date: "2024-06-28", description: "Farmers Market Produce", category: "Food", amount: 27.35 },
];

const formatUSD = (n: number): string => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

const formatDate = (iso: string): string =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

interface SortButtonProps {
  label: string;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}

function SortButton({ label, active, dir, onClick }: SortButtonProps) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
        {active ? (
          dir === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </th>
  );
}

export default function TransactionsPage() {
  const t = useTranslations();

  const [transactions, setTransactions] = useState<Txn[]>(INITIAL_TRANSACTIONS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | Category>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [bulkCategory, setBulkCategory] = useState<Category>(CATEGORIES[0] ?? "Food");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ description: string; category: Category; amount: string; date: string }>({
    description: "",
    category: CATEGORIES[0] ?? "Food",
    amount: "",
    date: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<"description" | "amount" | "date", string>>>({});

  const filteredSorted = useMemo(() => {
    const query = search.trim().toLowerCase();
    const rows = transactions.filter((row) => {
      const matchesCategory = categoryFilter === "All" || row.category === categoryFilter;
      const matchesSearch = !query || row.description.toLowerCase().includes(query);
      const matchesFrom = !dateFrom || row.date >= dateFrom;
      const matchesTo = !dateTo || row.date <= dateTo;
      return matchesCategory && matchesSearch && matchesFrom && matchesTo;
    });
    const sorted = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "description") cmp = a.description.localeCompare(b.description);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else cmp = a.amount - b.amount;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [transactions, categoryFilter, search, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const paginated = useMemo(
    () => filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredSorted, page],
  );

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const totalSpent = useMemo(() => transactions.reduce((sum, row) => sum + row.amount, 0), [transactions]);
  const avgTransaction = transactions.length ? totalSpent / transactions.length : 0;
  const topCategory = useMemo(() => {
    const totals = new Map<Category, number>();
    transactions.forEach((row) => totals.set(row.category, (totals.get(row.category) ?? 0) + row.amount));
    let top: Category = CATEGORIES[0] ?? "Food";
    let max = -Infinity;
    totals.forEach((value, key) => {
      if (value > max) {
        max = value;
        top = key;
      }
    });
    return top;
  }, [transactions]);

  const allPageSelected = paginated.length > 0 && paginated.every((row) => selected.has(row.id));

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function toggleSelectRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) paginated.forEach((row) => next.delete(row.id));
      else paginated.forEach((row) => next.add(row.id));
      return next;
    });
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("All");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  function openAdd() {
    setEditingId(null);
    setFormState({ description: "", category: CATEGORIES[0] ?? "Food", amount: "", date: "" });
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(row: Txn) {
    setEditingId(row.id);
    setFormState({ description: row.description, category: row.category, amount: String(row.amount), date: row.date });
    setFormErrors({});
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function validate(): boolean {
    const errors: Partial<Record<"description" | "amount" | "date", string>> = {};
    if (!formState.description.trim()) errors.description = t("transactionsPage.form.errorDescription");
    const amountNum = parseFloat(formState.amount);
    if (!formState.amount || Number.isNaN(amountNum) || amountNum <= 0) errors.amount = t("transactionsPage.form.errorAmount");
    if (!formState.date) errors.date = t("transactionsPage.form.errorDate");
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    const amountNum = parseFloat(formState.amount);
    if (editingId) {
      setTransactions((prev) =>
        prev.map((row) =>
          row.id === editingId
            ? { ...row, description: formState.description.trim(), category: formState.category, amount: amountNum, date: formState.date }
            : row,
        ),
      );
    } else {
      const newTxn: Txn = {
        id: `txn-${Date.now()}`,
        description: formState.description.trim(),
        category: formState.category,
        amount: amountNum,
        date: formState.date,
      };
      setTransactions((prev) => [newTxn, ...prev]);
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    const ok = window.confirm(t("transactionsPage.deleteConfirm"));
    if (!ok) return;
    setTransactions((prev) => prev.filter((row) => row.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  function handleBulkDelete() {
    setTransactions((prev) => prev.filter((row) => !selected.has(row.id)));
    setSelected(new Set());
  }

  function handleBulkCategorize() {
    setTransactions((prev) => prev.map((row) => (selected.has(row.id) ? { ...row, category: bulkCategory } : row)));
    setSelected(new Set());
  }

  function handleBulkExport() {
    const rows = transactions.filter((row) => selected.has(row.id));
    const header = "Date,Description,Category,Amount\n";
    const body = rows
      .map((row) => `${row.date},"${row.description.replace(/"/g, '""')}",${row.category},${row.amount}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Reveal>
          <section className="mb-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  {t("transactionsPage.heading")}
                </h1>
                <p className="mt-2 max-w-xl text-pretty text-muted-foreground">{t("transactionsPage.subtitle")}</p>
              </div>
              <button
                type="button"
                onClick={openAdd}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {t("transactionsPage.addButton")}
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-2xl font-bold text-foreground">{formatUSD(totalSpent)}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("transactionsPage.stats.totalSpent")}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-2xl font-bold text-foreground">{transactions.length}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("transactionsPage.stats.transactionCount")}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-2xl font-bold text-foreground">{formatUSD(avgTransaction)}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("transactionsPage.stats.avgTransaction")}</div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <div className="text-2xl font-bold text-primary">{topCategory}</div>
                <div className="mt-1 text-sm text-muted-foreground">{t("transactionsPage.stats.topCategory")}</div>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.05}>
          <section className="mb-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end md:justify-between">
              <div className="min-w-[220px] flex-1">
                <label htmlFor="txn-search" className="mb-1 block text-sm font-medium text-foreground">
                  {t("transactionsPage.filters.searchPlaceholder")}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <input
                    id="txn-search"
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t("transactionsPage.filters.searchPlaceholder")}
                    className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="txn-category-filter" className="mb-1 block text-sm font-medium text-foreground">
                  {t("transactionsPage.table.category")}
                </label>
                <select
                  id="txn-category-filter"
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value as "All" | Category);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="All">{t("transactionsPage.filters.categoryAll")}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="txn-date-from" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("transactionsPage.filters.dateFromLabel")}
                </label>
                <input
                  id="txn-date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="txn-date-to" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("transactionsPage.filters.dateToLabel")}
                </label>
                <input
                  id="txn-date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {t("transactionsPage.filters.clearButton")}
              </button>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="overflow-hidden rounded-2xl border border-border bg-card">
            {selected.size > 0 && (
              <div className="flex flex-col gap-3 border-b border-border bg-primary/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-medium text-foreground">
                  {t("transactionsPage.bulk.selectedCount", { count: selected.size })}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value as Category)}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    aria-label={t("transactionsPage.bulk.categorizeButton")}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleBulkCategorize}
                    className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {t("transactionsPage.bulk.categorizeButton")}
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkExport}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    {t("transactionsPage.bulk.exportButton")}
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    {t("transactionsPage.bulk.deleteButton")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelected(new Set())}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t("transactionsPage.bulk.cancelButton")}
                  </button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleSelectPage}
                        aria-label={t("transactionsPage.table.selectAllAria")}
                        className="h-4 w-4 rounded border-border"
                      />
                    </th>
                    <SortButton label={t("transactionsPage.table.date")} active={sortKey === "date"} dir={sortDir} onClick={() => toggleSort("date")} />
                    <SortButton
                      label={t("transactionsPage.table.description")}
                      active={sortKey === "description"}
                      dir={sortDir}
                      onClick={() => toggleSort("description")}
                    />
                    <SortButton
                      label={t("transactionsPage.table.category")}
                      active={sortKey === "category"}
                      dir={sortDir}
                      onClick={() => toggleSort("category")}
                    />
                    <SortButton
                      label={t("transactionsPage.table.amount")}
                      active={sortKey === "amount"}
                      dir={sortDir}
                      onClick={() => toggleSort("amount")}
                    />
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("transactionsPage.table.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row) => (
                    <tr key={row.id} className="border-t border-border transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          aria-label={t("transactionsPage.table.selectRowAria")}
                          className="h-4 w-4 rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3 text-foreground/80">{formatDate(row.date)}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{row.description}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">{row.category}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-foreground">-{formatUSD(row.amount)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(row)}
                            aria-label={t("transactionsPage.table.editAria")}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            aria-label={t("transactionsPage.table.deleteAria")}
                            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        {t("transactionsPage.table.empty")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-sm text-muted-foreground">
                {t("transactionsPage.pagination.pageInfo", { page, total: totalPages })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label={t("transactionsPage.pagination.previous")}
                  className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label={t("transactionsPage.pagination.next")}
                  className="rounded-lg border border-border p-2 text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </Reveal>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  {editingId ? t("transactionsPage.form.editTitle") : t("transactionsPage.form.addTitle")}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label={t("transactionsPage.form.closeAria")}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="txn-description" className="mb-1 block text-sm font-medium text-foreground">
                    {t("transactionsPage.form.descriptionLabel")}
                  </label>
                  <input
                    id="txn-description"
                    type="text"
                    value={formState.description}
                    onChange={(e) => setFormState((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {formErrors.description && <p className="mt-1 text-xs text-muted-foreground">{formErrors.description}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="txn-category" className="mb-1 block text-sm font-medium text-foreground">
                      {t("transactionsPage.form.categoryLabel")}
                    </label>
                    <select
                      id="txn-category"
                      value={formState.category}
                      onChange={(e) => setFormState((f) => ({ ...f, category: e.target.value as Category }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="txn-amount" className="mb-1 block text-sm font-medium text-foreground">
                      {t("transactionsPage.form.amountLabel")}
                    </label>
                    <input
                      id="txn-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formState.amount}
                      onChange={(e) => setFormState((f) => ({ ...f, amount: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {formErrors.amount && <p className="mt-1 text-xs text-muted-foreground">{formErrors.amount}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="txn-date" className="mb-1 block text-sm font-medium text-foreground">
                    {t("transactionsPage.form.dateLabel")}
                  </label>
                  <input
                    id="txn-date"
                    type="date"
                    value={formState.date}
                    onChange={(e) => setFormState((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {formErrors.date && <p className="mt-1 text-xs text-muted-foreground">{formErrors.date}</p>}
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {t("transactionsPage.form.cancelButton")}
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t("transactionsPage.form.saveButton")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}