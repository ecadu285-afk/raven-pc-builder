/* Navegação e indicadores da Raven Academy. Não altera o estado dos cursos. */
(() => {
  'use strict';
  const nav = document.getElementById('rvaTabs');
  if (!nav) return;
  const tabs = [
    {name: 'videos', button: document.getElementById('rvaTabVideos'), panel: document.getElementById('rvaPanelVideos')},
    {name: 'lab', button: document.getElementById('rvaTabLab'), panel: document.getElementById('rvaPanelLab')},
    {name: 'quiz', button: document.getElementById('rvaTabQuiz'), panel: document.getElementById('rvaPanelQuiz')}
  ];
  const tabByName = new Map(tabs.map(tab => [tab.name, tab]));
  const storage = {
    videos: 'raven-academy-videoaulas-completas-v1',
    lab: 'raven-academy-lab-praticas-v1',
    quiz: 'raven-academy-pc-basico-v2'
  };
  const totals = {videos: 10, lab: 4, quiz: 4};
  const rememberedTab = 'raven-academy-trilha-selecionada-v1';
  function read(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }
  function getHashTab(hash) {
    if (hash === '#videoaulas' || hash === '#rvaPanelVideos') return 'videos';
    if (hash === '#laboratorio3d' || hash === '#rvaPanelLab') return 'lab';
    if (hash === '#exercicios' || hash === '#rvaPanelQuiz') return 'quiz';
    return null;
  }
  function activate(name, focusTab = false) {
    const active = tabByName.get(name);
    if (!active) return;
    for (const tab of tabs) {
      const selected = tab === active;
      tab.button.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.button.tabIndex = selected ? 0 : -1;
      tab.panel.hidden = !selected;
    }
    write(rememberedTab, name);
    if (focusTab) active.button.focus();
    document.dispatchEvent(new CustomEvent('ravenAcademyTab', {detail: {name}}));
  }
  function counts(key, total) {
    let parsed = {};
    try {
      const raw = JSON.parse(read(key) || '{}');
      if (raw && typeof raw === 'object' && !Array.isArray(raw)) parsed = raw;
    } catch {}
    return Math.min(total, Object.values(parsed).filter(v => v === true).length);
  }
  function renderProgress() {
    for (const name of Object.keys(totals)) {
      const total = totals[name];
      const done = counts(storage[name], total);
      const count = document.getElementById('rvaStat' + name);
      const bar = document.getElementById('rvaStatBar' + name);
      if (count) count.textContent = done + ' / ' + total;
      if (bar) bar.style.width = Math.round(done / total * 100) + '%';
    }
  }
  tabs.forEach((tab, index) => {
    tab.button.addEventListener('click', () => {
      activate(tab.name);
      // Hash identifica a seção para links diretos e retorno de navegação.
      const urlHash = tab.name === 'videos' ? '#videoaulas' : tab.name === 'lab' ? '#laboratorio3d' : '#exercicios';
      history.replaceState(null, '', urlHash);
    });
    tab.button.addEventListener('keydown', e => {
      let destination = index;
      if (e.key === 'ArrowRight') destination = (index + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') destination = (index - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') destination = 0;
      else if (e.key === 'End') destination = tabs.length - 1;
      else return;
      e.preventDefault();
      tabs[destination].button.click();
      tabs[destination].button.focus();
    });
  });
  window.addEventListener('hashchange', () => {
    const name = getHashTab(location.hash);
    if (name) activate(name);
  });
  // Se o link for um conteúdo da aba, revelá-la antes do scroll inicial.
  activate(getHashTab(location.hash) || (tabByName.has(read(rememberedTab)) ? read(rememberedTab) : 'videos'));
  window.addEventListener('storage', renderProgress);
  window.addEventListener('ravenAcademyProgress', renderProgress);
  renderProgress();
})();
