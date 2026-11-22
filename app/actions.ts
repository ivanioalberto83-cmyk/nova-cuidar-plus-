"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
async function requestOrigin() {
  const headerStore = await headers();
  const origin = headerStore.get("origin") || process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) throw new Error("Defina NEXT_PUBLIC_SITE_URL no ambiente da aplicação.");
  return origin.replace(/\/$/, "");
}
export async function signIn(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) redirect("/login?error=missing");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect("/login?error=credentials");
  redirect("/familia");
}
export async function signUp(formData: FormData) {
  const displayName = value(formData, "displayName");
  const phone = value(formData, "phone");
  const email = value(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (displayName.length < 2 || !email || password.length < 8) redirect("/registar?error=validation");
  const supabase = await createClient();
  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email, password, options: { data: { display_name: displayName, phone }, emailRedirectTo: `${origin}/auth/callback?next=%2Ffamilia` }
  });
  if (error) redirect("/registar?error=signup");
  if (data.session && data.user) {
    const { error: profileError } = await supabase.from("nova_profiles").insert({
      user_id: data.user.id, display_name: displayName, phone: phone || null, preferred_locale: "pt-AO"
    });
    if (profileError && profileError.code !== "23505") redirect("/registar?error=profile");
    redirect("/familia");
  }
  redirect("/login?notice=confirm-email");
}
export async function requestPasswordReset(formData: FormData) {
  const email = value(formData, "email").toLowerCase();
  if (!email) redirect("/recuperar?error=missing");
  const supabase = await createClient();
  const origin = await requestOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback?next=%2Fauth%2Fupdate-password` });
  if (error) redirect("/recuperar?error=send");
  redirect("/recuperar?notice=sent");
}
export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8 || password !== confirmation) redirect("/auth/update-password?error=validation");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=session");
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/auth/update-password?error=update");
  redirect("/familia?notice=password-updated");
}
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
export async function registerChild(formData: FormData) {
  if (process.env.NOVA_ENABLE_CHILD_REGISTRATION !== "true") redirect("/familia?notice=registration-paused");
  const displayName = value(formData, "displayName");
  const birthDateValue = value(formData, "birthDate");
  const relationship = value(formData, "relationship");
  const acceptedPrivacy = formData.get("privacyConsent") === "on";
  if (!displayName || displayName.length > 120 || !acceptedPrivacy) redirect("/familia?error=child-validation");
  const birthDate = birthDateValue || null;
  if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) redirect("/familia?error=child-date");
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const { error } = await supabase.rpc("nova_register_child", {
    p_display_name: displayName, p_birth_date: birthDate, p_relationship: relationship, p_policy_version: "2026-11-draft"
  });
  if (error) redirect("/familia?error=child-save");
  redirect("/familia?notice=child-created");
}
