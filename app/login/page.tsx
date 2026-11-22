import Link from "next/link";
import { signIn } from "@/app/actions";
type Props = { searchParams: Promise<{ error?: string; notice?: string }> };
export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  return <>
    <header className="shell site-header"><Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link><Link href="/registar">Criar conta</Link></header>
    <main className="shell auth-wrap"><section className="auth-card">
      <span className="eyebrow">Bem-vindo de volta</span><h1>Entrar na plataforma</h1><p className="muted">Aceda à sua área familiar NOVA CUIDAR+.</p>
      {params.notice === "confirm-email" && <div className="notice">Conta criada. Consulte o seu email para confirmar o endereço antes de entrar.</div>}
      {params.notice === "password-updated" && <div className="notice">Palavra-passe actualizada com sucesso.</div>}
      {params.error && <div className="notice error">Não foi possível iniciar sessão. Confirme os dados e tente novamente.</div>}
      <form className="form" action={signIn}>
        <div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div>
        <div className="field"><label htmlFor="password">Palavra-passe</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
        <button className="button" type="submit">Entrar</button>
      </form>
      <div className="small-links"><Link href="/recuperar">Esqueci-me da palavra-passe</Link><Link href="/registar">Criar conta</Link></div>
    </section></main>
  </>;
}
