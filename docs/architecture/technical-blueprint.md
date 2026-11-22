# NOVA CUIDAR+ — Fundação técnica e NOVA CORE

## Estado do repositório

- Repositório: `ivanioalberto83-cmyk/nova-cuidar-plus-`
- Branch de trabalho: `feature/nova-cuidar-core-foundation`
- Branch base: `main`
- Estado inicial observado: apenas um README curto; sem aplicação, framework, migrações ou testes identificados.
- Este documento define a proposta técnica inicial. Não representa uma implementação funcional nem uma ligação já criada ao Supabase ou Vercel.

## Objectivo

Construir uma plataforma independente, nacional e modular para ligar famílias e responsáveis a cuidadores e prestadores de serviços de assistência infantil, incluindo serviços escolares e clínicos ao domicílio.

## Decisões de produto já definidas

- Nome comercial: **NOVA CUIDAR+**.
- Modelo de produto: independente.
- Público inicial: crianças.
- Cobertura geográfica: nacional (Angola).
- Prestadores: individuais e empresas.
- Pagamentos: modelo híbrido.
- A plataforma deve permitir expansão por módulos sem misturar os dados de clientes diferentes.

## Arquitectura recomendada

A recomendação inicial é uma aplicação web responsiva com:

- **Frontend e backend web:** Next.js com TypeScript.
- **Dados e serviços:** Supabase (PostgreSQL, Auth e Storage), com Row Level Security (RLS).
- **Alojamento da aplicação:** Vercel.
- **Repositório e controlo de versões:** GitHub.
- **Integrações externas:** adaptadores isolados para pagamentos, notificações, mapas e verificação de prestadores.

A selecção final de versões, estrutura de pastas e configuração de deploy deve ser confirmada antes do scaffold de código. Não colocar chaves secretas no GitHub nem no frontend.

## Princípios de segurança e privacidade

1. Os dados de crianças são dados de elevada sensibilidade: recolher apenas o estritamente necessário para prestar e gerir o serviço.
2. O responsável legal deve estar associado à criança e o consentimento aplicável deve ser registado antes de activar funcionalidades que tratem dados sensíveis.
3. Separar identidade/autenticação, perfil operacional e informação sensível.
4. Aplicar RLS por organização, relação familiar, prestador e função; nunca confiar apenas em esconder elementos da interface.
5. Registar operações relevantes numa trilha de auditoria, sem expor segredos ou conteúdo clínico desnecessário nos registos.
6. Não disponibilizar informação de uma criança a prestadores sem uma relação de serviço autorizada.
7. Não guardar dados de cartões ou credenciais de pagamento; usar fornecedores de pagamento adequados e guardar apenas referências e estados.
8. Ambientes de desenvolvimento, teste e produção devem ser separados.

## NOVA CORE — primeira entrega funcional

O NOVA CORE é a fundação partilhada pelos módulos.

### Capacidades

- Registo, autenticação, recuperação de acesso e gestão de sessões.
- Perfis de utilizador e associação a organizações.
- Papéis e permissões iniciais: administração da plataforma, responsável familiar, prestador individual, operador de prestador/empresa e suporte.
- Registo de organizações prestadoras e dos seus membros.
- Registo mínimo de crianças associado a um ou mais responsáveis autorizados.
- Catálogo inicial de serviços e áreas de cobertura.
- Registo de consentimentos e histórico de alterações.
- Auditoria de acções administrativas e acessos relevantes.
- Estados de conta, aprovação e suspensão com motivo e histórico.

### Módulos previstos

1. **Famílias e Crianças:** responsáveis, perfis mínimos, autorizações e preferências operacionais.
2. **Prestadores:** cadastro individual/empresa, equipa, documentação e estado de verificação.
3. **Serviços:** categorias, descrições, modalidades, disponibilidade e cobertura geográfica.
4. **Agendamentos:** pedidos, confirmação, alteração, cancelamento e histórico.
5. **Pagamentos:** pagamentos online e registo de pagamentos manuais, com reconciliação e comissões configuráveis.
6. **Comunicação:** notificações e mensagens transaccionais.
7. **Avaliações:** feedback após serviços concluídos, com moderação.
8. **Administração:** gestão de utilizadores, prestadores, categorias, ocorrências e indicadores.
9. **Relatórios:** actividade, serviços, pagamentos e qualidade operacional.

