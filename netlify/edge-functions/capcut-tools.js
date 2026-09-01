const TOOLS = {
  elevenMusic: 'https://elevenlabs.io/pt/music',
  eleven: 'https://elevenlabs.io/pt',
  vibes: 'https://vibes.ai/',
  vibesDownload: 'https://vibes.ai/download-now',
  leonardo: 'https://app.leonardo.ai/',
  gemini: 'https://gemini.google.com/',
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

  const anchor = '<input id="globalFiles" class="hidden" type="file" accept="image/*,video/*" multiple></div>';
  if (!html.includes(anchor)) {
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

  function scriptPrompt(){
    const {idea,style}=getContext();
    return 'Crie um roteiro profissional para um Reel vertical sobre '+idea+'. Estilo '+style+'. Gere gancho forte nos primeiros segundos, cenas numeradas, narração em português, texto de legenda por cena, sugestões visuais e CTA final.';
  }

  async function copyPrompt(prompt){
    try{await navigator.clipboard.writeText(prompt);return true}catch(e){return false}
  }

  function setStatus(msg,type){
    const el=document.getElementById('status');
    if(el){el.textContent=msg;el.className='status '+(type||'')}
  }

  function injectPanel(){
    if(document.getElementById('reelsAiToolsPanel')) return;
    const input=document.getElementById('globalFiles');
    if(!input || !input.parentElement) return;
    input.parentElement.insertAdjacentHTML('afterend', '<div id="reelsAiToolsPanel" class="notice" style="margin-top:12px"><b>🧰 FERRAMENTAS IA INTEGRADAS</b><div class="buttons" style="margin-top:10px"><button id="toolMusic" class="secondary">🎵 Eleven Music</button><button id="toolVoice" class="secondary">🎙️ ElevenLabs Voz</button><button id="toolVibes" class="secondary">✨ Vibes</button><button id="toolLeonardo" class="secondary">🎨 Leonardo.ai</button><button id="toolGemini" class="secondary">✨ Gemini</button><button id="toolCapcutMusic" class="secondary">🎵 CapCut Música</button><button id="toolCapcutEditor" class="secondary">🎬 CapCut Editor</button></div><div class="hint" style="margin-top:8px">Os botões abrem as ferramentas oficiais e copiam automaticamente um prompt pronto baseado no tema do Reel.</div></div><div id="reelsAiToolsNotice" class="notice">🎵 <b>Música:</b> o MusicGen gratuito foi removido. Agora o fluxo usa <b>Eleven Music</b>, que aceita prompts para trilhas instrumentais e música para vídeo.</div>');

    document.getElementById('toolMusic')?.addEventListener('click', async ()=>{
      const ok=await copyPrompt(musicPrompt());
      setStatus(ok?'🎵 Prompt musical copiado. Eleven Music aberto para gerar a trilha.':'🎵 Abrindo Eleven Music para gerar a trilha.','ok');
      openTool(URLS.elevenMusic);
    });
    document.getElementById('toolVoice')?.addEventListener('click', async ()=>{
      const {idea}=getContext();
      const prompt='Narração em português do Brasil para um Reel sobre '+idea+'. Voz natural, clara, envolvente, ritmo profissional, sem música e sem efeitos.';
      await copyPrompt(prompt);
      setStatus('🎙️ Prompt de narração copiado. ElevenLabs aberto.','ok');
      openTool(URLS.eleven);
    });
    document.getElementById('toolVibes')?.addEventListener('click', async ()=>{
      await copyPrompt(imagePrompt());
      setStatus('✨ Prompt visual copiado. Vibes aberto para criar imagens e vídeos.','ok');
      openTool(URLS.vibes);
    });
    document.getElementById('toolLeonardo')?.addEventListener('click', async ()=>{
      await copyPrompt(imagePrompt());
      setStatus('🎨 Prompt visual copiado. Leonardo.ai aberto para gerar a mídia.','ok');
      openTool(URLS.leonardo);
    });
    document.getElementById('toolGemini')?.addEventListener('click', async ()=>{
      await copyPrompt(scriptPrompt());
      setStatus('✨ Prompt de roteiro copiado. Gemini aberto para refinar o conteúdo.','ok');
      openTool(URLS.gemini);
    });
    document.getElementById('toolCapcutMusic')?.addEventListener('click', async ()=>{
      await copyPrompt(musicPrompt());
      setStatus('🎵 Prompt musical copiado. CapCut Música aberto.','ok');
      openTool(URLS.capcutMusic);
    });
    document.getElementById('toolCapcutEditor')?.addEventListener('click', ()=>{
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
      if(n.textContent.includes('Meta Vibes')) n.innerHTML='🎨 <b>Fluxo:</b> roteiro → Vibes / Leonardo.ai → timeline → legenda → Eleven Music → exportação.';
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
    if(workspace){
      new MutationObserver(refreshLabels).observe(workspace,{childList:true,subtree:true});
    }
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
