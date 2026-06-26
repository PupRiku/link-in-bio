"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "./supabase/server";

/** Sign the current admin out and return to the login page. */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
