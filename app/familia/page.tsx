import Link from "next/link";
import { redirect } from "next/navigation";
import { registerChild, signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ error?: string; notice?: string }> };

export default async function FamilyPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) redirect("/login");

  const [{ data: profile }, { data: children, error: childrenError }] = await Promise.all([
    supabase.from("nova_profiles").select("display_name, account_status").eq("user_id", user.id).maybeSingle(),
    supabase.from("nova_children").select("id, display_name, birth_date, created_at").order("created_at", { ascending: false })
  ]);
  const registrationEnabled = process.env.NOVA_ENABLE_CHILD_REGISTRATION === "true";
  const name = profile?.display_name || user.email || "Responsável";

  return <>
    <header className="shell site-header">
      <Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link>
      <form action={signOut}><button className="button secondary" type="submit">Terminar sessão</button></form>
    </header>
    <main className="shell">
      <section className="dashboard-head">
        <div><span className="eyebrow">Área familiar</span><h1>Olá, {name}</h1><p className="muted">Gerir o seu perfil e as relações familiares autorizadas.</p></div>
        <div className="pill">Conta: {profile?.account_status === "active" ? "Activa" : "Pendente de validação"}</div>
      </section>
      {params.notice === "child-created" && <div className="notice">Registo da criança criado e associado à sua conta. Os consentimentos ficaram registados.</div>}
      {params.notice === "registration-paused" && <div className="notice">O registo de crianças está temporariamente bloqueado enquanto o aviso de privacidade é revisto. Não introduza dados reais nesta fase.</div>}
      {params.notice === "password-updated" && <div className="notice">Palavra-passe actualizada.</div>}
      {params.error && <div className="notice error">Não foi possível concluir a operação. Verifique os dados e tente novamente.</div>}
      {childrenError && <div className="notice error">Não foi possível carregar a lista de crianças.</div>}
      <section className="dashboard-grid">
        <article className="panel">
          <h2>Crianças associadas</h2><p className="muted">Apenas são apresentados os registos a que a sua conta tem acesso autorizado.</p>
          {children && children.length > 0 ? <div className="child-list">{children.map(child => <div className="child-item" key={child.id}>
            <div><strong>{child.display_name}</strong><span>{child.birth_date ? new Date(child.birth_date + "T00:00:00").toLocaleDateString("pt-PT") : "Data de nascimento não indicada"}</span></div><span>Registo familiar</span>
          </div>)}</div> : <div className="notice">Ainda não existem crianças associadas a esta conta.</div>}
        </article>
        <article className="panel">
          <h2>Adicionar criança</h2>
          {registrationEnabled ? <>
            <p className="muted">Registe apenas os dados operacionais estritamente necessários. Não introduza informação clínica, diagnósticos ou relatórios.</p>
            <form className="form" action={registerChild}>
              <div className="field"><label htmlFor="displayName">Nome de apresentação</label><input id="displayName" name="displayName" maxLength={120} required /></div>
              <div className="field"><label htmlFor="birthDate">Data de nascimento (opcional)</label><input id="birthDate" name="birthDate" type="date" /></div>
              <div className="field"><label htmlFor="relationship">Relação com a criança</label><select id="relationship" name="relationship" defaultValue="legal_guardian" required>
                <option value="mother">Mãe</option><option value="father">Pai</option><option value="legal_guardian">Tutor legal</option><option value="family_member">Familiar</option><option value="other">Outro responsável</option>
              </select></div>
              <label className="checkline"><input type="checkbox" name="privacyConsent" required />Confirmo que li o aviso de privacidade apresentado pela plataforma e autorizo o tratamento dos dados mínimos para gerir esta relação familiar.</label>
              <button className="button" type="submit">Guardar registo familiar</button>
            </form>
          </> : <div className="notice">A gravação permanece desactivada até à aprovação do aviso de privacidade, dos termos e da identificação/contacto do responsável pelo tratamento. Nesta fase não recolhemos dados de crianças.</div>}
        </article>
      </section>
    </main>
    <footer className="shell footer">NOVA CUIDAR+ · Dados de crianças protegidos por controlo de acesso e minimização de dados.</footer>
  </>;
}
