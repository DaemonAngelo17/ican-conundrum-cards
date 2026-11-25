import type { ConundrumRecord } from "@/types/conundrum";

export function slugifyTitle(title: string): string {
  return title
    .trim()
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPdfFilename(
  card: Pick<ConundrumRecord, "cardId" | "title">,
  suffix = "A4"
): string {
  const safeId = card.cardId.trim().toUpperCase();
  const safeTitle = slugifyTitle(card.title) || "Conundrum";
  return `ICAN_${safeId}_${safeTitle}_${suffix}.pdf`;
}

/**
 * Temporarily sets document.title to the target PDF basename so native
 * browser Print -> Save as PDF uses the exact formatted filename, then
 * restores the original document title once printing finishes.
 */
export function triggerNamedPrint(filename: string): void {
  if (typeof window === "undefined") return;

  const originalTitle = document.title;
  const pdfBaseName = filename.replace(/\.pdf$/i, "");
  document.title = pdfBaseName;

  let restored = false;
  const restore = () => {
    if (restored) return;
    restored = true;
    document.title = originalTitle;
    window.removeEventListener("afterprint", restore);
  };

  window.addEventListener("afterprint", restore);

  // Give React one frame to flush drawer close / print class updates
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.print();
      // Fallback restore in case afterprint doesn't fire in some browsers
      setTimeout(restore, 1500);
    });
  });
}
