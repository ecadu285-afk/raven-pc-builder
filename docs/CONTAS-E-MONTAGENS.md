# Contas e cinco montagens privadas — implantação

A nova versão usa Supabase Auth + Postgres com Row Level Security (RLS). O GitHub Pages continua hospedando o site e o Raven Market Bot continua cuidando de peças/ofertas; não há servidor de senhas no Pages.

## Para ativar

1. Acesse https://supabase.com/dashboard e crie um projeto Supabase controlado pela Raven Creatives Studios.
2. No painel do Supabase, abra **SQL Editor** e execute o arquivo `supabase/raven_saved_builds.sql` deste repositório. Verifique se a tabela e as três políticas RLS foram criadas.
3. Em **Authentication → Providers → Email**, mantenha o provedor de e-mail habilitado e, preferencialmente, a confirmação de e-mail ativada. Configure o SMTP de produção para entregar e-mails com confiabilidade.
4. Em **Authentication → URL Configuration**, use como Site URL o site definitivo. Autorize nos Redirect URLs `https://ecadu285-afk.github.io/raven-pc-builder/index.html` e o domínio personalizado, se existir.
5. No painel do Supabase, copie **Project URL** e **publishable key** (ou a `anon` legada) em `raven-account-config.js`. É normal que a publishable key fique visível no JavaScript, pois a RLS protege os dados. **Nunca publique secret key ou service_role key.**
6. Faça deploy da branch após configurar o banco, conferir todas as funções e revisar esta política de privacidade e os termos de uso.

### O que o visitante poderá fazer

- Criar uma conta com nome, e-mail e senha, confirmar o e-mail e entrar em outro dispositivo.
- Recuperar a senha pelo e-mail.
- Salvar até **cinco** montagens. O sexto cadastro falha também no banco de dados, inclusive se o usuário abrir duas abas.
- Carregar e excluir suas próprias montagens. Montagens de contas diferentes são isoladas pela RLS.
- Exportar montagens em JSON e importá-las (respeitando as cinco vagas).
- Importar, sob ação explícita do usuário, até as vagas disponíveis de montagens antigas salvas neste navegador. A garagem antiga não é apagada automaticamente.
- Continuar montando e compartilhando um PC sem entrar; salvar na conta requer login.

### Testes obrigatórios antes de publicar

1. Crie duas contas distintas (A e B). Salve uma montagem em A e confirme que B não consegue listá-la ou excluí-la.
2. Salve cinco montagens em A. Tente salvar a sexta pelo site e por chamada direta à API com o token de A; ambos devem falhar. Depois exclua uma e salve outra.
3. Entre em A num segundo navegador e confirme que as cinco montagens aparecem. Saia e confirme que a lista privada some.
4. Teste o cadastro, confirmação de e-mail, recuperação de senha e as URLs de redirecionamento.
5. Teste importação de montagens antigas, exportação e importação JSON, com cinco vagas e importação parcial.
6. Confirme que montador 3D, estimativa de ofertas, compartilhamento e Market Bot não foram afetados.
7. Verifique responsividade em celular e revise requisitos de privacidade, retenção e atendimento de solicitações LGPD.

### Segurança

O GitHub Pages não hospeda senhas. O Supabase Auth as administra. A tabela `public.raven_saved_builds` só concede `select`, `insert` e `delete` aos usuários autenticados, protegida por políticas que comparam `auth.uid()` com `user_id`. Um trigger no Postgres impõe o limite de cinco inserções por usuário.

Contas e banco **não estarão funcionais** enquanto os passos 1–5 não forem aplicados. A interface deve informar que o cadastro ainda não está ativado. Não publique como recurso pronto antes dos testes.
