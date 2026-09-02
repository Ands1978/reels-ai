export default async function handler(request, context) {
  const response = await context.next();
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;

  const html = await response.text();
  if (html.includes('reelsAiMp3Music')) return new Response(html, response);

  const script = `
<script id="reelsAiMp3Music">
(function(){
  if(window.__reelsAiMp3MusicBooted)return;
  window.__reelsAiMp3MusicBooted=true;
  const tracks=new Map();
  let objectUrl=null;

  function activeIndex(){
    const reels=[...document.querySelectorAll('.reel')];
    const active=document.querySelector('.reel.active');
    return Math.max(0,reels.indexOf(active));
  }

  function setStatus(msg,type){
    const el=document.getElementById('status');
    if(el){el.textContent=msg;el.className='status '+(type||'')}
  }

  function addControls(){
    if(document.getElementById('mp3MusicGlobal'))return;
    const anchor=document.getElementById('musicGlobal');
    if(!anchor||!anchor.parentElement)return;
    const input=document.createElement('input');
    input.type='file';input.accept='audio/mpeg,.mp3,audio/*';input.id='mp3MusicGlobal';input.className='hidden';
    anchor.parentElement.appendChild(input);
    const button=document.createElement('button');
    button.id='mp3MusicButton';button.className='secondary';button.textContent='🎧 ADICIONAR MP3';
    anchor.parentElement.insertBefore(button,anchor.nextSibling);
    button.onclick=()=>{if(!document.querySelector('.reel.active')){setStatus('Gere ou importe um Reel antes de adicionar a música.','error');return}input.value='';input.click()};
    input.onchange=()=>{const file=input.files?.[0];if(file)applyTrack(file)};
  }

  function applyTrack(file){
    if(!file.type.startsWith('audio/')&&!/\\.mp3$/i.test(file.name)){setStatus('Escolha um arquivo MP3 ou áudio válido.','error');return}
    const index=activeIndex();
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(file);
    tracks.set(index,{url:objectUrl,name:file.name,volume:.18});
    renderMusicBox();
    setStatus('✅ MP3 adicionado ao Reel '+(index+1)+'. Ajuste o volume e use a prévia.','ok');
  }

  function renderMusicBox(){
    const index=activeIndex();const track=tracks.get(index);if(!track)return;
    const reel=document.querySelectorAll('.reel')[index];if(!reel)return;
    let box=reel.querySelector('.mp3-local-box');
    if(!box){
      box=document.createElement('div');box.className='musicbox mp3-local-box';
      const editor=reel.querySelector('.editor .panel');
      if(editor)editor.insertBefore(box,editor.querySelector('.card.media')||null);else return;
    }
    box.innerHTML='';
    const title=document.createElement('b');title.style.fontSize='11px';title.textContent='🎧 Fundo musical · MP3';box.appendChild(title);
    const hint=document.createElement('div');hint.className='hint';hint.textContent=track.name+' · volume '+Math.round(track.volume*100)+'%';box.appendChild(hint);
    const audio=document.createElement('audio');audio.controls=true;audio.preload='metadata';audio.src=track.url;audio.volume=track.volume;box.appendChild(audio);
    const row=document.createElement('div');row.className='row';
    const vol=document.createElement('input');vol.type='range';vol.min='0';vol.max='1';vol.step='.01';vol.value=track.volume;
    const label=document.createElement('label');label.textContent='Volume';
    const cell=document.createElement('div');cell.append(label,vol);row.appendChild(cell);
    const cell2=document.createElement('div');const remove=document.createElement('button');remove.className='small danger';remove.textContent='Remover MP3';cell2.appendChild(remove);row.appendChild(cell2);box.appendChild(row);
    vol.oninput=()=>{track.volume=Number(vol.value);audio.volume=track.volume;hint.textContent=track.name+' · volume '+Math.round(track.volume*100)+'%'};
    remove.onclick=()=>{tracks.delete(index);box.remove();setStatus('MP3 removido do Reel '+(index+1)+'.','ok')};
  }

  function observe(){
    const workspace=document.getElementById('workspace');if(!workspace)return;
    new MutationObserver(()=>{addControls();setTimeout(renderMusicBox,0)}).observe(workspace,{childList:true,subtree:true});
  }

  function boot(){addControls();observe();renderMusicBox()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
</script>`;

  const updated=html.replace('</body>',script+'\n</body>');
  const headers=new Headers(response.headers);
  headers.delete('content-length');
  headers.set('cache-control','no-store');
  return new Response(updated,{status:response.status,statusText:response.statusText,headers});
}

export const config={path:'/'};
