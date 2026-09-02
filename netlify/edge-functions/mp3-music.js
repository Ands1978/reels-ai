export default async function handler(request, context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  if (html.includes("reelsAiMp3Music")) return new Response(html, response);

  const script = `
<script id="reelsAiMp3Music">
(function(){
  if(window.__reelsAiMp3MusicBooted)return;
  window.__reelsAiMp3MusicBooted=true;
  let objectUrl="";
  let bgAudio=null;

  function status(msg,type){
    const el=document.getElementById("status");
    if(el){el.textContent=msg;el.className="status "+(type||"")}
  }

  function activeReel(){
    if(typeof state!=="undefined"){
      if(!state.reels.length && typeof ensureReel==="function") ensureReel();
      return state.reels[state.active];
    }
    return null;
  }

  function syncAudio(){
    const reel=activeReel();
    if(!bgAudio||!reel?.music?.url)return;
    if(bgAudio.src!==reel.music.url) bgAudio.src=reel.music.url;
    bgAudio.volume=Number(reel.music.volume??.18);
    if(reel.playing){
      if(bgAudio.paused) bgAudio.play().catch(()=>{});
    }else if(!bgAudio.paused){
      bgAudio.pause();
    }
  }

  function addControls(){
    if(document.getElementById("reelsAiMp3Panel"))return;
    const anchor=document.getElementById("musicGlobal");
    const parent=anchor?.parentElement;
    if(!parent)return;

    const panel=document.createElement("div");
    panel.id="reelsAiMp3Panel";
    panel.style.cssText="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-top:8px";

    const button=document.createElement("button");
    button.type="button";
    button.className="secondary";
    button.textContent="🎧 ADICIONAR MP3";
    button.title="Adicionar um fundo musical MP3 ao Reel ativo";

    const input=document.createElement("input");
    input.type="file";
    input.accept="audio/mpeg,.mp3,audio/*";
    input.style.display="none";

    bgAudio=document.createElement("audio");
    bgAudio.preload="auto";
    bgAudio.loop=true;
    bgAudio.style.display="none";

    button.onclick=function(){
      if(!activeReel()){status("Gere ou importe um Reel antes de adicionar música.","error");return}
      input.value="";
      input.click();
    };

    input.onchange=function(){
      const file=input.files?.[0];
      if(!file)return;
      if(!file.type.startsWith("audio/")&&!/\\.mp3$/i.test(file.name)){
        status("Escolha um arquivo MP3 ou áudio válido.","error");
        return;
      }
      const reel=activeReel();
      if(!reel)return;
      if(objectUrl)URL.revokeObjectURL(objectUrl);
      objectUrl=URL.createObjectURL(file);
      reel.music={url:objectUrl,name:file.name,volume:.18};
      bgAudio.src=objectUrl;
      bgAudio.volume=.18;
      if(typeof render==="function")render();
      status("✅ MP3 adicionado ao Reel "+(state.active+1)+". Clique em ▶ para ouvir o fundo.","ok");
      bgAudio.play().catch(()=>{});
    };

    panel.append(button,input,bgAudio);
    parent.appendChild(panel);
  }

  function wirePreview(){
    if(window.__reelsAiMp3PreviewWired)return;
    window.__reelsAiMp3PreviewWired=true;
    document.addEventListener("click",function(){
      setTimeout(syncAudio,0);
    },true);
    document.addEventListener("input",function(e){
      if(e.target?.dataset?.act==="time")setTimeout(syncAudio,0);
    },true);
  }

  function boot(){
    addControls();
    wirePreview();
    setInterval(function(){
      try{
        addControls();
        syncAudio();
      }catch(e){}
    },250);
  }

  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
  else boot();
})();
</script>`;

  const updated=html.replace("</body>",script+"\n</body>");
  const headers=new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control","no-store");
  return new Response(updated,{status:response.status,statusText:response.statusText,headers});
}

export const config={path:"/"};
