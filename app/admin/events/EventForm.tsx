"use client";

import { useActionState } from "react";

import type { EventRow } from "@/lib/supabase/types";
import type { ActionState } from "./actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

const field =
  "w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-400";
const labelCls = "block text-xs font-medium uppercase tracking-wide text-zinc-400";

export default function EventForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: Action;
  defaultValues?: Partial<EventRow>;
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

      <div className="space-y-1">
        <label className={labelCls} htmlFor="title">
          Title
        </label>
        <input
          id="title"
          name="title"
          className={field}
          defaultValue={defaultValues?.title ?? ""}
          placeholder="Chicago weekend"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className={labelCls} htmlFor="venue">
            Venue
          </label>
          <input
            id="venue"
            name="venue"
            className={field}
            defaultValue={defaultValues?.venue ?? ""}
            placeholder="The Eagle"
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls} htmlFor="city">
            City
          </label>
          <input
            id="city"
            name="city"
            className={field}
            defaultValue={defaultValues?.city ?? ""}
            placeholder="Chicago"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className={labelCls} htmlFor="starts_at">
            Starts
          </label>
          <input
            id="starts_at"
            name="starts_at"
            type="date"
            className={field}
            defaultValue={defaultValues?.starts_at ?? ""}
            required
          />
        </div>
        <div className="space-y-1">
          <label className={labelCls} htmlFor="ends_at">
            Ends (optional)
          </label>
          <input
            id="ends_at"
            name="ends_at"
            type="date"
            className={field}
            defaultValue={defaultValues?.ends_at ?? ""}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="url">
          URL (optional)
        </label>
        <input
          id="url"
          name="url"
          className={field}
          defaultValue={defaultValues?.url ?? ""}
          placeholder="https://…"
        />
      </div>

      <div className="space-y-1">
        <label className={labelCls} htmlFor="blurb">
          Blurb (optional)
        </label>
        <input
          id="blurb"
          name="blurb"
          className={field}
          defaultValue={defaultValues?.blurb ?? ""}
          placeholder="glamping · placeholder"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-300">
        <input
          type="checkbox"
          name="is_public"
          defaultChecked={defaultValues?.is_public ?? true}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-900"
        />
        Public (visible on the travel panel)
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
