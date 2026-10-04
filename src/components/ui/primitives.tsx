"use client";
/**
 * Small shared UI primitives: buttons, badges, fields, collapsibles,
 * epistemic glyphs, theme toggle. Native elements first for accessibility.
 */
import React, { useCallback, useEffect, useState } from "react";
import type { Confidence, EpistemicType } from "@/lib/schema";
import { CONFIDENCE_LABEL, EPISTEMIC_STYLES, epColor, epSoft } from "@/lib/epistemic";

// ---------------------------------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors disabled:opacity-45 disabled:cursor-not-allowed whitespace-nowrap";
  const sizes = size === "sm" ? "text-[13px] px-2.5 h-9" : "text-sm px-3.5 h-11";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-accent text-accent-ink hover:bg-accent-strong",
    secondary: "bg-surface border border-line-strong text-ink hover:bg-surface-2",
    ghost: "text-ink-muted hover:text-ink hover:bg-surface-2",
    danger: "bg-surface border border-danger text-danger hover:bg-danger-soft",
  };
  return <button className={`${base} ${sizes} ${variants[variant]} ${className}`} {...props} />;
}

// ---------------------------------------------------------------------------

export function EpistemicGlyph({ type, size = 12 }: { type: EpistemicType; size?: number }) {
  const s = EPISTEMIC_STYLES[type];
  const c = epColor(type);
  const soft = epSoft(type);
  const half = size / 2;
  const common = { width: size, height: size, "aria-hidden": true as const };
  switch (s.shape) {
    case "square-solid":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" rx="1.5" fill={c} />
        </svg>
      );
    case "square-outline":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill="none" stroke={c} strokeWidth="1.8" />
        </svg>
      );
    case "square-dashed":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" fill={soft} stroke={c} strokeWidth="1.6" strokeDasharray="2.4 1.8" />
        </svg>
      );
    case "square-tinted":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" rx="1.5" fill={soft} stroke={c} strokeWidth="1.2" />
          <rect x="3.4" y="3.4" width="5.2" height="5.2" rx="1" fill={c} opacity="0.55" />
        </svg>
      );
    case "diamond":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <path d={`M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z`} fill={soft} stroke={c} strokeWidth="1.5" />
        </svg>
      );
    case "circle-dotted":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <circle cx={half} cy={half} r="4.6" fill="none" stroke={c} strokeWidth="1.6" strokeDasharray="1.4 2" />
        </svg>
      );
    case "link":
      return (
        <svg {...common} viewBox="0 0 12 12">
          <rect x="1" y="1" width="10" height="10" rx="1.5" fill="none" stroke={c} strokeWidth="1.5" />
          <path d="M4 8 L8 4 M5.5 4 H8 V6.5" fill="none" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
  }
}

export function EpistemicBadge({ type, compact = false }: { type: EpistemicType; compact?: boolean }) {
  const s = EPISTEMIC_STYLES[type];
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[12px] leading-none"
      style={{ background: epSoft(type), color: epColor(type) }}
      title={s.description}
    >
      <EpistemicGlyph type={type} size={10} />
      {compact ? s.short : s.label}
    </span>
  );
}

export function ConfidenceBadge({ value }: { value: Confidence }) {
  if (value === "not_applicable") {
    return <span className="text-[12px] text-ink-faint">n/a</span>;
  }
  const bars = value === "low" ? 1 : value === "medium" ? 2 : 3;
  return (
    <span className="inline-flex items-center gap-1 text-[12px] text-ink-muted" title={CONFIDENCE_LABEL[value]}>
      <svg width="16" height="10" viewBox="0 0 16 10" aria-hidden>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={i * 5.5}
            y={8 - (i + 1) * 2.6}
            width="4"
            height={(i + 1) * 2.6}
            rx="0.8"
            fill={i < bars ? "var(--ink-muted)" : "var(--line)"}
          />
        ))}
      </svg>
      {value}
    </span>
  );
}

// ---------------------------------------------------------------------------

export function Field({
  label,
  hint,
  error,
  id,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-[13px] text-ink-muted -mt-0.5">
          {hint}
        </p>
      )}
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "w-full rounded border border-line-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-faint focus:border-accent";

// ---------------------------------------------------------------------------

export function Collapsible({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="group rounded border border-line bg-surface" open={defaultOpen}>
      <summary className="cursor-pointer select-none px-3 py-2 text-sm font-medium text-ink hover:bg-surface-2 rounded list-none flex items-center gap-2 min-h-[44px]">
        <svg width="10" height="10" viewBox="0 0 10 10" className="shrink-0 transition-transform group-open:rotate-90" aria-hidden>
          <path d="M3 1.5 L7.5 5 L3 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        {summary}
      </summary>
      <div className="px-3 pb-3 pt-1 text-sm text-ink-muted">{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------------------

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    // One-time sync from the pre-paint theme script's DOM attribute; the
    // server render cannot know the theme, so this must happen in an effect.
    const current = document.documentElement.getAttribute("data-theme");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (current === "dark" || current === "light") setTheme(current);
  }, []);
  const toggle = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("lw-theme", next);
    } catch {}
    setTheme(next);
  }, [theme]);
  return (
    <button
      onClick={toggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded text-ink-muted hover:text-ink hover:bg-surface-2"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light theme" : "Dark theme"}
    >
      {theme === "dark" ? (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <line
              key={deg}
              x1="8"
              y1="1"
              x2="8"
              y2="2.8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              transform={`rotate(${deg} 8 8)`}
            />
          ))}
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M13.5 9.5 A6 6 0 1 1 6.5 2.5 A5 5 0 0 0 13.5 9.5 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-surface-3 ${className}`} aria-hidden />;
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-ink-muted" role="status">
      <svg className="animate-spin" width="15" height="15" viewBox="0 0 15 15" aria-hidden>
        <circle cx="7.5" cy="7.5" r="6" fill="none" stroke="var(--line-strong)" strokeWidth="2" />
        <path d="M7.5 1.5 A6 6 0 0 1 13.5 7.5" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {label}
    </span>
  );
}
