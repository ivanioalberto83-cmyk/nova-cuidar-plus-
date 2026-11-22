# NOVA CUIDAR+ — Módulo de Cuidadores e Prestadores

## Objectivo

Permitir o registo nacional de prestadores de cuidados infantis em Angola, tanto individuais como organizações, mantendo a publicação bloqueada até à verificação e aprovação administrativa.

Este documento define a primeira entrega técnica. Não constitui parecer jurídico nem determina, por si só, quais documentos são legalmente obrigatórios.

## Tipos de prestador

### 1. Cuidador individual
- Nome de apresentação e nome legal.
- Contactos verificados (email e telefone).
- Província, município e zonas de atendimento.
- Experiência profissional e breve apresentação.
- Formação e qualificações relevantes.
- Serviços que pretende prestar e faixas etárias com que tem experiência.
- Disponibilidade e modalidade de prestação (domicílio, instalações do prestador ou outro local acordado).
- Referências profissionais, quando aplicável.

### 2. Organização prestadora
- Denominação legal e nome comercial.
- Tipo de organização e descrição.
- NIF e dados de registo comercial, quando aplicáveis.
- Sede, contactos e áreas de operação.
- Pessoa representante e contacto institucional.
- Serviços disponibilizados.
- Lista de profissionais associados, numa fase posterior, com adesão individual e permissões próprias.

## Fluxo de registo e aprovação

1. O prestador cria uma conta e confirma o email.
2. Escolhe individual ou organização.
3. Preenche o perfil e aceita os documentos legais publicados na plataforma.
4. Carrega apenas os documentos solicitados para o seu tipo de prestador.
5. O pedido fica em estado submitted e deixa de poder alterar os campos/documentos submetidos enquanto decorre a análise, salvo quando a equipa administrativa solicita correcções.
6. A equipa de verificação analisa o perfil e cada documento.
7. O pedido termina em approved, changes_requested ou rejected.
8. Apenas um prestador com estado approved e perfil completo pode ser apresentado às famílias.
9. Uma aprovação pode ser suspensa posteriormente por decisão administrativa fundamentada e registada.

## Estados propostos

### Estado do pedido
- draft: registo iniciado, ainda não submetido.
- submitted: submetido para análise.
- under_review: em análise administrativa.
- changes_requested: necessita de correcções ou documentos adicionais.
- approved: aprovado e elegível para publicação.
- rejected: rejeitado, com motivo registado.
- suspended: aprovação suspensa.

### Estado de cada documento
- pending: carregado, ainda não analisado.
- verified: validado.
- rejected: não aceite, com motivo.
- expired: expirado, quando existir validade aplicável.

O estado do perfil nunca deve ser alterável pelo próprio prestador. O utilizador pode editar um rascunho; alterações relevantes após aprovação devem gerar nova revisão antes de continuarem públicas.

## Documentos: catálogo inicial configurável

Os tipos abaixo são sugestões para análise, não uma lista legal definitiva:
- Identificação do titular/representante.
- Registo criminal ou comprovativo equivalente, se aplicável e juridicamente admissível.
- Certificados de formação/qualificação.
- Referências ou comprovativos de experiência.
- Para organizações: comprovativo de constituição/registo, NIF e identificação do representante.
- Outros documentos solicitados pela equipa, com justificação e finalidade.

Não recolher números completos de documentos em campos livres se não forem indispensáveis. Preferir guardar o ficheiro privado, tipo, estado, data de validade quando aplicável e referência interna. Não recolher dados clínicos de crianças nem documentos de crianças nesta etapa.

## Modelo de dados proposto

A implementação deverá usar tabelas próprias, sem transformar nova_profiles.account_status num estado de aprovação profissional.

