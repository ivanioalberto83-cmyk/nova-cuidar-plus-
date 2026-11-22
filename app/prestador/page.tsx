import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
type Props = { searchParams: Promise<{ notice?: string }> };
const labels: Record<string,string> = { pending:"Pendente",under_review:"Em análise",changes_requested:"Correcções solicitadas",approved:"Aprovado",rejected:"Rejeitado",suspended:"Suspenso" };
export default async function ProviderPage({searchParams}:Props) {
 const params=await searchParams; const supabase=await createClient();
 const {data:{user},error}=await supabase.auth.getUser(); if(error||!user) redirect("/login");
 const {data:profiles,error:profileError}=await supabase.from("nova_provider_profiles").select("id,provider_type,public_name,qualification_path,verification_status,is_public,created_at").order("created_at",{ascending:false});
 return <>
  <header className="shell site-header"><Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link><form action={signOut}><button className="button secondary" type="submit">Terminar sessão</button></form></header>
  <main className="shell"><section className="dashboard-head"><div><span className="eyebrow">Área de prestadores</span><h1>Os meus perfis</h1><p className="muted">Gestão de candidatura e estado de verificação.</p></div><Link className="button" href="/prestador/registar">Criar perfil de prestador</Link></section>
  {params.notice==="submitted"&&<div className="notice">Perfil submetido. Ficará privado enquanto aguarda análise administrativa.</div>}
  {profileError&&<div className="notice error">Não foi possível carregar os perfis.</div>}
  <section className="panel"><h2>Perfis registados</h2>{profiles?.length?<div className="provider-list">{profiles.map(p=><article className="provider-item" key={p.id}><div><strong>{p.public_name}</strong><p className="muted">{p.provider_type==="individual"?"Cuidador individual":"Organização"} · {p.qualification_path==="certified"?"Formação certificada":p.qualification_path==="experience_based"?"Experiência comprovável":"Formação e experiência"}</p></div><div className="provider-status"><span className="pill">{labels[p.verification_status]??p.verification_status}</span><small>{p.is_public?"Visível":"Perfil privado"}</small></div></article>)}</div>:<div className="notice">Ainda não tem um perfil de prestador. Pode iniciar o registo quando estiver preparado.</div>}</section></main>
  <footer className="shell footer">NOVA CUIDAR+ · A publicação depende de aprovação administrativa.</footer>
 </>;
}
