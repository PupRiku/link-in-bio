import Link from "next/link";
import type { ReactNode } from "react";

import { ExternalIcon } from "./icons";

/* ---------------------------------------------------------------- Button */

type ButtonVariant = "primary" | "solid" | "ghost" | "destructive";

const BUTTON_BASE =
  "font-oswald text-[12px] tracking-[0.08em] uppercase rounded-[9px] px-[14px] py-[9px] inline-flex items-center justify-center gap-[7px] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 disabled:opacity-60";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "border border-teal text-teal bg-transparent hover:bg-teal hover:text-[#06210f]",
  solid: "border border-teal bg-teal text-[#06210f] hover:bg-[#26bda9]",
  ghost:
    "border border-line-2 text-mute bg-transparent hover:bg-surface-2 hover:text-bone",
  destructive:
    "border border-oxblood text-oxblood-soft bg-transparent hover:bg-oxblood hover:text-bone",
};

export function Button({
  variant = "primary",
  href,
  download,
  type = "button",
  className = "",
  children,
  ...rest
}: {
  variant?: ButtonVariant;
  href?: string;
  download?: string;
  type?: "button" | "submit";
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${className}`;
  if (href) {
    // Downloads (and data:/blob: URLs) need a plain anchor, not next/link.
    if (download) {
      return (
        <a href={href} download={download} className={cls}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ IconButton */

export function IconButton({
  variant = "default",
  href,
  type = "button",
  className = "",
  children,
  ...rest
}: {
  variant?: "default" | "del";
  href?: string;
  type?: "button" | "submit";
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `h-[30px] w-[30px] rounded-[8px] border border-line-2 bg-transparent text-mute inline-flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60 [&_svg]:h-[15px] [&_svg]:w-[15px] ${
    variant === "del"
      ? "hover:border-oxblood hover:text-oxblood-soft"
      : "hover:border-steel hover:text-bone"
  } ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  );
}

/* ----------------------------------------------------------------- Badge */

export function Badge({ tier }: { tier: "public" | "after_dark" }) {
  const base =
    "font-oswald text-[10px] tracking-[0.12em] uppercase px-[9px] py-[3px] rounded-full border inline-block";
  if (tier === "after_dark") {
    return (
      <span
        className={`${base} text-oxblood-soft border-oxblood-live/50 bg-oxblood-live/[0.12]`}
      >
        After dark
      </span>
    );
  }
  return (
    <span className={`${base} text-teal border-teal/40 bg-teal/[0.08]`}>
      Public
    </span>
  );
}

/* -------------------------------------------------------------- StatCard */

