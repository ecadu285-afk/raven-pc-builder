/* Raven Academy - player de Google Drive com progresso local.
   Não lê dados do usuário nem exige login. Conclusão é manual. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = $('rvaAcademy');
  if (!root) return;
  const elements = {
    frame: $('rvaVideo'),
    fallback: $('rvaFallback'),
    list: $('rvaList'),
    title: $('rvaCurrentTitle'),
    description: $('rvaCurrentDescription'),
    count: $('rvaCount'),
    status: $('rvaStatus'),
    progress: $('rvaProgress'),
    progressText: $('rvaProgressText'),
    open: $('rvaOpen'),
    previous: $('rvaPrev'),
    next: $('rvaNext'),
    complete: $('rvaComplete'),
  };
  const progressKey = 'raven-academy-videoaulas-completas-v1';
  const activeKey = 'raven-academy-videoaula-atual-v1';
  const safeRead = key => { try { return localStorage.getItem(key); } catch { return null; } };
  const safeWrite = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  let completed = {};
  try {
    const value = JSON.parse(safeRead(progressKey) || '{}');
    if (value && typeof value === 'object' && !Array.isArray(value)) completed = value;
  } catch {}
  let lessons = [];
  let activeIndex = 0;

  function driveId(input) {
    try {
      const url = new URL(input);
      if (url.protocol !== 'https:' || url.hostname !== 'drive.google.com' ||
          url.username || url.password || url.port) return null;
      const found = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]{20,})\/view\/?$/);
      return found ? found[1] : null;
    } catch { return null; }
  }
  function makeLesson(data) {
    if (!data || typeof data.id !== 'string' || !/^[a-z0-9-]+$/.test(data.id)) return null;
    const fileId = driveId(data.driveUrl);
    if (!fileId) return null;
    return {
      id: data.id,
      title: typeof data.title === 'string' ? data.title.slice(0, 100) : 'Videoaula',
      description: typeof data.description === 'string' ? data.description.slice(0, 300) : '',
      viewUrl: 'https://drive.google.com/file/d/' + fileId + '/view',
      embedUrl: 'https://drive.google.com/file/d/' + fileId + '/preview',
    };
  }
  function updateProgress() {
    const done = lessons.filter(item => completed[item.id] === true).length;
    const percent = lessons.length ? Math.round(done / lessons.length * 100) : 0;
    elements.progress.style.width = percent + '%';
    elements.progressText.textContent = done + ' de ' + lessons.length + ' aulas concluídas';
    elements.progress.parentElement.setAttribute('aria-valuenow', String(percent));
  }
  function renderList() {
    elements.list.replaceChildren();
    lessons.forEach((lesson, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rva-lesson';
      button.setAttribute('aria-current', index === activeIndex ? 'true' : 'false');
      const number = document.createElement('span');
      number.className = 'rva-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const content = document.createElement('span');
      content.className = 'rva-lesson-text';
      const title = document.createElement('strong');
      title.textContent = lesson.title;
      const subtitle = document.createElement('small');
      subtitle.textContent = completed[lesson.id] === true ? 'Concluída' : 'Assistir aula';
      content.append(title, subtitle);
      button.append(number, content);
      if (completed[lesson.id] === true) {
        const icon = document.createElement('span');
        icon.className = 'rva-done';
        icon.textContent = '✓';
        icon.setAttribute('aria-label', 'Concluída');
        button.append(icon);
      }
      button.addEventListener('click', () => selectLesson(index));
      elements.list.append(button);
    });
  }
  function selectLesson(index) {
    if (!lessons.length || index < 0 || index >= lessons.length) return;
    activeIndex = index;
    const current = lessons[activeIndex];
    safeWrite(activeKey, current.id);
    elements.frame.title = 'Raven Academy: ' + current.title;
    // Atualizar somente após selecionar evita carregar múltiplos players ao mesmo tempo.
    if (elements.frame.getAttribute('src') !== current.embedUrl) {
      elements.frame.setAttribute('src', current.embedUrl);
    }
    elements.fallback.hidden = true;
    elements.title.textContent = current.title;
    elements.description.textContent = current.description;
    elements.open.href = current.viewUrl;
    elements.previous.disabled = activeIndex === 0;
    elements.next.disabled = activeIndex === lessons.length - 1;
    elements.complete.textContent = completed[current.id] ? '✓ Aula concluída · desfazer' : 'Marcar como concluída';
    elements.complete.setAttribute('aria-pressed', completed[current.id] === true ? 'true' : 'false');
    elements.status.textContent = 'Aula ' + (activeIndex + 1) + ' de ' + lessons.length + '.';
    updateProgress();
    renderList();
  }
  elements.previous.addEventListener('click', () => selectLesson(activeIndex - 1));
  elements.next.addEventListener('click', () => selectLesson(activeIndex + 1));
  elements.complete.addEventListener('click', () => {
    if (!lessons.length) return;
    const id = lessons[activeIndex].id;
    if (completed[id] === true) delete completed[id];
    else completed[id] = true;
    safeWrite(progressKey, JSON.stringify(completed));
    selectLesson(activeIndex);
    elements.status.textContent = completed[id] === true
      ? 'Aula marcada como concluída neste navegador.'
      : 'Conclusão desmarcada neste navegador.';
  });
  async function loadLessons() {
    try {
      const response = await fetch('./academy-lessons.json', {cache: 'no-store'});
      if (!response.ok) throw new Error('Não foi possível carregar a lista de aulas');
      const data = await response.json();
      if (!data || !Array.isArray(data.lessons)) throw new Error('Lista de aulas inválida');
      const used = new Set();
      lessons = data.lessons.map(makeLesson).filter(item => {
        if (!item || used.has(item.id)) return false;
        used.add(item.id);
        return true;
      });
      if (!lessons.length) throw new Error('Não há videoaulas configuradas');
      elements.count.textContent = lessons.length + (lessons.length === 1 ? ' aula' : ' aulas');
      const savedId = safeRead(activeKey);
      const savedIndex = lessons.findIndex(item => item.id === savedId);
      const firstIncomplete = lessons.findIndex(item => completed[item.id] !== true);
      selectLesson(savedIndex >= 0 ? savedIndex : firstIncomplete >= 0 ? firstIncomplete : 0);
    } catch (error) {
      elements.fallback.hidden = false;
      elements.frame.removeAttribute('src');
      elements.status.textContent = 'As aulas não carregaram. Atualize a página ou tente novamente mais tarde.';
      elements.count.textContent = 'Aulas indisponíveis';
      elements.title.textContent = 'Não foi possível carregar as videoaulas';
      elements.description.textContent = 'O laboratório 3D abaixo continua disponível.';
      elements.open.hidden = true;
      elements.previous.disabled = true;
      elements.next.disabled = true;
      elements.complete.disabled = true;
    }
  }
  loadLessons();
})();
