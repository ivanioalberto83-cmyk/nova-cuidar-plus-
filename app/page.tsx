import Link from "next/link";
export default function HomePage() {
  return <>
    <header className="shell site-header">
      <Link className="brand" href="/"><span className="brand-mark">+</span><span>NOVA CUIDAR+</span></Link>
      <nav className="nav"><Link href="/login">Entrar</Link><Link className="button" href="/registar">Criar conta</Link></nav>
    </header>
    <main className="shell">
      <section className="hero">
        <div><span className="eyebrow">Cuidado infantil em Angola</span>
          <h1>O cuidado certo começa com confiança.</h1>
          <p>Uma plataforma para aproximar famílias de cuidadores e organizações de apoio infantil, com informação clara, relações autorizadas e acompanhamento responsável.</p>
          <div className="actions"><Link className="button" href="/registar">Criar conta de família</Link><Link className="button secondary" href="/login">Já tenho conta</Link></div>
        </div>
        <aside className="hero-card"><span className="eyebrow">NOVA CUIDAR+</span><h2>Famílias, cuidadores e organizações num só espaço.</h2>
          <p>A primeira etapa está focada no acesso seguro e na gestão básica dos perfis familiares.</p>
          <div className="pill-list"><span className="pill">Famílias</span><span className="pill">Cuidadores individuais</span><span className="pill">Organizações</span><span className="pill">Angola</span></div>
        </aside>
      </section>
      <section className="section"><span className="eyebrow">Plataforma por etapas</span><h2>Uma base segura para crescer.</h2>
        <div className="cards">
          <article className="info-card"><h3>Famílias e crianças</h3><p>Perfis operacionais mínimos e relações entre responsáveis devidamente identificadas.</p></article>
          <article className="info-card"><h3>Prestadores</h3><p>Espaço para cuidadores individuais e organizações, com verificação antes da activação.</p></article>
          <article className="info-card"><h3>Agendamentos e pagamentos</h3><p>Serviços, marcações e pagamentos híbridos serão integrados nas próximas etapas.</p></article>
        </div>
      </section>
    </main>
    <footer className="shell footer">NOVA CUIDAR+ · Plataforma independente · Angola</footer>
  </>;
}
