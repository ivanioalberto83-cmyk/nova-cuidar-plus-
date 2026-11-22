import Link from "next/link";
import { updatePassword } from "@/app/actions";
type Props = { searchParams: Promise<{ error?: string }> };
export default async function UpdatePasswordPage({ searchParams }: Props) {
  const params = await searchParams;
  return <>
    <header className="shell site-header"><Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link></header>
    <main className="shell auth-wrap"><section className="auth-card">
      <span className="eyebrow">Segurança da conta</span><h1>Definir palavra-passe</h1><p className="muted">Escolha uma nova palavra-passe para a sua conta.</p>
      {params.error && <div className="notice error">A palavra-passe não foi actualizada. Verifique se tem pelo menos 8 caracteres e se os campos coincidem.</div>}
      <form className="form" action={updatePassword}>
        <div className="field"><label htmlFor="password">Nova palavra-passe</label><input id="password" name="password" type="password" minLength={8} autoComplete="new-password" required /></div>
        <div className="field"><label htmlFor="confirmation">Confirmar palavra-passe</label><input id="confirmation" name="confirmation" type="password" minLength={8} autoComplete="new-password" required /></div>
        <button className="button" type="submit">Actualizar palavra-passe</button>
      </form>
      <div className="small-links"><Link href="/login">Voltar ao início de sessão</Link></div>
    </section></main>
  </>;
}
