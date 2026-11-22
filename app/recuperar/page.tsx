import Link from "next/link";
import { requestPasswordReset } from "@/app/actions";
type Props = { searchParams: Promise<{ error?: string; notice?: string }> };
export default async function RecoverPage({ searchParams }: Props) {
  const params = await searchParams;
  return <>
    <header className="shell site-header"><Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link></header>
    <main className="shell auth-wrap"><section className="auth-card">
      <span className="eyebrow">Recuperar acesso</span><h1>Nova palavra-passe</h1><p className="muted">Introduza o email associado à sua conta. Enviaremos as instruções de recuperação, se a conta existir.</p>
      {params.notice === "sent" && <div className="notice">Se o endereço estiver registado, receberá uma mensagem com as instruções.</div>}
      {params.error && <div className="notice error">Não foi possível processar o pedido. Confirme o email e tente novamente.</div>}
      <form className="form" action={requestPasswordReset}><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" required /></div><button className="button" type="submit">Enviar instruções</button></form>
      <div className="small-links"><Link href="/login">Voltar ao início de sessão</Link></div>
    </section></main>
  </>;
}
