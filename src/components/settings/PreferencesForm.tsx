"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { fieldClass } from "@/components/ui/field-styles";
import { TONE_OPTIONS } from "@/lib/tone";

interface Settings {
  displayName: string;
  timezone: string;
  defaultAiTone: string;
  autoThreadNumbering: boolean;
}

export default function PreferencesForm({ settings }: { settings: Settings }) {
  const [form, setForm] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div role="status" aria-live="polite" className="sr-only">
        {saved && "Preferences saved"}
      </div>
      <div>
        <label htmlFor="displayName" className="text-eyebrow uppercase text-white/40">
          Workspace name
        </label>
        <input
          id="displayName"
          value={form.displayName}
          onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          className={`${fieldClass} mt-1.5`}
        />
      </div>

      <div>
        <label htmlFor="timezone" className="text-eyebrow uppercase text-white/40">
          Timezone
        </label>
        <input
          id="timezone"
          value={form.timezone}
          onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
          placeholder="e.g. Asia/Kolkata"
          className={`${fieldClass} mt-1.5`}
        />
      </div>

      <div>
        <label className="text-eyebrow uppercase text-white/40">Default AI tone</label>
        <p className="mt-1 text-caption text-mono-ink-faint">
          Applied to every AI-generated tweet and thread.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TONE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, defaultAiTone: opt.value }))}
              className={`rounded-full border px-3 py-1.5 text-caption font-medium transition-colors duration-150 ${
                form.defaultAiTone === opt.value
                  ? "border-mono-hairline-strong bg-white/[0.08] text-mono-ink"
                  : "border-mono-hairline text-mono-ink-subtle hover:bg-white/[0.04]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-md border border-mono-hairline px-3 py-2.5">
        <div>
          <p className="text-body-sm text-mono-ink">Auto-number threads</p>
          <p className="text-caption text-mono-ink-faint">Prefixes each tweet with &ldquo;n/total&rdquo;.</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.autoThreadNumbering}
          aria-label="Auto-number threads"
          onClick={() =>
            setForm((f) => ({ ...f, autoThreadNumbering: !f.autoThreadNumbering }))
          }
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150 ${
            form.autoThreadNumbering ? "bg-mono-ink" : "bg-white/15"
          }`}
        >
          <span
            className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-black transition-transform duration-150"
            style={{ transform: form.autoThreadNumbering ? "translateX(16px)" : "translateX(0)" }}
          />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={handleSave} disabled={isSaving} className="self-start">
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
          Save preferences
        </Button>
        <span
          className={`flex items-center gap-1.5 text-caption text-mono-ink transition-opacity duration-150 ${
            saved ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <Check size={14} className="text-success" />
          Preferences saved
        </span>
      </div>
    </div>
  );
}
