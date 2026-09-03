(() => {
  if (window.__reelsAiPixabayPanelBooted) return;
  window.__reelsAiPixabayPanelBooted = true;

  const style = document.createElement('style');
  style.textContent = `
    #raTools{position:fixed;right:14px;bottom:14px;z-index:99999;font-family:Inter,system-ui,sans-serif;user-select:none}
    #raToolsPanel{width:min(380px,calc(100vw - 28px));max-height:min(72vh,600px);overflow:auto;background:rgba(13,13,20,.98);border:1px solid #4a3a69;border-radius:16px;padding:11px;box-shadow:0 20px 60px rgba(0,0,0,.5);display:none}
    #raToolsPanel.open{display:block}
    #raDragHandle{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:-2px -2px 9px;padding:7px 8px;border-radius:9px;background:#191522;color:#fff;font-size:10px;font-weight:950;cursor:grab;touch-action:none}
    #raDragHandle:active{cursor:grabbing}
    .raDragHint{font-size:9px;color:#9993aa;font-weight:700}
    #raToolsToggle{border:1px solid #4a3a69;background:rgba(20,16,31,.96);color:#fff;border-radius:999px;padding:10px 13px;font-weight:900;font-size:11px;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer}
    .raTabs{display:flex;gap:6px;margin-bottom:8px}.raTab{flex:1;background:#24232e;border:1px solid #353442;color:#aaa;padding:8px;border-radius:9px;font-weight:900;font-size:10px;cursor:pointer}.raTab.active{background:#7b4bd4;color:#fff;border-color:#9b6bef}
    .raSearch{display:flex;gap:6px}.raSearch input{flex:1;background:#08080d;color:#fff;border:1px solid #383844;border-radius:9px;padding:9px;font:inherit;font-size:12px}.raSearch button{padding:9px 11px}
    .raFilters{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0}.raFilters select{padding:8px;font-size:10px}
    .raGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.raItem{position:relative;aspect-ratio:3/4;background:#09090e;border:1px solid #30303b;border-radius:8px;overflow:hidden;cursor:pointer;padding:0}.raItem img{width:100%;height:100%;object-fit:cover}.raItem span{position:absolute;left:4px;right:4px;bottom:4px;background:rgba(0,0,0,.7);border-radius:5px;padding:3px;font-size:8px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .raLoading,.raEmpty{font-size:10px;color:#92929e;text-align:center;padding:16px;grid-column:1/-1}.raPager{display:flex;gap:6px;margin-top:8px}.raPager button{flex:1;padding:8px;background:#262631}.raCredit{font-size:9px;color:#777783;margin-top:7px}.raColors{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.raColor{height:34px;border-radius:8px;border:1px solid #555;cursor:pointer;padding:0}.raColor.active{outline:2px solid #fff;outline-offset:1px}.raModes{display:flex;gap:6px;margin:8px 0}.raMode{flex:1;padding:8px;background:#29293a;color:#fff;border:0;border-radius:9px;font-size:10px;font-weight:900;cursor:pointer}.raMode.active{background:#7c3aed}.raCurrent{font-size:10px;color:#aaaab8;margin-top:8px}.raReset{width:100%;margin-top:8px;padding:8px;background:#262631;color:#fff;border:0;border-radius:9px;font-size:10px;font-weight:900;cursor:pointer}
    @media(max-width:720px){#raTools{right:8px;bottom:8px}.raGrid{grid-template-columns:repeat(3,1fr)}}
  `;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = 'raTools';
  root.innerHTML = `
    <div id="raToolsPanel">
      <div id="raDragHandle"><span>🖼️ PIXABAY + 🎨 FUNDO</span><span class="raDragHint">arraste para mover</span></div>
      <div class="raTabs"><button class="raTab active" data-tab="pixabay">🖼️ Pixabay</button><button class="raTab" data-tab="background">🎨 Fundo</button></div>
      <div id="raPixabayView">
        <div class="raSearch"><input id="raPixabayQuery" placeholder="Buscar imagens gratuitas…"><button id="raPixabayGo">Buscar</button></div>
        <div class="raFilters"><select id="raOrientation"><option value="vertical">Vertical 9:16</option><option value="horizontal">Horizontal</option></select><select id="raColor"><option value="">Todas as cores</option><option value="red">Vermelho</option><option value="orange">Laranja</option><option value="yellow">Amarelo</option><option value="green">Verde</option><option value="blue">Azul</option><option value="pink">Rosa</option><option value="white">Branco</option><option value="black">Preto</option><option value="brown">Marrom</option><option value="grayscale">Cinza</option></select></div>
        <div id="raPixabayResults" class="raGrid"><div class="raEmpty">Digite um tema para buscar imagens gratuitas.</div></div>
        <div class="raPager"><button id="raPrev">← Anterior</button><button id="raNext">Próxima →</button></div>
        <div class="raCredit">Imagens: Pixabay. Clique numa imagem para importar para a cena ativa.</div>
      </div>
      <div id="raBackgroundView" style="display:none">
        <div class="raModes"><button class="raMode active" data-mode="solid">COR SÓLIDA</button><button class="raMode" data-mode="gradient">GRADIENTE</button></div>
        <div id="raBackgroundSwatches" class="raColors"></div>
        <div id="raCurrent" class="raCurrent">Fundo atual: preto</div>
        <button id="raResetBackground" class="raReset">↺ Voltar ao fundo preto</button>
        <div class="raCredit">O fundo é aplicado ao Reel ativo e permanece na edição.</div>
      </div>
    </div>
    <button id="raToolsToggle">🖼️ Pixabay · 🎨 Fundo</button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector('#raToolsPanel');
  const toggle = root.querySelector('#raToolsToggle');
  const results = root.querySelector('#raPixabayResults');
  let page = 1;
  let lastQuery = '';
  let backgroundMode = 'solid';

  const solids = [['Preto','#000000'],['Branco','#ffffff'],['Azul','#2563eb'],['Roxo','#7c3aed'],['Rosa','#ec4899'],['Vermelho','#ef4444'],['Laranja','#f97316'],['Amarelo','#eab308'],['Verde','#16a34a'],['Ciano','#06b6d4'],['Pink','#db2777'],['Violeta','#9333ea'],['Azul-claro','#38bdf8'],['Verde-lima','#84cc16'],['Dourado','#f59e0b']];
  const gradients = [['Pôr do sol',['#ff512f','#dd2476']],['Oceano',['#00c6ff','#0072ff']],['Aurora',['#00f2fe','#4facfe','#8e2de2']],['Fogo',['#f12711','#f5af19']],['Floresta',['#134e5e','#71b280']],['Candy',['#ff9a9e','#fad0c4']],['Neon',['#8e2de2','#4a00e0']],['Tropical',['#00b09b','#96c93d']],['Royal',['#141e30','#243b55']],['Arco-íris',['#ff0080','#7928ca','#00c6ff']]];

  function activeReel(){try{return state?.reels?.[state.active]||null}catch(e){return null}}
  function ensure(){try{if(typeof ensureReel==='function')ensureReel();return activeReel()}catch(e){return null}}
  function refresh(){try{if(typeof render==='function')render()}catch(e){}}
  function saveBackground(bg,label){const reel=ensure();if(!reel)return;reel.background=bg;root.querySelector('#raCurrent').textContent='Fundo atual: '+label;refresh()}
  function drawBackground(ctx){const bg=activeReel()?.background;if(!bg||!ctx?.canvas)return null;const w=ctx.canvas.width,h=ctx.canvas.height;if(bg.type==='gradient'){const g=ctx.createLinearGradient(0,0,w,h);const colors=bg.colors||['#000','#111'];colors.forEach((c,i)=>g.addColorStop(i/Math.max(1,colors.length-1),c));return g}return bg.color||null}

  const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
  if(proto&&!proto.__reelsAiBackgroundPatched){
    const original=proto.fillRect;
    proto.fillRect=function(x,y,w,h){const canvas=this.canvas,full=x===0&&y===0&&w===canvas.width&&h===canvas.height,bg=full?drawBackground(this):null;if(bg){const previous=this.fillStyle;this.fillStyle=bg;const out=original.call(this,x,y,w,h);this.fillStyle=previous;return out}return original.call(this,x,y,w,h)};
    proto.__reelsAiBackgroundPatched=true;
  }

  function renderBackgrounds(){
    const box=root.querySelector('#raBackgroundSwatches');
    const items=backgroundMode==='solid'?solids:gradients;
    box.innerHTML=items.map((item,i)=>{const bg=backgroundMode==='solid'?item[1]:'linear-gradient(135deg,'+item[1].join(',')+')';return `<button class="raColor" title="${escapeHtml(item[0])}" aria-label="${escapeHtml(item[0])}" data-bg-index="${i}" style="background:${bg}"></button>`}).join('');
    box.querySelectorAll('.raColor').forEach(btn=>btn.onclick=()=>{const item=items[Number(btn.dataset.bgIndex)];if(backgroundMode==='solid')saveBackground({type:'solid',color:item[1]},item[0]);else saveBackground({type:'gradient',colors:item[1]},item[0]);});
  }

  function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function openTab(name){root.querySelectorAll('.raTab').forEach(t=>t.classList.toggle('active',t.dataset.tab===name));root.querySelector('#raPixabayView').style.display=name==='pixabay'?'':'none';root.querySelector('#raBackgroundView').style.display=name==='background'?'':'none';if(name==='background')renderBackgrounds()}

  toggle.onclick=()=>panel.classList.toggle('open');
  root.querySelectorAll('.raTab').forEach(tab=>tab.onclick=()=>openTab(tab.dataset.tab));
  root.querySelectorAll('.raMode').forEach(btn=>btn.onclick=()=>{backgroundMode=btn.dataset.mode;root.querySelectorAll('.raMode').forEach(b=>b.classList.toggle('active',b===btn));renderBackgrounds()});
  root.querySelector('#raResetBackground').onclick=()=>saveBackground({type:'solid',color:'#000000'},'preto');

  function enableDrag(){
    const handle=root.querySelector('#raDragHandle');let dragging=false,startX=0,startY=0,startLeft=0,startTop=0;
    const pos=JSON.parse(localStorage.getItem('raToolsPosition')||'null');
    if(pos){root.style.left=pos.left+'px';root.style.top=pos.top+'px';root.style.right='auto';root.style.bottom='auto'}
    handle.addEventListener('pointerdown',e=>{dragging=true;handle.setPointerCapture(e.pointerId);const r=root.getBoundingClientRect();startX=e.clientX;startY=e.clientY;startLeft=r.left;startTop=r.top;root.style.left=r.left+'px';root.style.top=r.top+'px';root.style.right='auto';root.style.bottom='auto'});
    handle.addEventListener('pointermove',e=>{if(!dragging)return;const w=root.offsetWidth,h=root.offsetHeight;const left=Math.max(4,Math.min(window.innerWidth-w-4,startLeft+e.clientX-startX));const top=Math.max(4,Math.min(window.innerHeight-h-4,startTop+e.clientY-startY));root.style.left=left+'px';root.style.top=top+'px'});
    handle.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;localStorage.setItem('raToolsPosition',JSON.stringify({left:parseInt(root.style.left,10),top:parseInt(root.style.top,10)}))});
  }
  enableDrag();

  async function search(){const q=root.querySelector('#raPixabayQuery').value.trim();if(!q)return;lastQuery=q;page=1;await load()}
  async function load(){results.innerHTML='<div class="raLoading">🔎 Buscando no Pixabay…</div>';const color=root.querySelector('#raColor').value;const orientation=root.querySelector('#raOrientation').value;const params=new URLSearchParams({q:lastQuery,page:String(page),per_page:'12',orientation});if(color)params.set('colors',color);try{const res=await fetch('/.netlify/functions/pixabay-search?'+params);const data=await res.json();if(!res.ok)throw new Error(data.error||'Erro ao consultar Pixabay.');if(!data.hits?.length){results.innerHTML='<div class="raEmpty">Nenhuma imagem encontrada.</div>';return}results.innerHTML=data.hits.map(item=>`<button class="raItem" title="${escapeHtml(item.tags||'Imagem Pixabay')}" data-url="${escapeHtml(item.largeImageURL||item.webformatURL||item.previewURL||'')}"><img loading="lazy" src="${escapeHtml(item.previewURL||item.webformatURL||'')}" alt="${escapeHtml(item.tags||'Pixabay')}"><span>Pixabay · ${escapeHtml(item.user||'')}</span></button>`).join('');results.querySelectorAll('.raItem').forEach(btn=>btn.onclick=()=>useImage(btn.dataset.url))}catch(e){results.innerHTML='<div class="raEmpty">❌ '+escapeHtml(e.message)+'</div>'}}
  async function useImage(url){const input=document.querySelector('.reel.active [data-act="media"]');if(!input||!url){alert('Abra ou selecione um Reel antes de escolher a imagem.');return}try{toggle.disabled=true;toggle.textContent='⬇️ Importando…';const response=await fetch(url,{mode:'cors'});if(!response.ok)throw new Error('download');const blob=await response.blob();const ext=(blob.type.split('/')[1]||'jpg').split(';')[0];const file=new File([blob],`pixabay-${Date.now()}.${ext}`,{type:blob.type||'image/jpeg'});const dt=new DataTransfer();dt.items.add(file);input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}))}catch(e){alert('Não foi possível importar esta imagem do Pixabay agora.')}finally{toggle.disabled=false;toggle.textContent='🖼️ Pixabay · 🎨 Fundo'}}
  root.querySelector('#raPixabayGo').onclick=search;
  root.querySelector('#raPixabayQuery').onkeydown=e=>{if(e.key==='Enter')search()};
  root.querySelector('#raPrev').onclick=()=>{if(page>1){page--;load()}};
  root.querySelector('#raNext').onclick=()=>{if(lastQuery){page++;load()}};
  root.querySelector('#raColor').onchange=()=>{if(lastQuery){page=1;load()}};
  root.querySelector('#raOrientation').onchange=()=>{if(lastQuery){page=1;load()}};
  renderBackgrounds();
})();
