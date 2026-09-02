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
    if (html.includes("reelsAiColorBackground")) return new Response(html, response);

    const block = `
<div id="reelsAiColorBackground" style="position:fixed;right:18px;top:92px;z-index:99998;width:min(300px,calc(100vw - 36px));background:#12121a;border:1px solid #6d4bc5;border-radius:16px;padding:13px;box-shadow:0 18px 55px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;color:#fff">
  <div style="font-weight:900;font-size:13px;margin-bottom:5px">🎨 CORES DO FUNDO</div>
  <div style="font-size:10px;color:#aaaab8;margin-bottom:10px">Escolha uma cor ou combinação para o Reel ativo.</div>
  <div id="reelsAiColorSwatches" style="display:grid;grid-template-columns:repeat(5,1fr);gap:7px"></div>
  <div style="display:flex;gap:7px;margin-top:9px">
    <button id="reelsAiColorSolid" type="button" style="flex:1;padding:8px;font-size:10px">COR SÓLIDA</button>
    <button id="reelsAiColorGradient" type="button" style="flex:1;padding:8px;font-size:10px;background:#29293a">GRADIENTE</button>
  </div>
  <a href="/banco-imagens" target="_blank" rel="noopener" style="display:block;text-align:center;margin-top:10px;padding:10px;border-radius:10px;background:linear-gradient(135deg,#4aa3ff,#2672d9);color:#fff;text-decoration:none;font-size:11px;font-weight:950">🖼️ BANCO DE IMAGENS PIXABAY</a>
  <div id="reelsAiColorName" style="font-size:10px;color:#8f8f9a;margin-top:8px">Fundo atual: preto</div>
</div>
<script>
(function(){
  if(window.__reelsAiColorBackgroundBooted)return;
  window.__reelsAiColorBackgroundBooted=true;
  const solids=[['Preto','#000000'],['Branco','#ffffff'],['Azul','#2563eb'],['Roxo','#7c3aed'],['Rosa','#ec4899'],['Vermelho','#ef4444'],['Laranja','#f97316'],['Amarelo','#eab308'],['Verde','#16a34a'],['Ciano','#06b6d4'],['Pink','#db2777'],['Violeta','#9333ea'],['Azul-claro','#38bdf8'],['Verde-lima','#84cc16'],['Dourado','#f59e0b']];
  const gradients=[['Pôr do sol',['#ff512f','#dd2476']],['Oceano',['#00c6ff','#0072ff']],['Aurora',['#00f2fe','#4facfe','#8e2de2']],['Fogo',['#f12711','#f5af19']],['Floresta',['#134e5e','#71b280']],['Candy',['#ff9a9e','#fad0c4']],['Neon',['#8e2de2','#4a00e0']],['Tropical',['#00b09b','#96c93d']],['Royal',['#141e30','#243b55']],['Arco-íris',['#ff0080','#7928ca','#00c6ff']]];
  let mode='solid';
  function activeReel(){try{return state?.reels?.[state.active]||null}catch(e){return null}}
  function ensure(){try{if(typeof ensureReel==='function')ensureReel();return activeReel()}catch(e){return null}}
  function save(bg,label){const reel=ensure();if(!reel)return;reel.background=bg;const name=document.getElementById('reelsAiColorName');if(name)name.textContent='Fundo atual: '+label;try{if(typeof render==='function')render()}catch(e){}}
  function drawBackground(ctx){const reel=activeReel(),bg=reel?.background;if(!bg||!ctx?.canvas)return null;const w=ctx.canvas.width,h=ctx.canvas.height;if(bg.type==='gradient'){const g=ctx.createLinearGradient(0,0,w,h);(bg.colors||['#000','#111']).forEach((c,i)=>g.addColorStop(i/Math.max(1,bg.colors.length-1),c));return g}return bg.color||null}
  const proto=window.CanvasRenderingContext2D&&CanvasRenderingContext2D.prototype;
  if(proto&&!proto.__reelsAiColorPatched){
    const original=proto.fillRect;
    proto.fillRect=function(x,y,w,h){const canvas=this.canvas,full=x===0&&y===0&&w===canvas.width&&h===canvas.height,bg=full?drawBackground(this):null;if(bg){const previous=this.fillStyle;this.fillStyle=bg;const result=original.call(this,x,y,w,h);this.fillStyle=previous;return result}return original.call(this,x,y,w,h)};
    proto.__reelsAiColorPatched=true;
  }
  function swatches(){const box=document.getElementById('reelsAiColorSwatches');if(!box)return;box.innerHTML='';const items=mode==='solid'?solids:gradients;items.forEach(item=>{const b=document.createElement('button');b.type='button';b.title=item[0];b.setAttribute('aria-label',item[0]);b.style.cssText='height:31px;border-radius:8px;border:1px solid rgba(255,255,255,.25);cursor:pointer;padding:0;box-shadow:0 4px 10px rgba(0,0,0,.25);';b.style.background=mode==='solid'?item[1]:'linear-gradient(135deg,'+item[1].join(',')+')';b.onclick=()=>mode==='solid'?save({type:'solid',color:item[1]},item[0]):save({type:'gradient',colors:item[1]},item[0]);box.appendChild(b)})}
  function boot(){const solid=document.getElementById('reelsAiColorSolid'),gradient=document.getElementById('reelsAiColorGradient');if(!solid||!gradient)return;solid.onclick=()=>{mode='solid';solid.style.background='#7c3aed';gradient.style.background='#29293a';swatches()};gradient.onclick=()=>{mode='gradient';gradient.style.background='#7c3aed';solid.style.background='#29293a';swatches()};solid.style.background='#7c3aed';swatches()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
</script>`;
    const updated = html.replace("</body>", block + "\n</body>");
    const headers = new Headers(response.headers);
    headers.delete("content-length");
    headers.set("cache-control","no-store");
    return new Response(updated,{status:response.status,statusText:response.statusText,headers});
  } catch (error) {
    console.error("auth-gate error", error);
    const loginUrl = new URL("/login", request.url);
    return Response.redirect(loginUrl, 302);
  }
}

export const config = { path: "/" };
