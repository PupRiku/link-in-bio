"use client";

import { useActionState } from "react";

import type { EventRow } from "@/lib/supabase/types";
import {
  Button,
  CheckboxField,
  Field,
  FormBanner,
} from "../_components/ui";
import type { ActionState } from "./actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

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
    <form action={formAction} className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
      {defaultValues?.id ? (
        <input type="hidden" name="id" value={defaultValues.id} />
      ) : null}

      {state?.error ? (
        <div className="sm:col-span-2">
          <FormBanner error={state.error} />
        </div>
      ) : null}

      <Field
        label="Title"
        name="title"
        defaultValue={defaultValues?.title ?? ""}
        placeholder="Chicago weekend"
        required
        className="sm:col-span-2"
      />
      <Field
        label="Venue"
        name="venue"
        defaultValue={defaultValues?.venue ?? ""}
        placeholder="The Eagle"
      />
      <Field
        label="City"
        name="city"
        defaultValue={defaultValues?.city ?? ""}
        placeholder="Chicago"
      />
      <Field
        label="Starts"
        name="starts_at"
        type="date"
        defaultValue={defaultValues?.starts_at ?? ""}
        required
      />
      <Field
        label="Ends (optional)"
        name="ends_at"
        type="date"
        defaultValue={defaultValues?.ends_at ?? ""}
      />
      <Field
        label="URL (optional)"
        name="url"
        defaultValue={defaultValues?.url ?? ""}
        placeholder="https://…"
        className="sm:col-span-2"
      />
      <Field
        label="Blurb (optional)"
        name="blurb"
        defaultValue={defaultValues?.blurb ?? ""}
        placeholder="glamping · placeholder"
        className="sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <CheckboxField
          label="Public (visible on the travel panel)"
          name="is_public"
          defaultChecked={defaultValues?.is_public ?? true}
        />
      </div>

      <div className="flex justify-end gap-2.5 sm:col-span-2">
        <Button variant="ghost" href="/admin/events">
          Cancel
        </Button>
        <Button variant="solid" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
