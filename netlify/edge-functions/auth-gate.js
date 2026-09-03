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
    if (html.includes("reelsAiPixabayPanelInjected")) return new Response(html, response);

    const block = `
<script id="reelsAiPixabayPanelInjected" src="/pixabay-panel.js"></script>
<script id="reelsAiColorPanelInjected">
(() => {
  const boot = () => {
    if (window.__reelsAiColorPanelBooted) return;
    window.__reelsAiColorPanelBooted = true;
    const style = document.createElement('style');
    style.textContent = "\n      #reelsAiColorPanel{position:fixed;right:14px;bottom:66px;z-index:99998;font-family:Inter,system-ui,sans-serif}\n      #reelsAiColorBox{display:none;width:min(300px,calc(100vw - 28px));background:rgba(13,13,20,.98);border:1px solid #4a3a69;border-radius:16px;padding:12px;box-shadow:0 20px 60px rgba(0,0,0,.5)}\n      #reelsAiColorBox.open{display:block}\n      #reelsAiColorButton{border:1px solid #4a3a69;background:rgba(20,16,31,.96);color:#fff;border-radius:999px;padding:10px 13px;font-weight:900;font-size:11px;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer}\n      .raiColorTitle{font-size:10px;font-weight:950;color:#fff;margin-bottom:9px}.raiColorGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:7px}.raiColorSwatch{height:34px;border-radius:8px;border:1px solid #555;cursor:pointer}.raiColorSwatch.active{outline:2px solid #fff;outline-offset:1px}.raiColorModes{display:flex;gap:6px;margin-bottom:9px}.raiColorMode{flex:1;padding:8px;background:#29293a;color:#fff;border:0;border-radius:9px;font-size:10px;font-weight:900;cursor:pointer}.raiColorMode.active{background:#7c3aed}.raiColorReset{width:100%;margin-top:9px;padding:8px;background:#262631;color:#fff;border:0;border-radius:9px;font-size:10px;font-weight:900;cursor:pointer}\n      @media(max-width:720px){#reelsAiColorPanel{right:8px;bottom:58px}}\n    ";
    document.head.appendChild(style);
    const root = document.createElement('div');
    root.id = 'reelsAiColorPanel';
    root.innerHTML = `
      <div id="reelsAiColorBox">
        <div class="raiColorTitle">🎨 CORES DO FUNDO</div>
        <div class="raiColorModes"><button class="raiColorMode active" data-mode="solid">COR SÓLIDA</button><button class="raiColorMode" data-mode="gradient">GRADIENTE</button></div>
        <div id="raiColorGrid" class="raiColorGrid"></div>
        <button id="raiColorReset" class="raiColorReset">↺ Voltar ao fundo preto</button>
      </div>
      <button id="reelsAiColorButton">🎨 Cores</button>
    `;
    document.body.appendChild(root);
    const box = root.querySelector('#reelsAiColorBox');
    const grid = root.querySelector('#raiColorGrid');
    let mode = 'solid';
    const solids = [['Preto','#000000'],['Branco','#ffffff'],['Azul','#2563eb'],['Roxo','#7c3aed'],['Rosa','#ec4899'],['Vermelho','#ef4444'],['Laranja','#f97316'],['Amarelo','#eab308'],['Verde','#16a34a'],['Ciano','#06b6d4'],['Pink','#db2777'],['Violeta','#9333ea'],['Azul-claro','#38bdf8'],['Verde-lima','#84cc16'],['Dourado','#f59e0b']];
    const gradients = [['Pôr do sol',['#ff512f','#dd2476']],['Oceano',['#00c6ff','#0072ff']],['Aurora',['#00f2fe','#4facfe','#8e2de2']],['Fogo',['#f12711','#f5af19']],['Floresta',['#134e5e','#71b280']],['Candy',['#ff9a9e','#fad0c4']],['Neon',['#8e2de2','#4a00e0']],['Tropical',['#00b09b','#96c93d']],['Royal',['#141e30','#243b55']],['Arco-íris',['#ff0080','#7928ca','#00c6ff']]];
    const getReel = () => { try { return state?.reels?.[state.active] || null; } catch { return null; } };
    const apply = (background) => { try { if (typeof ensureReel === 'function') ensureReel(); const reel = getReel(); if (!reel) return; reel.background = background; if (typeof render === 'function') render(); } catch {} };
    const renderColors = () => {
      const items = mode === 'solid' ? solids : gradients;
      grid.innerHTML = items.map((item,i) => { const bg = mode === 'solid' ? item[1] : 'linear-gradient(135deg,' + item[1].join(',') + ')'; return `<button class="raiColorSwatch" title="${item[0]}" aria-label="${item[0]}" data-i="${i}" style="background:${bg}"></button>`; }).join('');
      grid.querySelectorAll('.raiColorSwatch').forEach(btn => btn.onclick = () => { const item = items[Number(btn.dataset.i)]; if (mode === 'solid') apply({type:'solid',color:item[1]}); else apply({type:'gradient',colors:item[1]}); });
    };
    root.querySelector('#reelsAiColorButton').onclick = () => box.classList.toggle('open');
    root.querySelectorAll('.raiColorMode').forEach(btn => btn.onclick = () => { mode = btn.dataset.mode; root.querySelectorAll('.raiColorMode').forEach(b => b.classList.toggle('active', b === btn)); renderColors(); });
    root.querySelector('#raiColorReset').onclick = () => apply({type:'solid',color:'#000000'});
    renderColors();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true}); else boot();
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
