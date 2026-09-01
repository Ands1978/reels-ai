const CAPCUT_MUSIC = 'https://www.capcut.com/tools/ai-music-generator';
const CAPCUT_EDITOR = 'https://www.capcut.com/pt-br/';

export default async function handler(request, context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('text/html')) return response;

  const html = await response.text();
  if (html.includes('capcutToolsInjected')) return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });

  const anchor = '<input id="globalFiles" class="hidden" type="file" accept="image/*,video/*" multiple></div>';
  if (!html.includes(anchor)) return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });

  const block = `<div id="capcutToolsInjected" class="buttons" style="margin-top:10px">
  <button id="capcutMusic" class="secondary">🎵 MÚSICA IA GRÁTIS NO CAPCUT</button>
  <button id="capcutEditor" class="secondary">🎬 EDITAR REEL NO CAPCUT</button>
</div>
<div class="notice">🆓 <b>CapCut:</b> gere uma trilha instrumental com IA e abra o editor online para finalizar seu Reel.</div>
<script id="capcutToolsScript">
(function(){
  const MUSIC_URL=${JSON.stringify(CAPCUT_MUSIC)};
  const EDITOR_URL=${JSON.stringify(CAPCUT_EDITOR)};
  const openTool=url=>window.open(url,'_blank','noopener,noreferrer');
  document.getElementById('capcutMusic')?.addEventListener('click',()=>{
    const idea=document.getElementById('idea')?.value?.trim()||'instrumental background music for a short vertical social media video';
    const style=document.getElementById('style')?.value||'Motivacional';
    const prompt='Instrumental background music for a '+style.toLowerCase()+' short video about '+idea+'. No vocals, clean rhythm, subtle and cinematic.';
    try{navigator.clipboard?.writeText(prompt)}catch(e){}
    openTool(MUSIC_URL);
  });
  document.getElementById('capcutEditor')?.addEventListener('click',()=>openTool(EDITOR_URL));
})();
</script>`;

  const updated = html.replace(anchor, anchor + block);
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(updated, { status: response.status, statusText: response.statusText, headers });
}

export const config = {
  path: '/',
};
