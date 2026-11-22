import Link from "next/link";
import { redirect } from "next/navigation";
import { createProviderOrganization, saveProviderProfile, signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";

type Props = { searchParams: Promise<{ error?: string; notice?: string }> };
const provinces = ["Bengo","Benguela","Bié","Cabinda","Cuando","Cuanza Norte","Cuanza Sul","Cubango","Cunene","Huambo","Huíla","Icolo e Bengo","Luanda","Lunda Norte","Lunda Sul","Malanje","Moxico","Moxico Leste","Namibe","Uíge","Zaire"];
export default async function ProviderRegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships } = await supabase.from("nova_organization_memberships").select("organization_id").eq("user_id", user.id).eq("status", "active");
  const ids = (memberships ?? []).map(x => x.organization_id);
  const { data: organizations } = ids.length ? await supabase.from("nova_organizations").select("id,display_name").in("id", ids) : { data: [] as {id:string;display_name:string}[] };
  const errors: Record<string,string> = {
    validation:"Verifique os campos obrigatórios e os limites indicados.",
    "organization-validation":"Indique o nome da organização e o tipo correcto.",
    "organization-save":"Não foi possível criar a organização. Confirme os dados e tente novamente.",
    experience:"Descreva pelo menos 20 caracteres de experiência profissional.",
    selection:"Seleccione pelo menos um serviço e uma província válida.",
    duplicate:"Já existe um perfil prestador associado a esta conta.",
    save:"Não foi possível guardar o perfil. Confirme os dados e tente novamente."
  };
  return <>
    <header className="shell site-header"><Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link><form action={signOut}><button className="button secondary" type="submit">Terminar sessão</button></form></header>
    <main className="shell auth-wrap"><section className="auth-card provider-card">
      <span className="eyebrow">Área de prestadores</span><h1>Registar prestador</h1>
      <p className="muted">Crie um perfil profissional. O perfil ficará privado e pendente até à verificação administrativa.</p>
      {params.error && <div className="notice error">{errors[params.error] ?? "Não foi possível concluir o registo."}</div>}
      {params.notice === "organization-created" && <div className="notice">Organização criada com estado pendente. A sua conta ficou associada como responsável inicial. Pode agora submeter o perfil para análise.</div>}
      <section className="panel provider-org-panel"><h2>Registar uma organização</h2><p className="muted">Para empresas, associações, escolas, clínicas ou agências que prestam serviços de cuidado infantil. A organização ficará pendente de verificação.</p><form className="form" action={createProviderOrganization}><div className="field"><label htmlFor="organizationDisplayName">Nome público da organização</label><input id="organizationDisplayName" name="organizationDisplayName" minLength={2} maxLength={160} required /></div><div className="field"><label htmlFor="legalName">Denominação legal (opcional)</label><input id="legalName" name="legalName" maxLength={200} /></div><div className="field"><label htmlFor="organizationType">Categoria</label><select id="organizationType" name="organizationType" defaultValue="care_provider" required><option value="care_provider">Prestador de cuidados</option><option value="school">Escola</option><option value="clinic">Clínica</option><option value="agency">Agência</option><option value="other">Outra</option></select></div><button className="button secondary" type="submit">Criar organização e associar-me como responsável</button></form></section>
      <form className="form" action={saveProviderProfile}>
        <div className="field"><label htmlFor="providerType">Tipo de prestador</label><select id="providerType" name="providerType" required defaultValue="individual"><option value="individual">Cuidador individual</option><option value="organization" disabled={!organizations?.length}>Organização prestadora{!organizations?.length ? " — ainda sem organização associada" : ""}</option></select></div>
        <div className="field"><label htmlFor="publicName">Nome profissional ou nome da organização</label><input id="publicName" name="publicName" minLength={2} maxLength={160} required /></div>
        <div className="field"><label htmlFor="organizationId">Organização associada (para contas com vínculo activo)</label><select id="organizationId" name="organizationId" defaultValue=""><option value="">Seleccione apenas se aplicável</option>{(organizations ?? []).map(org => <option key={org.id} value={org.id}>{org.display_name}</option>)}</select><small className="muted">A associação é validada pelas permissões da sua conta.</small></div>
        <div className="field"><label htmlFor="qualificationPath">Percurso profissional</label><select id="qualificationPath" name="qualificationPath" required defaultValue="certified"><option value="certified">Formação certificada</option><option value="experience_based">Experiência comprovável, sem certificado</option><option value="both">Formação e experiência</option></select></div>
        <div className="field"><label htmlFor="yearsExperience">Anos de experiência (se aplicável)</label><input id="yearsExperience" name="yearsExperience" type="number" min="0" max="60" /></div>
        <div className="field"><label htmlFor="professionalSummary">Apresentação profissional</label><textarea id="professionalSummary" name="professionalSummary" rows={3} maxLength={2000} placeholder="Descreva brevemente o seu perfil e abordagem." /></div>
        <div className="field"><label htmlFor="experienceSummary">Experiência profissional e referências</label><textarea id="experienceSummary" name="experienceSummary" rows={4} maxLength={2000} placeholder="Descreva funções, períodos, contextos e referências que possam ser verificadas." /><small className="muted">Obrigatório para quem selecciona experiência comprovável ou ambos.</small></div>
        <fieldset className="choice-field"><legend>Serviços prestados</legend><label className="checkline"><input type="checkbox" name="serviceCategories" value="acompanhamento_infantil"/> Acompanhamento infantil</label><label className="checkline"><input type="checkbox" name="serviceCategories" value="apoio_escolar"/> Apoio escolar</label><label className="checkline"><input type="checkbox" name="serviceCategories" value="cuidados_domicilio"/> Cuidados ao domicílio</label><label className="checkline"><input type="checkbox" name="serviceCategories" value="apoio_necessidades_especiais"/> Apoio a necessidades especiais</label></fieldset>
        <fieldset className="choice-field"><legend>Províncias onde presta serviços</legend><div className="province-grid">{provinces.map(p => <label className="checkline" key={p}><input type="checkbox" name="provinces" value={p.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}/> {p}</label>)}</div></fieldset>
        <div className="notice">Nesta fase não são solicitados documentos de identificação nem certificados. O envio documental será disponibilizado depois de o processo de privacidade e armazenamento seguro estar concluído.</div>
        <button className="button" type="submit">Guardar e submeter para análise</button>
      </form>
      <p className="small-links"><Link href="/prestador">Voltar à área do prestador</Link><Link href="/familia">Área familiar</Link></p>
    </section></main>
  </>;
}
