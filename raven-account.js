import {
  RAVEN_SUPABASE_URL,
  RAVEN_SUPABASE_PUBLISHABLE_KEY
} from './raven-account-config.js';

// Cliente no navegador: SOMENTE a chave pública. A RLS do banco isola as contas.
let supabaseClient = null;
let accountUser = null;
let openDialog = () => {};
let setMessage = () => {};
let onAccountChange = () => {};

export const ravenAccountConfigured = () =>
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(RAVEN_SUPABASE_URL.trim()) &&
  Boolean(RAVEN_SUPABASE_PUBLISHABLE_KEY.trim());
export const ravenGetAccount = () => accountUser;
export const ravenGetSupabaseClient = () => supabaseClient;
export const ravenOpenAccount = () => openDialog();

function ravenAccountError(error) {
  const msg = String(error?.message || error || '');
  if (/invalid login credentials/i.test(msg)) return 'E-mail ou senha incorretos.';
  if (/email not confirmed/i.test(msg)) return 'Confirme o e-mail antes de entrar.';
  if (/password should be at least/i.test(msg)) return 'A senha precisa ter pelo menos 8 caracteres.';
  if (/user already registered/i.test(msg)) return 'Este e-mail já possui cadastro. Entre na conta.';
  if (/rate limit|too many requests/i.test(msg)) return 'Muitas tentativas. Tente novamente mais tarde.';
  if (/limite de cinco|23514/i.test(msg)) return 'Limite de cinco montagens. Exclua uma antes de salvar.';
  return 'Não foi possível concluir a operação. Confira sua conexão ou tente novamente.';
}

export async function ravenListBuilds() {
  if (!supabaseClient || !accountUser) throw Error('Faça login para acessar suas montagens.');
  const { data, error } = await supabaseClient
    .from('raven_saved_builds')
    .select('id,name,parts,created_at')
    .eq('user_id', accountUser.id)
    .order('created_at', { ascending: false });
  if (error) throw Error(ravenAccountError(error));
  return Array.isArray(data) ? data : [];
}

export async function ravenSaveBuild(name, parts) {
  if (!supabaseClient || !accountUser) throw Error('Faça login para salvar seu PC.');
  const { error } = await supabaseClient
    .from('raven_saved_builds')
    .insert({ user_id: accountUser.id, name: name.slice(0, 55), parts });
  if (error) throw Error(ravenAccountError(error));
}

export async function ravenDeleteBuild(id) {
  if (!supabaseClient || !accountUser) throw Error('Faça login para excluir sua montagem.');
  const { error } = await supabaseClient
    .from('raven_saved_builds')
    .delete()
    .eq('user_id', accountUser.id)
    .eq('id', id);
  if (error) throw Error(ravenAccountError(error));
}

function loadSupabaseSdk() {
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Distribuição UMD oficial para sites estáticos, versão principal v2.
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.async = true;
    script.onload = () => window.supabase?.createClient
      ? resolve(window.supabase)
      : reject(Error('SDK indisponível'));
    script.onerror = () => reject(Error('Falha ao carregar autenticação'));
    document.head.append(script);
  });
}