export function StatCard({
  label,
  value,
  detail,
  accent = "steel",
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  accent?: "teal" | "steel" | "purple" | "oxblood" | "orange";
}) {
  const accentBg: Record<string, string> = {
    teal: "bg-teal",
    steel: "bg-steel",
    purple: "bg-purple",
    oxblood: "bg-oxblood-live",
    orange: "bg-orange",
  };
  return (
    <div className="relative overflow-hidden rounded-[14px] border border-line bg-surface px-[18px] py-4">
      <span
        className={`absolute left-0 top-0 bottom-0 w-[3px] opacity-85 ${accentBg[accent]}`}
      />
      <div className="font-oswald text-[11px] tracking-[0.18em] uppercase text-mute">
        {label}
      </div>
      <div className="mt-2 text-[30px] font-semibold tracking-[-0.01em] tabular-nums">
        {value}
      </div>
      {detail ? (
        <div className="mt-1 text-[11.5px] text-dim">{detail}</div>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ Card */

export function Card({
  title,
  aside,
  className = "",
  children,
}: {
  title?: ReactNode;
  aside?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-[14px] border border-line bg-surface px-5 py-[18px] min-w-0 ${className}`}
    >
      {title ? (
        <h2 className="mb-[14px] flex items-center justify-between font-oswald text-[12px] font-semibold uppercase tracking-[0.16em] text-steel">
          <span>{title}</span>
          {aside ? (
            <span className="font-sans text-[11px] font-normal normal-case tracking-normal text-dim">
              {aside}
            </span>
          ) : null}
        </h2>
      ) : null}
      {children}
    </div>
  );
}

/* ------------------------------------------------------------ PageHeader */

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-anton text-[34px] leading-none tracking-[-0.01em]">
          {title}
        </h1>
        {subtitle ? (
          <div className="mt-[7px] text-[13px] text-mute">{subtitle}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ViewSiteLink() {
  return (
    <a
      href="/"
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-[7px] rounded-[9px] border border-line-2 px-[14px] py-[9px] font-oswald text-[12px] uppercase tracking-[0.1em] text-teal transition-colors hover:border-teal hover:bg-teal/[0.06]"
    >
      View public site
      <ExternalIcon className="h-[13px] w-[13px]" />
    </a>
  );
}

/* ------------------------------------------------------------------- Bar */

export function Bar({
  label,
  value,
  max,
  zone,
}: {
  label: string;
  value: number;
  max: number;
  zone?: "public" | "after_dark";
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const dark = zone === "after_dark";
  return (
    <div className="grid grid-cols-[84px_1fr_34px] items-center gap-[10px] text-[13px]">
      <div className="truncate text-steel">{label}</div>
      <div className="h-[7px] overflow-hidden rounded-[4px] bg-surface-2">
        <div
          className={`h-full rounded-[4px] ${
            dark
              ? "bg-oxblood-live shadow-[0_0_10px_-2px_var(--color-oxblood-live)]"
              : "bg-teal shadow-[0_0_10px_-2px_var(--color-teal)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-right tabular-nums text-mute">{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------- FeedRow */

export function FeedRow({
  dotColor,
  label,
  sub,
  trailing,
}: {
  dotColor?: string;
  label: ReactNode;
  sub?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-[11px] border-b border-line py-[10px] last:border-b-0">
      {dotColor ? (
        <span
          className="h-2 w-2 flex-none rounded-full"
          style={{ background: dotColor }}
        />
      ) : null}
      <div className="flex-1 text-[13px] text-bone">
        {label}
        {sub ? (
          <small className="mt-px block text-[11px] text-dim">{sub}</small>
        ) : null}
      </div>
      {trailing ? (
        <div className="text-[11px] tabular-nums text-mute">{trailing}</div>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------- Field */

export const inputClass =
  "w-full rounded-[9px] border border-line-2 bg-panel px-3 py-2.5 text-sm text-bone outline-none transition placeholder:text-dim focus:border-teal focus:shadow-[0_0_0_3px_rgba(45,212,191,0.14)]";

export const fieldLabelClass =
  "mb-[7px] block font-oswald text-[11px] uppercase tracking-[0.14em] text-mute";

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  required,
  hint,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  placeholder?: string;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={fieldLabelClass} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className={inputClass}
      />
      {hint ? <p className="mt-1.5 text-[11px] text-dim">{hint}</p> : null}
    </div>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={fieldLabelClass} htmlFor={name}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        className={inputClass}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CheckboxField({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-steel">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-line-2 bg-panel accent-teal"
      />
      {label}
    </label>
  );
}

/* ------------------------------------------------------------ FormBanner */

export function FormBanner({
  error,
  ok,
}: {
  error?: string;
  ok?: boolean;
}) {
  if (error) {
    return (
      <div className="rounded-[9px] border border-oxblood/60 bg-oxblood/[0.15] px-3 py-2 text-sm text-oxblood-soft">
        {error}
      </div>
    );
  }
  if (ok) {
    return (
      <div className="rounded-[9px] border border-teal/50 bg-teal/[0.1] px-3 py-2 text-sm text-teal">
        Saved.
      </div>
    );
  }
  return null;
}