- nova_provider_profiles: perfil de prestador, tipo individual/organização, proprietário, organização opcional, dados profissionais mínimos, localização, serviços e estado de revisão.
- nova_provider_service_areas: província/município e área de atendimento, quando a pesquisa geográfica for implementada.
- nova_provider_documents: metadados dos documentos, proprietário, tipo, caminho privado no Storage, estado, validade e referência da revisão.
- nova_provider_reviews: decisões administrativas, revisor, data, motivo/código e versão do pedido analisado.
- nova_provider_services: catálogo de serviços disponibilizados pelo prestador, com descrições controladas.

As organizações existentes em nova_organizations devem ser reutilizadas; não criar uma segunda tabela de organizações. Um prestador individual liga-se directamente a auth.users; um prestador organizacional liga-se à organização e ao utilizador representante.

## Segurança e privacidade obrigatórias

- RLS em todas as novas tabelas expostas.
- Nenhum prestador pode consultar ou alterar perfis, documentos ou decisões de outros prestadores.
- Os documentos de identificação e qualificação ficam num bucket privado do Supabase Storage.
- O caminho de cada ficheiro deve incluir o UUID do proprietário; as políticas devem validar simultaneamente bucket, proprietário e relação com o registo.
- Não permitir listagem pública, URLs permanentes públicas nem acesso por anon.
- Uploads limitados a MIME types e tamanho definidos; validar também no servidor o tipo real do ficheiro.
- Upsert só se for realmente necessário; caso seja usado, as políticas têm de contemplar SELECT e UPDATE além de INSERT.
- Nunca confiar em user_metadata para conceder privilégios administrativos.
- A aprovação, rejeição, suspensão e acesso administrativo a documentos devem acontecer em operações server-side com autorização baseada em dados confiáveis, nunca num botão que actualiza directamente o estado pelo cliente.
- Registar cada decisão em auditoria sem copiar números de identificação, conteúdo de documentos, tokens ou outros dados sensíveis para os metadados.
- O acesso administrativo deve ser de privilégio mínimo e limitado a pessoal autorizado.
- Não activar uploads nem recolher documentos reais até o aviso de privacidade, termos, fundamento e prazos de conservação estarem aprovados.

## Painel administrativo

A fila de verificação deverá permitir:
- Filtrar por estado, tipo de prestador, província e data de submissão.
- Consultar os dados do pedido.
- Abrir documentos através de acesso temporário e autorizado.
- Marcar cada documento como verificado ou rejeitado.
- Pedir correcções com motivo claro.
- Aprovar, rejeitar ou suspender o perfil.
- Consultar histórico de decisões e auditoria.
- Exportar indicadores agregados, sem exportar documentos pessoais em massa.

## Critérios de aceitação

- Registo individual e organizacional em fluxos distintos.
- O estado inicial é sempre draft ou submitted, nunca approved.
- Um utilizador não consegue alterar o estado de aprovação nem consultar pedidos alheios.
- Um pedido incompleto não pode ser submetido.
- Um pedido com documentos pendentes não pode ser aprovado.
- Apenas perfis aprovados aparecem na pesquisa pública.
- Todas as decisões administrativas ficam associadas a um revisor e a um registo de auditoria.
- Os documentos permanecem privados e não são acessíveis sem autorização.
- Os testes cobrem duas contas de prestadores diferentes e uma conta administrativa autorizada.

## Sequência de implementação

1. Criar a migração de dados e políticas RLS, depois de revisão técnica.
2. Criar o bucket privado e as políticas de Storage.
3. Implementar o registo e edição de rascunhos para individuais e organizações.
4. Implementar submissão e carregamento seguro de documentos.
5. Implementar a fila administrativa e decisões server-side.
6. Implementar pesquisa pública apenas para prestadores aprovados.
7. Testar isolamento, permissões, uploads, estados e auditoria antes de qualquer publicação.

## Limites da etapa actual

A fundação NOVA CORE já existente foi auditada em modo de leitura. Este documento não cria tabelas, buckets, políticas, utilizadores, nem altera o projecto Supabase. A implementação de dados e uploads deverá ocorrer através de migrações versionadas, com revisão e verificação antes de aplicar alterações no projecto alojado.
