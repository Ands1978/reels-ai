(() => {
  const style = document.createElement('style');
  style.textContent = `
    #raTools{position:fixed;right:14px;bottom:14px;z-index:9999;display:flex;flex-direction:column;align-items:flex-end;gap:8px;font-family:Inter,system-ui,sans-serif}
    #raToolsToggle{border:1px solid #4a3a69;background:rgba(20,16,31,.96);color:#fff;border-radius:999px;padding:9px 12px;font-weight:900;font-size:11px;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer}
    #raToolsPanel{width:min(360px,calc(100vw - 28px));max-height:min(66vh,520px);overflow:auto;background:rgba(13,13,20,.98);border:1px solid #383545;border-radius:16px;padding:11px;box-shadow:0 20px 60px rgba(0,0,0,.5);display:none}
    #raToolsPanel.open{display:block}
    .raTabs{display:flex;gap:6px;margin-bottom:8px}.raTab{flex:1;background:#24232e;border:1px solid #353442;color:#aaa;padding:8px;border-radius:9px;font-weight:900;font-size:10px;cursor:pointer}.raTab.active{background:#7b4bd4;color:#fff;border-color:#9b6bef}
    .raSearch{display:flex;gap:6px}.raSearch input{flex:1;background:#08080d;color:#fff;border:1px solid #383844;border-radius:9px;padding:9px;font:inherit;font-size:12px}.raSearch button{padding:9px 11px}
    .raFilters{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0}.raFilters select{padding:8px;font-size:10px}
    .raGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.raItem{position:relative;aspect-ratio:3/4;background:#09090e;border:1px solid #30303b;border-radius:8px;overflow:hidden;cursor:pointer}.raItem img{width:100%;height:100%;object-fit:cover}.raItem span{position:absolute;left:4px;right:4px;bottom:4px;background:rgba(0,0,0,.7);border-radius:5px;padding:3px;font-size:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.raLoading,.raEmpty{font-size:10px;color:#92929e;text-align:center;padding:16px}.raPager{display:flex;gap:6px;margin-top:8px}.raPager button{flex:1;padding:8px;background:#262631}.raCredit{font-size:9px;color:#777783;margin-top:7px}.raColors{display:grid;grid-template-columns:repeat(6,1fr);gap:7px}.raColor{height:34px;border-radius:8px;border:1px solid #555;cursor:pointer}.raColor.active{outline:2px solid #fff;outline-offset:1px}
    @media(max-width:720px){#raTools{right:8px;bottom:8px}.raGrid{grid-template-columns:repeat(3,1fr)}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'raTools';
  root.innerHTML = `
    <div id="raToolsPanel">
      <div class="raTabs"><button class="raTab active" data-tab="pixabay">🖼️ Pixabay</button><button class="raTab" data-tab="colors">🎨 Cores</button></div>
      <div id="raPixabayView">
        <div class="raSearch"><input id="raPixabayQuery" placeholder="Buscar imagens…"><button id="raPixabayGo">Buscar</button></div>
        <div class="raFilters"><select id="raOrientation"><option value="vertical">Vertical 9:16</option><option value="horizontal">Horizontal</option></select><select id="raColor"><option value="">Todas as cores</option><option value="red">Vermelho</option><option value="orange">Laranja</option><option value="yellow">Amarelo</option><option value="green">Verde</option><option value="blue">Azul</option><option value="pink">Rosa</option><option value="purple">Lilás</option><option value="white">Branco</option><option value="black">Preto</option><option value="brown">Marrom</option><option value="grayscale">Cinza</option></select></div>
        <div id="raPixabayResults" class="raGrid"><div class="raEmpty">Digite um tema para buscar imagens gratuitas.</div></div>
        <div class="raPager"><button id="raPrev">← Anterior</button><button id="raNext">Próxima →</button></div>
        <div class="raCredit">Imagens: Pixabay. A seleção mostra a origem e baixa a mídia para o editor.</div>
      </div>
      <div id="raColorsView" style="display:none"><div class="raColors"></div><div class="raCredit">Escolha a cor da legenda do Reel ativo.</div></div>
    </div>
    <button id="raToolsToggle">🖼️ Pixabay · 🎨 Cores</button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector('#raToolsPanel');
  const toggle = root.querySelector('#raToolsToggle');
  const results = root.querySelector('#raPixabayResults');
  let page = 1;
  let lastQuery = '';

  toggle.onclick = () => panel.classList.toggle('open');
  root.querySelectorAll('.raTab').forEach(tab => tab.onclick = () => {
    root.querySelectorAll('.raTab').forEach(t => t.classList.toggle('active', t === tab));
    root.querySelector('#raPixabayView').style.display = tab.dataset.tab === 'pixabay' ? '' : 'none';
    root.querySelector('#raColorsView').style.display = tab.dataset.tab === 'colors' ? '' : 'none';
    if (tab.dataset.tab === 'colors') renderColors();
  });

  const colors = ['#ffffff','#ffd54a','#55d6ff','#ff6fb5','#ff5d5d','#65e572','#9b5cff','#ff9f43','#111111','#b9b9c4','#00d4a8','#ff7aa2'];
  function renderColors(){
    root.querySelector('.raColors').innerHTML = colors.map(c => `<button class="raColor" title="${c}" style="background:${c}" data-color="${c}"></button>`).join('');
    root.querySelectorAll('.raColor').forEach(btn => btn.onclick = () => {
      const active = document.querySelector('.reel.active [data-act="color"]');
      if (active) active.click();
      const colorButtons = document.querySelectorAll('.reel.active [data-act="color"]');
      const match = [...colorButtons].find(b => b.dataset.color.toLowerCase() === btn.dataset.color.toLowerCase());
      if (match) match.click();
      else window.dispatchEvent(new CustomEvent('reelsai-color',{detail:{color:btn.dataset.color}}));
    });
  }

  async function search(){
    const q = root.querySelector('#raPixabayQuery').value.trim();
    if (!q) return;
    lastQuery = q; page = 1; await load();
  }
  async function load(){
    results.innerHTML = '<div class="raLoading">🔎 Buscando no Pixabay…</div>';
    const color = root.querySelector('#raColor').value;
    const orientation = root.querySelector('#raOrientation').value;
    const params = new URLSearchParams({q:lastQuery,page:String(page),per_page:'12',orientation});
    if (color) params.set('colors', color);
    try {
      const res = await fetch('/.netlify/functions/pixabay-search?' + params);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao consultar Pixabay.');
      if (!data.hits?.length) { results.innerHTML = '<div class="raEmpty">Nenhuma imagem encontrada.</div>'; return; }
      results.innerHTML = data.hits.map(item => `<button class="raItem" title="${escapeHtml(item.tags || 'Imagem Pixabay')}" data-url="${escapeHtml(item.largeImageURL || item.webformatURL || item.previewURL || '')}"><img loading="lazy" src="${escapeHtml(item.previewURL || item.webformatURL || '')}" alt="${escapeHtml(item.tags || 'Pixabay')}"><span>Pixabay · ${escapeHtml(item.user || '')}</span></button>`).join('');
      results.querySelectorAll('.raItem').forEach(btn => btn.onclick = () => useImage(btn.dataset.url));
    } catch (e) {
      results.innerHTML = `<div class="raEmpty">❌ ${escapeHtml(e.message)}</div>`;
    }
  }
  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  async function useImage(url){
    const input = document.querySelector('.reel.active [data-act="media"]');
    if (!input || !url) { alert('Abra ou selecione um Reel antes de escolher a imagem.'); return; }
    try {
      toggle.disabled = true; toggle.textContent = '⬇️ Baixando…';
      const response = await fetch(url, {mode:'cors'});
      if (!response.ok) throw new Error('Não foi possível baixar esta imagem.');
      const blob = await response.blob();
      const ext = (blob.type.split('/')[1] || 'jpg').split(';')[0];
      const file = new File([blob], `pixabay-${Date.now()}.${ext}`, {type:blob.type || 'image/jpeg'});
      const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; input.dispatchEvent(new Event('change',{bubbles:true}));
      toggle.textContent = '🖼️ Pixabay · 🎨 Cores';
    } catch(e) {
      toggle.textContent = '🖼️ Pixabay · 🎨 Cores';
      alert('Não foi possível importar a imagem do Pixabay agora.');
    } finally { toggle.disabled = false; }
  }
  root.querySelector('#raPixabayGo').onclick = search;
  root.querySelector('#raPixabayQuery').onkeydown = e => { if(e.key === 'Enter') search(); };
  root.querySelector('#raPrev').onclick = () => { if(page>1){page--;load();} };
  root.querySelector('#raNext').onclick = () => { if(lastQuery){page++;load();} };
  root.querySelector('#raColor').onchange = () => { if(lastQuery){page=1;load();} };
  root.querySelector('#raOrientation').onchange = () => { if(lastQuery){page=1;load();} };
  renderColors();
})();
