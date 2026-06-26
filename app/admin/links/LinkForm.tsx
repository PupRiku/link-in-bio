"use client";

import { useActionState } from "react";

import type { Link as LinkRow } from "@/lib/supabase/types";
import type { ActionState } from "./actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const field =
  "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400";
const labelCls = "block text-xs font-medium uppercase tracking-wide text-zinc-400";

export default function LinkForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  defaultValues?: Partial<LinkRow>;
  submitLabel: string;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {defaultValues?.id ? (
        <input type="hidden" name="id" value={defaultValues.id} />
      ) : null}

      {state?.error ? (
        <div className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className={labelCls} htmlFor="label">
            Label
          </label>
          <input
            id="label"
            name="label"
            className={field}
            defaultValue={defaultValues?.label ?? ""}
            placeholder="Instagram"
            required
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls} htmlFor="slug">
            Slug
          </label>
          <input
            id="slug"
            name="slug"
            className={field}
            defaultValue={defaultValues?.slug ?? ""}
            placeholder="instagram"
            required
          />
          <p className="text-xs text-zinc-600">
            Used in the redirect: /go/<span className="text-zinc-400">slug</span>
          </p>
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="url">
          Destination URL
        </label>
        <input
          id="url"
          name="url"
          className={field}
          defaultValue={defaultValues?.url ?? ""}
          placeholder="https://instagram.com/yourhandle"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="space-y-1">
          <label className={labelCls} htmlFor="tier">
            Tier
          </label>
          <select
            id="tier"
            name="tier"
            className={field}
            defaultValue={defaultValues?.tier ?? "public"}
          >
            <option value="public">public</option>
            <option value="after_dark">after_dark</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelCls} htmlFor="accent">
            Accent
          </label>
          <select
            id="accent"
            name="accent"
            className={field}
            defaultValue={defaultValues?.accent ?? "steel"}
          >
            {["steel", "orange", "purple", "teal", "oxblood"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={labelCls} htmlFor="icon">
            Icon / chip
          </label>
          <input
            id="icon"
            name="icon"
            className={field}
            defaultValue={defaultValues?.icon ?? ""}
            placeholder="IG"
          />
        </div>

        <div className="space-y-1">
          <label className={labelCls} htmlFor="sort_order">
            Sort order
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            className={field}
            defaultValue={defaultValues?.sort_order ?? 0}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="is_active"
          defaultChecked={defaultValues?.is_active ?? true}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
        />
        Active (visible on the public page)
      </label>

      <button
        type="submit"
        className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
