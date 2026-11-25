"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Layers,
  ListFilter,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import type {
  ConundrumDatasetResponse,
  ConundrumRecord,
  SaveConundrumResponse,
} from "@/types/conundrum";
import { triggerNamedPrint } from "@/lib/print-utils";
import { HeaderBar } from "./HeaderBar";
import { FilterToolbar } from "./FilterToolbar";
import { CardCatalog } from "./CardCatalog";
import { CardDetailWorkspace } from "./CardDetailWorkspace";
import { SetupModal } from "./SetupModal";
import { ConundrumEditorDrawer } from "./ConundrumEditorDrawer";
import {
  BatchPacketDrawer,
  type BatchPrintConfig,
} from "./BatchPacketDrawer";
import { MasterCardSheet } from "./MasterCardPrintView";
import { WorksheetPages } from "./WorksheetPacketView";

interface ConundrumWorkspaceProps {
  initialData: ConundrumDatasetResponse;
}

function getNextCardId(cards: ConundrumRecord[]): string {
  let maxNum = 0;
  for (const card of cards) {
    const match = /^CON-(\d+)$/i.exec(card.cardId.trim());
    if (match) {
      const n = Number.parseInt(match[1], 10);
      if (n > maxNum) maxNum = n;
    }
  }
  const next = maxNum + 1;
  return `CON-${String(next).padStart(3, "0")}`;
}

