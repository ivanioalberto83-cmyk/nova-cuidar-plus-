# NOVA CUIDAR+ — execução local

## Requisitos
- Node.js 20.9 ou superior
- npm

## Instalação
1. Clonar o repositório e mudar para `feature/nova-cuidar-core-foundation`.
2. Executar `npm install` para instalar as versões exactas de `package.json` e gerar `package-lock.json`.
3. Copiar `.env.example` para `.env.local`.
4. No Supabase, abrir o projecto NOVA CUIDAR+ e obter o Project URL e a chave Publishable em Connect / API Keys.
5. Preencher `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca usar uma chave secret/service_role no browser ou em variáveis NEXT_PUBLIC.
6. Definir `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
7. Executar `npm run dev` e abrir http://localhost:3000.

## Fluxos incluídos
- Registo de conta familiar por email e palavra-passe.
- Confirmação de email através de `/auth/callback`.
- Início e fim de sessão.
- Recuperação e actualização de palavra-passe.
- Área familiar protegida por verificação server-side.
- Listagem de crianças autorizadas.
- Função SQL atómica para criar criança, relação do responsável e consentimentos.

## Salvaguardas antes de dados reais
- A criação de registos de crianças está desactivada por omissão: `NOVA_ENABLE_CHILD_REGISTRATION=false`.
- Não activar até aprovar o aviso de privacidade, os termos, a identidade/contacto do responsável pelo tratamento e o fluxo de consentimento aplicável.
- Usar apenas contas e dados fictícios nos primeiros testes.
- Configurar SMTP de produção e URLs de redireccionamento no Supabase Auth.
- Executar testes de isolamento RLS com duas contas independentes.
- Gerar e rever `package-lock.json` antes de integrar ou fazer deploy.
- Configurar URL pública em `NEXT_PUBLIC_SITE_URL` e na allow-list de redireccionamento do Supabase.

## Validação local
```bash
npm run typecheck
npm run build
```

A aplicação ainda não está publicada. Não disponibilizar a utilizadores reais até concluir os pontos de segurança e privacidade acima.
