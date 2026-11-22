import Link from "next/link";
import { signUp } from "@/app/actions";
type Props = { searchParams: Promise<{ error?: string }> };
export default async function RegisterPage({ searchParams }: Props) {
  const params = await searchParams;
  return <>
    <header className="shell site-header"><Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link><Link href="/login">Já tenho conta</Link></header>
    <main className="shell auth-wrap"><section className="auth-card">
      <span className="eyebrow">Área familiar</span><h1>Criar conta</h1><p className="muted">Comece por criar o seu perfil de responsável. O registo de crianças é uma etapa separada.</p>
      {params.error && <div className="notice error">Verifique os campos. A palavra-passe deve ter pelo menos 8 caracteres; se o email já existir, entre ou recupere o acesso.</div>}
      <form className="form" action={signUp}>
        <div className="field"><label htmlFor="displayName">Nome completo</label><input id="displayName" name="displayName" autoComplete="name" minLength={2} maxLength={120} required /></div>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="phone">Telefone (opcional)</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="+244 ..." /></div>
        <div className="field"><label htmlFor="password">Palavra-passe</label><input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required /></div>
        <button className="button" type="submit">Criar conta familiar</button>
      </form>
      <p className="muted" style={{fontSize:12,marginTop:18}}>A confirmação do endereço de email poderá ser solicitada antes do primeiro acesso.</p>
    </section></main>
  </>;
}
