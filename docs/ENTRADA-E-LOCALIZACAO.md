# Raven PC Builder — entrada, vitrine premium e localização por permissão

## O que mudou
- Tela de boas-vindas em tela cheia para a primeira visita à página inicial (`inicio.html`) **e** ao endereço raiz (`index.html`), com opção Entrar, Criar conta, Recuperar senha e Continuar como visitante.
- Conta compartilhada com a estrutura anterior de Supabase Auth; token de sessão fica persistido pelo SDK no navegador. Não existe campo nem banco próprio para guardar senha em texto.
- Visitante pode explorar as ofertas sem login; guardar cinco PCs, listas de compra e salvos exige uma conta.
- Página inicial original da Raven com estilo moderno de varejo de tecnologia, categorias, busca, ofertas do catálogo e atalhos.
- Vitrine do catálogo refinada, sem anúncios fictícios nem preços de frete inventados.
- Localização opcional: após o clique e **somente após consentimento do navegador**, a posição atual é consultada diretamente no endpoint client-side de geocodificação reversa BigDataCloud. A Raven não persiste nem recebe latitude/longitude.
- Cidade e CEP sugeridos podem ser imprecisos ou não disponíveis. O usuário confirma manualmente o CEP na página Minha conta, apertando "Salvar CEP" para persistir **apenas o CEP** no Supabase.

## Limites importantes
- As compras do catálogo são feitas em sites externos. Carrinho é uma lista de interesse, não uma compra efetuada.
- O serviço gratuito de geocodificação é de terceiros e depende de autorização, navegador compatível e conexão. Com localização negada, o usuário informa CEP manualmente.
- Frete/prazo devem ser calculados na loja externa, não no Raven.
- Nada imita marcas, logotipos ou textos de concorrentes; somente um padrão de usabilidade de loja online.

## Testes obrigatórios
1. Acesse o endereço raiz sem sessão (ou em janela anônima): tela de entrada aparece.
2. Clique em "Continuar como visitante": catálogo funciona, mas as ações de salvar solicitam login.
3. Crie conta nova, confirme e-mail, entre e atualize. O acesso deve continuar sem pedir senha novamente.
4. Acesse `inicio.html` e `index.html` já conectado: não deve aparecer tela de login.
5. Teste o fluxo "Esqueci minha senha"; a recuperação continua no formulário existente.
6. Teste localização primeiro negando a permissão, depois aceitando, e confira o aviso. Valide manualmente o CEP sugerido.
7. Salve o CEP em Minha conta, entre em outro navegador e confirme o valor persistido. Verifique que a tabela só retorna o CEP do dono.
8. Teste em mobile o cabeçalho, cards, 3D, carrinho e avaliações.

## Segurança e privacidade
O projeto usa as políticas RLS já existentes no Supabase para listas, perfis, avaliações e montagens. Nenhuma credencial secreta foi adicionada ao front-end. O serviço BigDataCloud recebe a coordenada atual apenas sob ação explícita do visitante e não é chamado pelo servidor.
