"use client";

import { useActionState } from "react";

import type { Link as LinkRow } from "@/lib/supabase/types";
import {
  Button,
  CheckboxField,
  Field,
  FormBanner,
  SelectField,
} from "../_components/ui";
import type { ActionState } from "./actions";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

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
        label="Label"
        name="label"
        defaultValue={defaultValues?.label ?? ""}
        placeholder="Instagram"
        required
      />
      <Field
        label="Slug"
        name="slug"
        defaultValue={defaultValues?.slug ?? ""}
        placeholder="instagram"
        required
        hint={
          <>
            Used in the redirect: /go/
            <span className="text-steel">slug</span>
          </>
        }
      />
      <Field
        label="Destination URL"
        name="url"
        defaultValue={defaultValues?.url ?? ""}
        placeholder="https://instagram.com/yourhandle"
        required
        className="sm:col-span-2"
      />
      <SelectField
        label="Tier"
        name="tier"
        defaultValue={defaultValues?.tier ?? "public"}
        options={[
          { value: "public", label: "Public" },
          { value: "after_dark", label: "After dark" },
        ]}
      />
      <SelectField
        label="Accent"
        name="accent"
        defaultValue={defaultValues?.accent ?? "steel"}
        options={["steel", "orange", "purple", "teal", "oxblood"].map((a) => ({
          value: a,
          label: a[0].toUpperCase() + a.slice(1),
        }))}
      />
      <Field
        label="Icon / chip"
        name="icon"
        defaultValue={defaultValues?.icon ?? ""}
        placeholder="IG"
      />
      <Field
        label="Sort order"
        name="sort_order"
        type="number"
        defaultValue={defaultValues?.sort_order ?? 0}
      />

      <div className="sm:col-span-2">
        <CheckboxField
          label="Active (visible on the public page)"
          name="is_active"
          defaultChecked={defaultValues?.is_active ?? true}
        />
      </div>

      <div className="flex justify-end gap-2.5 sm:col-span-2">
        <Button variant="ghost" href="/admin/links">
          Cancel
        </Button>
        <Button variant="solid" type="submit">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
