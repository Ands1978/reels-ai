const TOOLS = {
  elevenMusic: 'https://elevenlabs.io/pt/music',
  eleven: 'https://elevenlabs.io/pt',
  vibes: 'https://vibes.ai/',
  vibesDownload: 'https://vibes.ai/download-now',
  leonardo: 'https://app.leonardo.ai/',
  gemini: 'https://gemini.google.com/',
  nanoBanana: 'https://gemini.google.com/',
  geminiCanvas: 'https://gemini.google.com/',
  stitch: 'https://stitch.withgoogle.com/',
  build: 'https://aistudio.google.com/',
  opal: 'https://opal.google/',
  notebooklm: 'https://notebooklm.google/',
  pomelli: 'https://labs.google/',
  capcutMusic: 'https://www.capcut.com/tools/ai-music-generator',
  capcutEditor: 'https://www.capcut.com/pt-br/',
};

export default async function handler(request, context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) return response;

  const html = await response.text();
  if (html.includes('reelsAiToolsInjected')) {
    return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });
  }

  const block = `
<script id="reelsAiToolsInjected">
(function(){
  const URLS = ${JSON.stringify(TOOLS)};
  const openTool = url => window.open(url, '_blank', 'noopener,noreferrer');

  function getContext(){
    const idea = document.getElementById('idea')?.value?.trim() || 'um Reel vertical para redes sociais';
    const style = document.getElementById('style')?.value || 'Motivacional';
    return { idea, style };
  }

  function musicPrompt(){
    const {idea,style}=getContext();
    return 'Instrumental background music for a short vertical social media video about '+idea+'. '+style+' style, modern, cinematic, emotional, catchy but subtle, no vocals, no spoken words, clean intro, steady rhythm, suitable under captions, polished mix.';
  }

  function imagePrompt(){
    const {idea,style}=getContext();
    return 'Create a professional 9:16 vertical visual for a social media Reel about '+idea+'. '+style+' style, cinematic lighting, strong composition, realistic details, high contrast, no text, no watermark, optimized for mobile.';
  }

  function nanoPrompt(){
    const {idea,style}=getContext();
    return 'Use Nano Banana to create or edit a high-quality 9:16 vertical image for a Reel about '+idea+'. '+style+' style, preserve subject consistency, realistic details, cinematic lighting, accurate readable text only if requested, no watermark.';
  }

  function scriptPrompt(){
    const {idea,style}=getContext();
    return 'Crie um roteiro profissional para um Reel vertical sobre '+idea+'. Estilo '+style+'. Gere gancho forte nos primeiros segundos, cenas numeradas, narração em português, texto de legenda por cena, sugestões visuais e CTA final.';
  }

  function buildPrompt(){
    const {idea,style}=getContext();
    return 'Build a production-ready web app for a professional vertical Reel workflow about '+idea+'. Style '+style+'. Include a clean UI, scene timeline, media handling, captions, export flow and AI-ready integration points.';
  }

  function stitchPrompt(){
    const {idea,style}=getContext();
    return 'Design a high-fidelity UI in Stitch for a professional Reel editor about '+idea+'. '+style+' visual direction, dark premium interface, 9:16 preview, timeline, scene controls, captions, media library and export actions.';
  }

  function opalPrompt(){
    const {idea,style}=getContext();
    return 'Create an AI mini-app in Opal that helps produce a professional Reel about '+idea+'. '+style+' style. Workflow: idea, hook, script, scene plan, visual prompts, captions and final CTA.';
  }

  function notebookPrompt(){
    const {idea}=getContext();
    return 'Research and organize reliable source material for a Reel about '+idea+'. Extract key facts, useful quotes, contradictions, a concise briefing and a source-grounded outline for a short vertical video.';
  }

  function pomelliPrompt(){
    const {idea,style}=getContext();
    return 'Create on-brand marketing content for a business/social campaign around '+idea+'. '+style+' style. Generate a consistent visual direction, campaign messaging, social posts and Reel creative concepts.';
  }

  function canvasPrompt(){
    const {idea,style}=getContext();
    return 'Use Gemini Canvas to create a working Reel content workspace about '+idea+'. '+style+' style. Build an editable script, scene table, captions, visual prompts, CTA and a production checklist.';
  }

  async function copyPrompt(prompt){
    try{await navigator.clipboard.writeText(prompt);return true}catch(e){return false}
  }

  function setStatus(msg,type){
    const el=document.getElementById('status');
    if(el){el.textContent=msg;el.className='status '+(type||'')}
  }

  function wire(id,url,prompt,label){
    document.getElementById(id)?.addEventListener('click',async()=>{
      const ok=prompt?await copyPrompt(prompt()):false;
      setStatus(ok?''+label+' aberto. Prompt copiado para a área de transferência.':label+' aberto.','ok');
      openTool(url);
    });
  }

  function injectPanel(){
    if(document.getElementById('reelsAiToolsPanel')) return;
    const input=document.getElementById('globalFiles');
    if(!input || !input.parentElement) return;
    input.parentElement.insertAdjacentHTML('afterend', `
      <div id="reelsAiToolsPanel" class="notice" style="margin-top:12px">
        <b>🧰 CENTRAL DE FERRAMENTAS IA</b>
        <div class="buttons" style="margin-top:10px">
          <button id="toolMusic" class="secondary">🎵 Eleven Music</button>
          <button id="toolVoice" class="secondary">🎙️ ElevenLabs</button>
          <button id="toolVibes" class="secondary">✨ Vibes</button>
          <button id="toolVibesInstall" class="secondary">⬇ Instalar Vibes</button>
          <button id="toolLeonardo" class="secondary">🎨 Leonardo.ai</button>
          <button id="toolNano" class="secondary">🍌 Nano Banana</button>
          <button id="toolGemini" class="secondary">✨ Gemini</button>
          <button id="toolCanvas" class="secondary">🖼️ Gemini Canvas</button>
          <button id="toolStitch" class="secondary">🧩 Stitch</button>
          <button id="toolBuild" class="secondary">🛠️ Build</button>
          <button id="toolOpal" class="secondary">💎 Opal</button>
          <button id="toolNotebook" class="secondary">📚 NotebookLM</button>
          <button id="toolPomelli" class="secondary">📣 Pomelli</button>
          <button id="toolCapcutMusic" class="secondary">🎵 CapCut Música</button>
          <button id="toolCapcutEditor" class="secondary">🎬 CapCut Editor</button>
        </div>
        <div class="hint" style="margin-top:8px">As ferramentas oficiais são abertas em nova aba. Quando fizer sentido, o aplicativo copia automaticamente um prompt pronto baseado no tema do Reel.</div>
      </div>
      <div id="reelsAiToolsNotice" class="notice">🚀 <b>Fluxo profissional:</b> roteiro → pesquisa → imagens/vídeos → design → música/voz → timeline → exportação.</div>
    `);

    wire('toolMusic',URLS.elevenMusic,musicPrompt,'🎵 Eleven Music');
    wire('toolVoice',URLS.eleven,()=>{
      const {idea}=getContext();
      return 'Narração em português do Brasil para um Reel sobre '+idea+'. Voz natural, clara, envolvente, ritmo profissional, sem música e sem efeitos.';
    },'🎙️ ElevenLabs');
    wire('toolVibes',URLS.vibes,imagePrompt,'✨ Vibes');
    document.getElementById('toolVibesInstall')?.addEventListener('click',()=>{
      setStatus('⬇ Página oficial de instalação do Vibes aberta.','ok');
      openTool(URLS.vibesDownload);
    });
    wire('toolLeonardo',URLS.leonardo,imagePrompt,'🎨 Leonardo.ai');
    wire('toolNano',URLS.nanoBanana,nanoPrompt,'🍌 Nano Banana');
    wire('toolGemini',URLS.gemini,scriptPrompt,'✨ Gemini');
    wire('toolCanvas',URLS.geminiCanvas,canvasPrompt,'🖼️ Gemini Canvas');
    wire('toolStitch',URLS.stitch,stitchPrompt,'🧩 Stitch');
    wire('toolBuild',URLS.build,buildPrompt,'🛠️ Google AI Studio Build');
    wire('toolOpal',URLS.opal,opalPrompt,'💎 Opal');
    wire('toolNotebook',URLS.notebooklm,notebookPrompt,'📚 NotebookLM');
    wire('toolPomelli',URLS.pomelli,pomelliPrompt,'📣 Pomelli');
    wire('toolCapcutMusic',URLS.capcutMusic,musicPrompt,'🎵 CapCut Música');
    document.getElementById('toolCapcutEditor')?.addEventListener('click',()=>{
      setStatus('🎬 CapCut Editor aberto para finalizar o Reel.','ok');
      openTool(URLS.capcutEditor);
    });
  }

  function refreshLabels(){
    const global=document.getElementById('musicGlobal');
    if(global) global.textContent='🎵 ABRIR ELEVEN MUSIC';
    document.querySelectorAll('.musicbox').forEach(box=>{
      const b=box.querySelector('b');
      if(b) b.textContent='🎵 Fundo musical · Eleven Music';
      const hint=box.querySelector('.hint');
      if(hint && !box.querySelector('audio')) hint.textContent='Abra o Eleven Music com um prompt pronto para criar a trilha instrumental do Reel.';
      const button=box.querySelector('[data-act="music"]');
      if(button) button.textContent='Abrir Eleven Music';
      const name=box.querySelector('.hint');
      if(name && box.querySelector('audio') && name.textContent.includes('MusicGen')) name.textContent=name.textContent.replace(/MusicGen/g,'Eleven Music');
    });
    document.querySelectorAll('.notice').forEach(n=>{
      if(n.textContent.includes('Meta MusicGen')) n.innerHTML='🎵 <b>Música:</b> o MusicGen foi substituído pelo <b>Eleven Music</b>.';
      if(n.textContent.includes('Meta Vibes')) n.innerHTML='🎨 <b>Fluxo:</b> Vibes / Leonardo.ai / Nano Banana → timeline → legenda → Eleven Music → exportação.';
    });
  }

  window.generateMusic = async function(reel){
    const ok=await copyPrompt(musicPrompt());
    setStatus(ok?'🎵 Prompt musical copiado. Eleven Music aberto para gerar sua trilha.':'🎵 Eleven Music aberto para gerar sua trilha.','ok');
    openTool(URLS.elevenMusic);
  };

  function boot(){
    injectPanel();
    refreshLabels();
    const workspace=document.getElementById('workspace');
    if(workspace)new MutationObserver(refreshLabels).observe(workspace,{childList:true,subtree:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
</script>`;

  const updated = html.replace('</body>', block + '\n</body>');
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(updated, { status: response.status, statusText: response.statusText, headers });
}

export const config = {
  path: '/',
};
