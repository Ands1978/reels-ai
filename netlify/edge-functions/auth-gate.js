import { getUser } from "@netlify/identity";

export default async function handler(request, context) {
  try {
    const user = await getUser();
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", new URL(request.url).pathname);
      return Response.redirect(loginUrl, 302);
    }

    const response = await context.next();
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return response;

    const html = await response.text();
    if (html.includes("reelsAiMp3Control")) {
      return new Response(html, { status: response.status, statusText: response.statusText, headers: response.headers });
    }

    const block = `
<div id="reelsAiMp3Control" style="position:fixed;right:18px;bottom:18px;z-index:99999;width:min(360px,calc(100vw - 36px));background:#12121a;border:1px solid #6d4bc5;border-radius:16px;padding:13px;box-shadow:0 18px 55px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;color:#fff">
  <div style="font-weight:900;font-size:13px;margin-bottom:8px">🎵 FUNDO MUSICAL MP3</div>
  <div style="font-size:11px;color:#aaaab8;margin-bottom:9px">Escolha um MP3 do seu computador para ouvir como fundo durante a edição.</div>
  <input id="reelsAiMp3File" type="file" accept="audio/mpeg,.mp3,audio/*" style="display:block;width:100%;font-size:11px;margin-bottom:9px;color:#ddd">
  <audio id="reelsAiMp3Audio" controls style="width:100%;display:none"></audio>
  <div id="reelsAiMp3Name" style="font-size:10px;color:#8f8f9a;margin-top:7px"></div>
</div>
<script>
(function(){
  const fileInput=document.getElementById('reelsAiMp3File');
  const audio=document.getElementById('reelsAiMp3Audio');
  const name=document.getElementById('reelsAiMp3Name');
  if(!fileInput||!audio)return;
  let objectUrl='';
  fileInput.addEventListener('change',function(){
    const file=this.files&&this.files[0];
    if(!file)return;
    if(!file.type.startsWith('audio/')&&!/\\.mp3$/i.test(file.name)){
      name.textContent='❌ Escolha um arquivo MP3/áudio válido.';
      return;
    }
    if(objectUrl)URL.revokeObjectURL(objectUrl);
    objectUrl=URL.createObjectURL(file);
    audio.src=objectUrl;
    audio.volume=.18;
    audio.style.display='block';
    name.textContent='✅ '+file.name+' · volume 18%';
    audio.play().then(function(){name.textContent='▶️ '+file.name+' · tocando como fundo';}).catch(function(){name.textContent='🎵 '+file.name+' · clique em Play para iniciar';});
  });
  audio.addEventListener('volumechange',function(){
    const file=fileInput.files&&fileInput.files[0];
    if(file)name.textContent=(audio.paused?'⏸️ ':'▶️ ')+file.name+' · volume '+Math.round(audio.volume*100)+'%';
  });
})();
</script>`;

    const updated = html.replace("</body>", block + "\n</body>");
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    return new Response(updated, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error("auth-gate error", error);
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl, 302);
  }
}

export const config = {
  path: "/",
};