export function ConundrumWorkspace({ initialData }: ConundrumWorkspaceProps) {
  const [dataset, setDataset] = useState<ConundrumDatasetResponse>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(
    initialData.cards[0]?.cardId ?? null
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [mobileCatalogOpen, setMobileCatalogOpen] = useState(false);

  // Add / Edit Drawer state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingCard, setEditingCard] = useState<ConundrumRecord | null>(null);

  // Batch Packet Builder state
  const [batchSelectedIds, setBatchSelectedIds] = useState<string[]>([]);
  const [batchDrawerOpen, setBatchDrawerOpen] = useState(false);
  const [activeBatchPrint, setActiveBatchPrint] =
    useState<BatchPrintConfig | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcuts: `/` focuses search, `Esc` closes modals/drawers or blurs search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if (e.key === "/" && !isTypingField && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
        return;
      }

      if (e.key === "Escape") {
        if (setupOpen) setSetupOpen(false);
        else if (batchDrawerOpen) setBatchDrawerOpen(false);
        else if (editorOpen) setEditorOpen(false);
        else if (document.activeElement === searchInputRef.current) {
          if (searchQuery) setSearchQuery("");
          searchInputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setupOpen, batchDrawerOpen, editorOpen, searchQuery]);

  // Clear batch print overlay after printing completes
  useEffect(() => {
    if (!activeBatchPrint) return;
    const clearBatch = () => setActiveBatchPrint(null);
    window.addEventListener("afterprint", clearBatch);
    return () => window.removeEventListener("afterprint", clearBatch);
  }, [activeBatchPrint]);

  const suggestedNextId = useMemo(
    () => getNextCardId(dataset.cards),
    [dataset.cards]
  );

  const filteredCards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return dataset.cards.filter((card) => {
      if (selectedTheme !== "ALL" && card.category !== selectedTheme) {
        return false;
      }
      if (
        selectedStatus !== "ALL" &&
        card.status.toLowerCase() !== selectedStatus.toLowerCase()
      ) {
        return false;
      }
      if (!q) return true;

      const haystack = [
        card.cardId,
        card.title,
        card.category,
        card.objective,
        card.deliverables,
        card.disciplinesRaw,
        card.notes,
        ...card.requirements.map((r) => r.raw),
        ...(card.worksheet
          ? [
              ...card.worksheet.lower.vocab.map((v) => v.term),
              ...card.worksheet.middle.vocab.map((v) => v.term),
              ...card.worksheet.upper.vocab.map((v) => v.term),
            ]
          : []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [dataset.cards, searchQuery, selectedTheme, selectedStatus]);

  const activeCard = useMemo(() => {
    if (filteredCards.length === 0) return null;
    return (
      filteredCards.find((c) => c.cardId === selectedCardId) ?? filteredCards[0]
    );
  }, [filteredCards, selectedCardId]);

  const activeIndex = activeCard
    ? filteredCards.findIndex((c) => c.cardId === activeCard.cardId)
    : -1;

  const handlePrev = () => {
    if (filteredCards.length <= 1) return;
    const prevIdx =
      activeIndex <= 0 ? filteredCards.length - 1 : activeIndex - 1;
    setSelectedCardId(filteredCards[prevIdx].cardId);
  };

  const handleNext = () => {
    if (filteredCards.length <= 1) return;
    const nextIdx =
      activeIndex >= filteredCards.length - 1 ? 0 : activeIndex + 1;
    setSelectedCardId(filteredCards[nextIdx].cardId);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/conundrums?refresh=1", {
        cache: "no-store",
      });
      if (res.ok) {
        const fresh = (await res.json()) as ConundrumDatasetResponse;
        setDataset(fresh);
        setToast({
          type: "success",
          message: `Synced ${fresh.meta.totalCount} conundrum cards (${fresh.meta.sourceLabel}).`,
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedTheme("ALL");
    setSelectedStatus("ALL");
  };

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setMobileCatalogOpen(false);
  };

  const handleToggleBatchCard = (cardId: string) => {
    setBatchSelectedIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleExportBatch = (config: BatchPrintConfig) => {
    setBatchDrawerOpen(false);
    setActiveBatchPrint(config);
    triggerNamedPrint(config.filename);
  };

  const handleOpenCreate = () => {
    setEditorMode("create");
    setEditingCard(null);
    setEditorOpen(true);
  };

  const handleOpenEdit = (card: ConundrumRecord) => {
    setEditorMode("edit");
    setEditingCard(card);
    setEditorOpen(true);
  };

  const handleSaved = (result: SaveConundrumResponse) => {
    setDataset(result.dataset);
    setSelectedCardId(result.cardId);
    if (result.action === "create") {
      setSearchQuery("");
      setSelectedTheme("ALL");
      setSelectedStatus("ALL");
    }
    setEditorOpen(false);
    setToast({
      type: "success",
      message: result.message,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <HeaderBar
        meta={dataset.meta}
        selectedTheme={selectedTheme}
        onSelectTheme={setSelectedTheme}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        onOpenSetup={() => setSetupOpen(true)}
        onAddNew={handleOpenCreate}
        batchCount={batchSelectedIds.length}
        onOpenBatchBuilder={() => setBatchDrawerOpen(true)}
      />

      <FilterToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchInputRef={searchInputRef}
        selectedTheme={selectedTheme}
        onSelectTheme={setSelectedTheme}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        statuses={dataset.meta.statuses}
        themeCounts={dataset.meta.themeCounts}
        totalCount={dataset.meta.totalCount}
        filteredCount={filteredCards.length}
        onResetFilters={handleResetFilters}
      />

      {/* Success / Error Toast Banner */}
      {toast && (
        <div className="no-print max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div
            role="status"
            className={`rounded-xl border px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-rose-50 border-rose-200 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="p-1 rounded-md hover:bg-black/5 transition cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Batch Selection Quick Bar (when 1+ cards checked in catalog) */}
      {batchSelectedIds.length > 0 && (
        <div className="no-print max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50/80 px-4 py-2 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-700 shrink-0" />
              <span>
                <strong>{batchSelectedIds.length}</strong>{" "}
                {batchSelectedIds.length === 1 ? "card" : "cards"} queued for
                batch export.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBatchSelectedIds([])}
                className="text-xs font-medium text-blue-700 hover:underline cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setBatchDrawerOpen(true)}
                className="rounded-lg bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800 transition cursor-pointer"
              >
                Configure &amp; Export Batch PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Catalog Toggle Bar */}
      <div className="no-print lg:hidden max-w-[1600px] w-full mx-auto px-4 sm:px-6 pt-3">
        <button
          type="button"
          onClick={() => setMobileCatalogOpen((prev) => !prev)}
          className="w-full flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-2xs cursor-pointer"
        >
          <span className="inline-flex items-center gap-2">
            {mobileCatalogOpen ? (
              <PanelLeftClose className="h-4 w-4 text-slate-600" />
            ) : (
              <PanelLeftOpen className="h-4 w-4 text-slate-600" />
            )}
            <span>
              {mobileCatalogOpen
                ? "Hide Card Catalog"
                : `Browse Card Catalog (${filteredCards.length} cards)`}
            </span>
          </span>
          {activeCard && (
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700">
              {activeCard.cardId}
            </span>
          )}
        </button>
      </div>

      {/* Main Split Workspace (hidden from print when a Batch Print job is active) */}
      <main
        className={`flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 ${
          activeBatchPrint ? "no-print" : ""
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left Pane: Card Catalog Selector */}
          <aside
            className={`no-print w-full lg:w-[350px] xl:w-[390px] shrink-0 ${
              mobileCatalogOpen ? "block" : "hidden lg:block"
            }`}
          >
            <div className="lg:sticky lg:top-[176px]">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span>Card Catalog</span>
                </div>
                <span className="text-xs font-medium text-slate-500 tabular-nums">
                  {filteredCards.length}{" "}
                  {filteredCards.length === 1 ? "card" : "cards"}
                </span>
              </div>

              {isRefreshing ? (
                <div className="space-y-2 animate-pulse">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-24 rounded-xl bg-white border border-slate-200 p-3.5 space-y-2"
                    >
                      <div className="h-3.5 w-20 rounded bg-slate-200" />
                      <div className="h-4 w-44 rounded bg-slate-200" />
                      <div className="h-3 w-full rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="lg:max-h-[calc(100vh-225px)] lg:overflow-y-auto lg:pr-1.5 workspace-scroll">
                  <CardCatalog
                    cards={filteredCards}
                    selectedCardId={activeCard?.cardId ?? null}
                    onSelectCard={handleSelectCard}
                    batchSelectedIds={batchSelectedIds}
                    onToggleBatchCard={handleToggleBatchCard}
                    onResetFilters={handleResetFilters}
                    onAddNew={handleOpenCreate}
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Right Pane: Full Conundrum & Worksheet Workspace */}
          <section className="flex-1 min-w-0 w-full">
            {isRefreshing ? (
              <div className="animate-pulse space-y-4">
                <div className="h-14 rounded-2xl bg-white border border-slate-200" />
                <div className="h-[620px] max-w-[210mm] mx-auto rounded-2xl bg-white border border-slate-200 p-8 space-y-5">
                  <div className="h-7 w-2/3 rounded-lg bg-slate-200" />
                  <div className="h-14 w-full rounded-xl bg-slate-100" />
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-14 w-full rounded-xl bg-slate-100"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : activeCard ? (
              <CardDetailWorkspace
                card={activeCard}
                currentIndex={activeIndex}
                totalFiltered={filteredCards.length}
                onPrev={handlePrev}
                onNext={handleNext}
                onFilterByDiscipline={(discipline) =>
                  setSearchQuery(discipline)
                }
                onEditCard={handleOpenEdit}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                <h2 className="text-base font-bold text-slate-900">
                  No cards match your current filters
                </h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Reset your search or filter selections to inspect any of the{" "}
                  {dataset.meta.totalCount} ICAN Conundrum Cards, or create a
                  new conundrum card.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Reset all filters
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCreate}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Add New Conundrum
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Dedicated Batch Print Mount (rendered exclusively during batch PDF print) */}
      {activeBatchPrint && (
        <div className="batch-print-only">
          {activeBatchPrint.cards.map((card, index) => {
            const isLastCard = index === activeBatchPrint.cards.length - 1;
            if (activeBatchPrint.format === "master-cards") {
              return (
                <MasterCardSheet
                  key={card.cardId}
                  card={card}
                  isLastInDocument={isLastCard}
                />
              );
            }
            return (
              <WorksheetPages
                key={card.cardId}
                card={card}
                selectedPages={activeBatchPrint.selectedPages}
                screenFocus="selected"
                layoutMode={activeBatchPrint.layoutMode}
                isLastCardInBatch={isLastCard}
              />
            );
          })}
        </div>
      )}

      <SetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        meta={dataset.meta}
      />

      <ConundrumEditorDrawer
        open={editorOpen}
        mode={editorMode}
        initialCard={editingCard}
        suggestedNextId={suggestedNextId}
        onClose={() => setEditorOpen(false)}
        onSaved={handleSaved}
      />

      <BatchPacketDrawer
        open={batchDrawerOpen}
        onClose={() => setBatchDrawerOpen(false)}
        allCards={dataset.cards}
        filteredCards={filteredCards}
        selectedCardIds={batchSelectedIds}
        onChangeSelectedCardIds={setBatchSelectedIds}
        onExportBatch={handleExportBatch}
      />
    </div>
  );
}
