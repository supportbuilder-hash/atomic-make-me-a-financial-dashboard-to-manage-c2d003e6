"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Home, ArrowUpDown, Heart, Star, Circle, Plus, Trash2, Edit, Save, X, Check, Download, FileText, Settings as SettingsIcon, Info, AlertTriangle } from 'lucide-react';
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

type IconKey = "home" | "transport" | "food" | "saving" | "generic";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string }>> = {
  home: Home,
  transport: ArrowUpDown,
  food: Heart,
  saving: Star,
  generic: Circle,
};

type Category = { id: string; name: string; icon: IconKey };

const DEFAULT_ALLOCATIONS = [35, 15, 30, 20];

function IconBadge({ icon }: { icon: IconKey }) {
  const Icon = ICONS[icon] ?? Circle;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export default function SettingsPage() {
  const t = useTranslations();

  // ---- General settings state ----
  const currencyOptions = Array.isArray(t.raw("settings.general.currencyOptions"))
    ? (t.raw("settings.general.currencyOptions") as { value: string; label: string }[])
    : [];
  const dateFormatOptions = Array.isArray(t.raw("settings.general.dateFormatOptions"))
    ? (t.raw("settings.general.dateFormatOptions") as { value: string; label: string }[])
    : [];
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState(dateFormatOptions[0]?.value ?? "MM/DD/YYYY");
  const [savedGeneral, setSavedGeneral] = useState(false);

  function handleSaveGeneral() {
    setSavedGeneral(true);
    setTimeout(() => setSavedGeneral(false), 2200);
  }

  // ---- Category management state ----
  const defaultCategoryItems = Array.isArray(t.raw("settings.categories.defaultItems"))
    ? (t.raw("settings.categories.defaultItems") as { name: string; icon: string }[])
    : [];
  const [categories, setCategories] = useState<Category[]>(() =>
    defaultCategoryItems.map((c, i) => ({
      id: `cat-${i}`,
      name: c.name,
      icon: (["home", "transport", "food", "saving", "generic"] as string[]).includes(c.icon)
        ? (c.icon as IconKey)
        : "generic",
    })),
  );
  const iconOptions = Array.isArray(t.raw("settings.categories.iconOptions"))
    ? (t.raw("settings.categories.iconOptions") as { value: string; label: string }[])
    : [];
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState<IconKey>("generic");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function addCategory() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCategories((prev) => [...prev, { id: `cat-${Date.now()}`, name: trimmed, icon: newIcon }]);
    setNewName("");
    setNewIcon("generic");
  }

  function removeCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setAllocations((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  function saveEdit(id: string) {
    const trimmed = editingName.trim();
    if (!trimmed) return;
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c)));
    setEditingId(null);
    setEditingName("");
  }

  // ---- Budget defaults state ----
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    categories.forEach((c, i) => {
      initial[c.id] = DEFAULT_ALLOCATIONS[i] ?? Math.round(100 / Math.max(categories.length, 1));
    });
    return initial;
  });
  const [savedBudget, setSavedBudget] = useState(false);
  const totalAllocation = Object.values(allocations).reduce((sum, v) => sum + (v || 0), 0);

  function updateAllocation(id: string, value: number) {
    setAllocations((prev) => ({ ...prev, [id]: Math.max(0, Math.min(100, value)) }));
  }

  function handleSaveBudget() {
    setSavedBudget(true);
    setTimeout(() => setSavedBudget(false), 2200);
  }

  // ---- Export data state ----
  const dataTypes = Array.isArray(t.raw("settings.export.dataTypes"))
    ? (t.raw("settings.export.dataTypes") as { id: string; label: string }[])
    : [];
  const rangeOptions = Array.isArray(t.raw("settings.export.rangeOptions"))
    ? (t.raw("settings.export.rangeOptions") as { value: string; label: string }[])
    : [];
  const [selectedTypes, setSelectedTypes] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    dataTypes.forEach((dt) => {
      initial[dt.id] = true;
    });
    return initial;
  });
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [exportRange, setExportRange] = useState(rangeOptions[0]?.value ?? "30d");
  const [exportDone, setExportDone] = useState(false);

  function toggleType(id: string) {
    setSelectedTypes((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleExport() {
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2600);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <Reveal>
        <section className="relative overflow-hidden bg-mesh py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <SettingsIcon className="h-4 w-4" aria-hidden="true" />
              {t("settings.hero.eyebrow")}
            </span>
            <h1 className="mt-5 max-w-2xl text-balance font-display text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t("settings.hero.title")}
            </h1>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              {t("settings.hero.subtitle")}
            </p>
          </div>
        </section>
      </Reveal>

      {/* General settings */}
      <Reveal>
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {t("settings.general.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("settings.general.subtitle")}
              </p>
            </div>

            <div className="surface-elevated mt-8 rounded-2xl border border-border bg-card p-6 md:p-8">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="currency-select" className="text-sm font-medium text-foreground">
                    {t("settings.general.currencyLabel")}
                  </label>
                  <select
                    id="currency-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {currencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="date-format-select" className="text-sm font-medium text-foreground">
                    {t("settings.general.dateFormatLabel")}
                  </label>
                  <select
                    id="date-format-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {dateFormatOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveGeneral}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {t("settings.general.saveButton")}
                </button>
                {savedGeneral && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t("settings.general.savedMessage")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Category management */}
      <Reveal>
        <section className="bg-muted/40 py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {t("settings.categories.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("settings.categories.subtitle")}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3">
              {categories.length === 0 && (
                <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                  {t("settings.categories.emptyState")}
                </p>
              )}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out hover:-translate-y-0.5"
                >
                  <IconBadge icon={cat.icon} />
                  <div className="min-w-0 flex-1">
                    {editingId === cat.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={t("settings.categories.editAria")}
                      />
                    ) : (
                      <p className="truncate font-medium text-foreground">{cat.name}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {editingId === cat.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => saveEdit(cat.id)}
                          aria-label={t("settings.categories.saveAria")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          aria-label={t("settings.categories.cancelAria")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(cat)}
                          aria-label={t("settings.categories.editAria")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Edit className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeCategory(cat.id)}
                          aria-label={t("settings.categories.deleteAria")}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="surface-elevated mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={t("settings.categories.addPlaceholder")}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <select
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value as IconKey)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={addCategory}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("settings.categories.addButton")}
                </button>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Budget defaults */}
      <Reveal>
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {t("settings.budgetDefaults.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("settings.budgetDefaults.subtitle")}
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                  >
                    <IconBadge icon={cat.icon} />
                    <span className="min-w-0 flex-1 truncate font-medium text-foreground">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={allocations[cat.id] ?? 0}
                        onChange={(e) => updateAllocation(cat.id, Number(e.target.value))}
                        aria-label={cat.name}
                        className="w-20 rounded-lg border border-border bg-background px-3 py-1.5 text-right text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="surface-elevated h-fit rounded-2xl border border-border bg-card p-6">
                <p className="text-sm font-medium text-foreground">{t("settings.budgetDefaults.totalLabel")}</p>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500 ease-out",
                      totalAllocation > 100 ? "bg-destructive" : "bg-primary",
                    )}
                    style={{ width: `${Math.min(100, totalAllocation)}%` }}
                  />
                </div>
                <p className="mt-2 text-2xl font-bold text-foreground">{totalAllocation}%</p>
                {totalAllocation !== 100 && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {t("settings.budgetDefaults.totalWarning")}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {t("settings.budgetDefaults.saveButton")}
                </button>
                {savedBudget && (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t("settings.budgetDefaults.savedMessage")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Export data */}
      <Reveal>
        <section className="relative overflow-hidden bg-mesh py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                {t("settings.export.title")}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("settings.export.subtitle")}
              </p>
            </div>

            <div className="glass mt-8 grid grid-cols-1 gap-8 rounded-2xl p-6 md:grid-cols-2 md:p-8">
              <div>
                <p className="text-sm font-semibold text-foreground">{t("settings.export.dataTypesLabel")}</p>
                <div className="mt-3 space-y-2.5">
                  {dataTypes.map((dt) => (
                    <label
                      key={dt.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3.5 py-2.5 transition-colors hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={!!selectedTypes[dt.id]}
                        onChange={() => toggleType(dt.id)}
                        className="h-4 w-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <span className="text-sm text-foreground">{dt.label}</span>
                    </label>
                  ))}
                </div>

                <p className="mt-6 text-sm font-semibold text-foreground">{t("settings.export.formatLabel")}</p>
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setExportFormat("csv")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      exportFormat === "csv"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {t("settings.export.csvLabel")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setExportFormat("pdf")}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                      exportFormat === "pdf"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {t("settings.export.pdfLabel")}
                  </button>
                </div>
              </div>

              <div className="flex flex-col">
                <label htmlFor="export-range" className="text-sm font-semibold text-foreground">
                  {t("settings.export.rangeLabel")}
                </label>
                <select
                  id="export-range"
                  value={exportRange}
                  onChange={(e) => setExportRange(e.target.value)}
                  className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {rangeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-card px-3.5 py-3 text-sm text-muted-foreground">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  {t("settings.export.infoNote")}
                </div>

                <button
                  type="button"
                  onClick={handleExport}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  {t("settings.export.exportButton")}
                </button>
                {exportDone && (
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="h-4 w-4" aria-hidden="true" />
                    {t("settings.export.successMessage")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      </Reveal>
    </main>
  );
}