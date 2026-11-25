"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Database, ExternalLink, X } from "lucide-react";
import type { DatasetMeta } from "@/types/conundrum";

interface SetupModalProps {
  open: boolean;
  onClose: () => void;
  meta: DatasetMeta;
}

const ENV_SNIPPET = `# .env.local — Choose ONE live connection option
GOOGLE_SHEETS_SPREADSHEET_ID=1OkTnHn6l7dsmJ67GgmebhOH-DLWssIbAMF3iHFlDr3E

# Option A: Google Cloud Service Account (Private Sheet)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# Option B: Google Sheets API Key (Link-Shared Sheet)
# GOOGLE_SHEETS_API_KEY=AIzaSy...

# Option C: Google Apps Script Web App (Zero GCP Setup)
# GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec`;

export function SetupModal({ open, onClose, meta }: SetupModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ENV_SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard errors in restricted contexts
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="backdrop:bg-slate-950/45 backdrop:backdrop-blur-xs rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl max-w-2xl w-[calc(100%-2rem)] m-auto text-slate-900"
    >
      <div className="p-5 sm:p-6 space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Google Sheets Live Connection
              </h2>
              <p className="text-xs text-slate-500">
                Current source: <strong className="text-slate-800">{meta.sourceLabel}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <p>
            This workspace joins{" "}
            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">
              Conundrum Database
            </code>{" "}
            and{" "}
            <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">
              Worksheet Content Database
            </code>{" "}
            on <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">Card ID</code>.
            Without credentials in <code className="font-mono text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-900">.env.local</code>,
            it automatically serves the built-in 84-card snapshot from your sheet so you can preview immediately.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-xs font-bold text-slate-900">
                Option A · Service Account
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Best for private sheets. Share the sheet with the service account email as Viewer.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-xs font-bold text-slate-900">
                Option B · API Key
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Set sheet to &ldquo;Anyone with the link can view&rdquo; and add a Google Sheets API key.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <div className="text-xs font-bold text-slate-900">
                Option C · Apps Script
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Zero GCP setup. Paste <code className="font-mono">apps-script/Code.gs</code> and deploy as Web App.
              </p>
            </div>
          </div>

          <div className="relative rounded-xl bg-slate-900 text-slate-100 p-4 font-mono text-[11px] overflow-x-auto">
            <button
              type="button"
              onClick={handleCopy}
              className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2 py-1 text-[11px] font-sans font-medium text-white transition cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy
                </>
              )}
            </button>
            <pre className="pr-16 whitespace-pre">{ENV_SNIPPET}</pre>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <a
            href={meta.spreadsheetUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:underline"
          >
            Open connected Google Sheet
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </dialog>
  );
}