## Domínio de dados inicial (proposta)

As entidades abaixo são propostas para desenho e validação; ainda não existem como tabelas criadas:

- `organizations`: empresas e entidades prestadoras.
- `user_profiles`: perfil funcional associado à identidade autenticada.
- `organization_members`: relação utilizador-organização e função.
- `children`: perfil mínimo da criança.
- `guardians`: relação entre responsável e criança.
- `consents`: consentimentos, finalidade, versão e registo temporal.
- `providers`: perfil operacional de prestador individual ou empresa.
- `provider_documents`: metadados e estado de verificação documental; ficheiros em armazenamento privado.
- `service_categories` e `services`: catálogo de serviços.
- `service_areas`: cobertura geográfica.
- `availability`: disponibilidade publicada pelo prestador.
- `bookings`: pedidos e estados de agendamento.
- `payment_records`: referência, método, valor, estado e reconciliação.
- `reviews`: avaliações associadas a serviços concluídos.
- `notifications`: estado de envio de notificações.
- `audit_events`: eventos de auditoria.

Todas as tabelas com dados de utilizadores devem ter identificadores estáveis, datas de criação/actualização e políticas de acesso explícitas. A modelação final deve definir chaves, relações, índices, retenção e políticas RLS antes de qualquer migração.

## Estrutura de repositório proposta

Os caminhos abaixo são propostas, não caminhos já existentes:

```text
/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
├── components/
├── features/
│   ├── auth/
│   ├── families/
│   ├── children/
│   ├── providers/
│   ├── services/
│   ├── bookings/
│   ├── payments/
│   └── administration/
├── lib/
│   ├── supabase/
│   ├── permissions/
│   └── integrations/
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── tests/
├── tests/
├── docs/
│   └── architecture/
└── README.md
```

## Fases de implementação

### Fase 0 — Fundação
Confirmar stack e ambiente Supabase independente; criar aplicação, configuração segura, lint, testes e pipeline de validação.

### Fase 1 — NOVA CORE
Autenticação, perfis, organizações, papéis, relações familiares, consentimentos, auditoria e políticas RLS. Testar isolamento entre organizações e entre famílias.

### Fase 2 — Operação
Cadastro e verificação de prestadores, catálogo, cobertura, disponibilidade e agendamentos.

### Fase 3 — Transacções
Pagamentos híbridos, comissões, reconciliação, notificações e avaliações.

### Fase 4 — Preparação nacional
Observabilidade, backups e recuperação testada, acessibilidade, desempenho, segurança e preparação operacional para expansão nacional.

## Critérios mínimos de aceitação do NOVA CORE

- Um utilizador não autenticado não acede a áreas privadas.
- Um responsável só consulta crianças às quais está autorizado.
- Um prestador só recebe dados de uma criança quando existe um serviço autorizado.
- Um membro de uma organização não acede aos dados de outra organização sem permissão explícita.
- A remoção de uma permissão impede novos acessos sem apagar indevidamente o histórico necessário.
- Operações administrativas sensíveis ficam auditadas.
- Testes automatizados demonstram os casos permitidos e negados das políticas RLS.
- Nenhuma chave secreta é exposta no bundle do cliente ou versionada no Git.

## Decisões ainda necessárias antes de criar a base de dados

1. **Supabase:** criar um projecto Supabase exclusivo para NOVA CUIDAR+ (recomendação para isolamento) ou reutilizar um projecto existente com schema dedicado.
2. **Pagamentos:** definir os meios concretos para pagamentos online e o fluxo de confirmação dos pagamentos manuais em Angola.
3. **Verificação de prestadores:** definir documentos e processo de aprovação, sem assumir requisitos legais não confirmados.
4. **Dados clínicos:** confirmar se a primeira versão apenas gere a prestação/agendamento ou se também terá registos clínicos. A recomendação é manter registos clínicos fora da primeira entrega até existir âmbito, consentimentos e controlos próprios aprovados.

## Limites desta entrega

Este documento não cria tabelas, políticas RLS, utilizadores, buckets, chaves, integrações, deployments nem contas externas. Essas operações serão feitas apenas após confirmação das decisões acima e revisão do desenho de segurança.
