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

export async function saveProviderProfile(formData: FormData) {
  const providerType = value(formData, "providerType");
  const publicName = value(formData, "publicName");
  const qualificationPath = value(formData, "qualificationPath");
  const yearsRaw = value(formData, "yearsExperience");
  const experienceSummary = value(formData, "experienceSummary");
  const professionalSummary = value(formData, "professionalSummary");
  const organizationId = value(formData, "organizationId");
  const services = formData.getAll("serviceCategories").map(String).filter(Boolean);
  const provinces = formData.getAll("provinces").map(String).filter(Boolean);
  if (!["individual", "organization"].includes(providerType) || publicName.length < 2 || publicName.length > 160 ||
      !["certified", "experience_based", "both"].includes(qualificationPath) ||
      professionalSummary.length > 2000 || experienceSummary.length > 2000 ||
      (providerType === "organization" && !organizationId)) redirect("/prestador/registar?error=validation");
  const years = yearsRaw ? Number(yearsRaw) : null;
  if (years !== null && (!Number.isInteger(years) || years < 0 || years > 60)) redirect("/prestador/registar?error=validation");
  if ((qualificationPath === "experience_based" || qualificationPath === "both") && experienceSummary.length < 20) redirect("/prestador/registar?error=experience");
  const allowedServices = ["acompanhamento_infantil", "apoio_escolar", "cuidados_domicilio", "apoio_necessidades_especiais"];
  const allowedProvinces = ["Bengo","Benguela","Bie","Cabinda","Cuando","Cuanza Norte","Cuanza Sul","Cubango","Cunene","Huambo","Huila","Icolo e Bengo","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico","Moxico Leste","Namibe","Uige","Zaire"];
  if (services.length === 0 || services.some(item => !allowedServices.includes(item)) || provinces.length === 0 || provinces.some(item => !allowedProvinces.includes(item))) redirect("/prestador/registar?error=selection");
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");
  const payload = {
    owner_user_id: user.id, provider_type: providerType, organization_id: providerType === "organization" ? organizationId : null,
    public_name: publicName, professional_summary: professionalSummary || null,
    qualification_path: qualificationPath, years_experience: years,
    experience_summary: experienceSummary || null, service_categories: services, provinces
  };
  const { error } = await supabase.from("nova_provider_profiles").insert(payload);
  if (error) redirect(error.code === "23505" ? "/prestador/registar?error=duplicate" : "/prestador/registar?error=save");
  redirect("/prestador?notice=submitted");
}