export async function ravenInitAccount({ onChange } = {}) {
  onAccountChange = typeof onChange === 'function' ? onChange : () => {};
  const dialog = document.createElement('dialog');
  dialog.className = 'raven-account-dialog';
  dialog.setAttribute('aria-labelledby', 'raTitle');
  dialog.innerHTML = `
    <button class="ra-close" id="raClose" type="button" aria-label="Fechar">×</button>
    <h2 id="raTitle">Sua conta Raven</h2>
    <p id="raDescription">Salve e retome até cinco PCs, em qualquer dispositivo.</p>
    <p class="ra-message" id="raMessage" role="status" aria-live="polite"></p>
    <div id="raSigned" hidden>
      <p id="raWelcome"></p>
      <button id="raSignOut" class="ra-primary" type="button">Sair da conta</button>
    </div>
    <form id="raForm" autocomplete="on">
      <label id="raNameRow" hidden>Seu nome
        <input id="raName" name="name" maxlength="70" autocomplete="name" placeholder="Como quer ser chamado?">
      </label>
      <label id="raEmailRow">E-mail
        <input id="raEmail" type="email" name="email" required maxlength="200" autocomplete="email" placeholder="voce@exemplo.com">
      </label>
      <label id="raPasswordRow">Senha
        <input id="raPassword" name="password" type="password" minlength="8" required autocomplete="current-password" placeholder="Mínimo de 8 caracteres">
      </label>
      <button id="raSubmit" class="ra-primary" type="submit">Entrar</button>
    </form>
    <div id="raActions" class="ra-actions">
      <button id="raToggle" type="button">Criar minha conta</button>
      <button id="raForgot" type="button">Esqueci minha senha</button>
    </div>
    <p class="ra-footnote">Suas montagens são privadas. Compartilhar um link do PC é uma ação separada.
      <a href="privacidade.html">Privacidade</a>.</p>
  `;
  document.body.append(dialog);
  const el = id => dialog.querySelector('#' + id);
  const loginButton = document.getElementById('accountOpen');
  let mode = 'login';
  let busy = false;
  let configured = false;

  setMessage = (msg, isError = false) => {
    el('raMessage').textContent = msg;
    el('raMessage').dataset.error = String(isError);
  };
  const show = () => {
    if (!dialog.open) {
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    }
    el('raEmail').focus();
  };
  openDialog = show;
  const setMode = (nextMode) => {
    mode = nextMode;
    setMessage('');
    const signup = mode === 'signup', forgot = mode === 'forgot', reset = mode === 'recovery';
    el('raNameRow').hidden = !signup;
    el('raEmailRow').hidden = reset;
    el('raEmail').required = !reset;
    el('raPasswordRow').hidden = forgot;
    el('raPassword').required = !forgot;
    el('raPassword').setAttribute('autocomplete', reset ? 'new-password' : signup ? 'new-password' : 'current-password');
    el('raSubmit').textContent = signup ? 'Criar conta' : forgot ? 'Enviar recuperação' : reset ? 'Alterar minha senha' : 'Entrar';
    el('raTitle').textContent = signup ? 'Criar conta Raven' : forgot ? 'Recuperar senha' : reset ? 'Definir nova senha' : 'Sua conta Raven';
    el('raToggle').textContent = signup || forgot ? 'Já tenho conta' : 'Criar minha conta';
    el('raForgot').hidden = forgot || reset;
    if (!reset) el('raPassword').value = '';
    paint();
  };
  function paint() {
    const signed = Boolean(accountUser);
    el('raSigned').hidden = !signed || mode === 'recovery';
    el('raForm').hidden = (signed && mode !== 'recovery') || !configured;
    el('raActions').hidden = signed || !configured || mode === 'recovery';
    el('raWelcome').textContent = signed
      ? 'Conectado como ' + (accountUser.user_metadata?.full_name || accountUser.email || 'usuário Raven') + '.'
      : '';
    if (loginButton) loginButton.textContent = signed ? 'Minha conta' : 'Entrar / Criar conta';
    const pill = document.getElementById('accountPill');
    if (pill) pill.textContent = signed ? 'Conta conectada · 5 vagas privadas' : 'Conta privada · até 5 PCs';
  }

  loginButton?.addEventListener('click', () => { if (!accountUser) setMode('login'); show(); });
  el('raClose').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (ev) => { if (ev.target === dialog) dialog.close(); });
  el('raToggle').addEventListener('click', () => setMode(mode === 'login' ? 'signup' : 'login'));
  el('raForgot').addEventListener('click', () => setMode('forgot'));
  el('raSignOut').addEventListener('click', async () => {
    if (!supabaseClient || busy) return;
    busy = true;
    const { error } = await supabaseClient.auth.signOut();
    busy = false;
    if (error) setMessage(ravenAccountError(error), true);
    else { accountUser = null; setMode('login'); paint(); onAccountChange(); dialog.close(); }
  });
  el('raForm').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    if (!supabaseClient || busy) return;
    const email = el('raEmail').value.trim().toLowerCase();
    const password = el('raPassword').value;
    const name = el('raName').value.trim();
    if (mode === 'signup' && name.length < 2) { setMessage('Informe um nome com pelo menos 2 caracteres.', true); return; }
    if (!['forgot'].includes(mode) && password.length < 8) { setMessage('A senha deve ter pelo menos 8 caracteres.', true); return; }
    busy = true;
    el('raSubmit').disabled = true;
    setMessage('Processando...');
    try {
      let result;
      if (mode === 'signup') {
        result = await supabaseClient.auth.signUp({
          email, password,
          options: {
            data: { full_name: name },
            emailRedirectTo: location.origin + location.pathname
          }
        });
        if (result.error) throw result.error;
        if (!result.data.session) setMessage('Cadastro solicitado. Verifique seu e-mail para confirmar a conta e depois entre.');
        else { setMessage('Conta criada!'); dialog.close(); }
      } else if (mode === 'login') {
        result = await supabaseClient.auth.signInWithPassword({ email, password });
        if (result.error) throw result.error;
        setMessage('Login realizado.');
        dialog.close();
      } else if (mode === 'forgot') {
        result = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: location.origin + location.pathname
        });
        if (result.error) throw result.error;
        setMessage('Se este e-mail estiver cadastrado, você receberá instruções para recuperar a senha.');
      } else {
        result = await supabaseClient.auth.updateUser({ password });
        if (result.error) throw result.error;
        setMode('login');
        setMessage('Senha alterada. Você já está conectado.');
      }
    } catch (error) {
      setMessage(ravenAccountError(error), true);
    } finally {
      busy = false;
      el('raSubmit').disabled = false;
    }
  });

  configured = ravenAccountConfigured();
  paint();
  const accountLinkMode = new URLSearchParams(location.search).get('conta');
  // A tela premium de primeira visita recebe os links ?conta=...
  // Não abra um segundo modal de login por cima dela.
  if (!document.getElementById('raven-entry')) {
    if (accountLinkMode === 'cadastro') { setMode('signup'); show(); }
    else if (accountLinkMode === '1') show();
  }
  if (!configured) {
    setMessage('Cadastro em preparação: falta conectar o serviço de contas e aplicar as regras do banco de dados.', true);
    onAccountChange();
    return;
  }
  try {
    const sdk = await loadSupabaseSdk();
    supabaseClient = sdk.createClient(RAVEN_SUPABASE_URL, RAVEN_SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    supabaseClient.auth.onAuthStateChange((event, session) => {
      accountUser = session?.user || null;
      if (event === 'PASSWORD_RECOVERY') {
        setMode('recovery');
        show();
      }
      // INITIAL_SESSION pode conter usuário nulo ao abrir a página.
      // Não substitua a tela "Criar conta" escolhida pelo visitante.
      paint();
      window.dispatchEvent(new Event('raven-auth-ready'));
      // Consultas à API só depois que o callback de Auth retornar.
      queueMicrotask(() => onAccountChange());
    });
    const { data, error } = await supabaseClient.auth.getUser();
    if (error && !/auth session missing/i.test(error.message || '')) throw error;
    accountUser = data?.user || null;
    paint();
    window.dispatchEvent(new Event('raven-auth-ready'));
    await onAccountChange();
  } catch (error) {
    setMessage('Não foi possível conectar ao serviço de contas. Verifique a configuração.', true);
    configured = false;
    paint();
    onAccountChange();
  }
}
