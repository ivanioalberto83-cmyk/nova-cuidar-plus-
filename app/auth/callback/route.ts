import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/familia";
  return value;
}
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNextPath(url.searchParams.get("next"));
  if (!code) return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return NextResponse.redirect(new URL("/login?error=callback", url.origin));
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.redirect(new URL("/login?error=session", url.origin));
  const { data: profile } = await supabase.from("nova_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!profile) {
    const metadataName = typeof user.user_metadata?.display_name === "string" ? user.user_metadata.display_name.trim() : "";
    const displayName = metadataName || user.email?.split("@")[0] || "Utilizador";
    const metadataPhone = typeof user.user_metadata?.phone === "string" ? user.user_metadata.phone : null;
    const { error: profileError } = await supabase.from("nova_profiles").insert({
      user_id: user.id, display_name: displayName.slice(0,120), phone: metadataPhone, preferred_locale: "pt-AO"
    });
    if (profileError && profileError.code !== "23505") return NextResponse.redirect(new URL("/login?error=profile", url.origin));
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
