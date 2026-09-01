const OpenAI = require("openai");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function normalizeStyle(value) {
  const style = String(value || "viral").trim().toLowerCase();
  if (style.includes("educ")) return "educativo";
  if (style.includes("motiv")) return "motivacional";
  if (style.includes("story")) return "storytelling";
  return "viral";
}
function cleanText(value) { return String(value || "").replace(/\s+/g, " ").trim(); }
function buildScenes(script, duration) {
  const parts = [script.hook, script.body, script.example, script.action, script.close].map(cleanText).filter(Boolean).slice(0,5);
  while (parts.length < 5) parts.push("Salve esta ideia e compartilhe com alguém que precisa dela.");
  const step = duration / 5;
  return parts.map((text,index)=>({start:Number((index*step).toFixed(1)),end:Number(((index+1)*step).toFixed(1)),text}));
}
function localScripts(idea, count) {
  const topic=cleanText(idea);
  const templates=[
    {titulo:`O que você precisa saber sobre ${topic}`,hook:`Pouca gente fala disso quando o assunto é ${topic}.`,body:`Aqui está um ponto concreto para entender ${topic}: observe o contexto, identifique o que realmente muda o resultado e evite conclusões genéricas.`,example:`Na prática, pense em uma situação real envolvendo ${topic} e compare o antes e o depois dessa decisão.`,action:`Escolha uma ação pequena relacionada a ${topic} e aplique hoje.`,close:`Se isso ajudou, salve para rever depois.`},
    {titulo:`3 ideias sobre ${topic}`,hook:`Se você está lidando com ${topic}, comece por estas três ideias.`,body:`Primeiro, defina exatamente o que você quer alcançar. Segundo, elimine o que não contribui. Terceiro, acompanhe o resultado.`,example:`Um bom teste é aplicar uma mudança por vez e observar o que acontece em uma situação real de ${topic}.`,action:`Anote a próxima ação que você vai testar.`,close:`Depois, volte e veja o que mudou.`],
    {titulo:`Uma forma prática de entender ${topic}`,hook:`Quer entender ${topic} sem complicar? Comece por aqui.`,body:`Separe o assunto em causa, decisão e consequência. Essa estrutura ajuda a transformar informação em uma ação clara.`,example:`Pegue um caso real de ${topic}, escreva a causa, a decisão tomada e a consequência observada.`,action:`Faça esse exercício com o seu próprio caso.`,close:`Clareza vem quando você transforma ideia em ação.`]
  ];
  return Array.from({length:count},(_,i)=>templates[i%templates.length]);
}
function extractJson(text){const value=cleanText(text);try{return JSON.parse(value)}catch(_){}const match=value.match(/\{[\s\S]*\}/);if(match)return JSON.parse(match[0]);throw new Error("A IA retornou uma resposta em formato inválido.")}
async function generateWithAI({idea,duration,style,count}){
  if(!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada no Netlify.");
  const instructions=`Você é o roteirista profissional do ReelsAI. Transforme o assunto do usuário em roteiros específicos, naturais e úteis para Reels. Nunca use frases genéricas quando puder ser concreto. O título deve falar do assunto. O hook deve criar curiosidade sem mencionar IA ou Reel. O corpo deve ensinar algo concreto. O exemplo deve ser realmente relacionado ao assunto. A ação deve ser útil. Para Bíblia, use referências reais. Para saúde, direito e finanças, seja responsável. Escreva em português brasileiro natural. Estilo: ${style}. Duração: ${duration}s. Quantidade: ${count}. Responda somente no JSON solicitado.`;
  try {
    const response=await client.responses.create({model:process.env.OPENAI_MODEL||"gpt-5.6-luna",instructions,input:cleanText(idea),text:{format:{type:"json_schema",name:"reels_generation",strict:true,schema:{type:"object",additionalProperties:false,properties:{reels:{type:"array",minItems:1,maxItems:10,items:{type:"object",additionalProperties:false,properties:{titulo:{type:"string"},hook:{type:"string"},body:{type:"string"},example:{type:"string"},action:{type:"string"},close:{type:"string"}},required:["titulo","hook","body","example","action","close"]}}},required:["reels"]}}}});
    const parsed=extractJson(response.output_text||"");
    if(!parsed.reels?.length) throw new Error("A IA não retornou nenhum roteiro.");
    return {items:parsed.reels.slice(0,count),mode:"ai"};
  } catch(error) {
    console.error("AI generation failed:",error);
    if(process.env.ALLOW_LOCAL_FALLBACK!=="false") return {items:localScripts(idea,count),mode:"local-fallback"};
    throw new Error(error?.message||"Falha ao gerar o roteiro na IA.");
  }
}
exports.handler=async function(event){
  try{
    if(event.httpMethod!=="POST") return {statusCode:405,headers:{"content-type":"application/json"},body:JSON.stringify({error:"Método não permitido."})};
    let data;try{data=JSON.parse(event.body||"{}")}catch(_){return {statusCode:400,headers:{"content-type":"application/json"},body:JSON.stringify({error:"JSON inválido."})}};
    const idea=cleanText(data.idea||data.ideia),durationValue=Number(data.duration||data.duracao||30),duration=[30,45,60].includes(durationValue)?durationValue:30,countValue=Number(data.count||1),count=Math.max(1,Math.min(10,Number.isFinite(countValue)?Math.floor(countValue):1)),style=normalizeStyle(data.style||data.estilo);
    if(!idea) return {statusCode:400,headers:{"content-type":"application/json"},body:JSON.stringify({error:"Informe o tema do Reel."})};
    const result=await generateWithAI({idea,duration,style,count});
    const items=result.items.map((script,index)=>({titulo:cleanText(script.titulo)||`Reel ${index+1}`,hook:cleanText(script.hook),duration,tema:idea,style,mode:result.mode,scenes:buildScenes(script,duration)}));
    return {statusCode:200,headers:{"content-type":"application/json"},body:JSON.stringify({id:require("crypto").randomUUID(),idea,style,duration,count:items.length,mode:result.mode,items})};
  }catch(error){console.error(error);return {statusCode:500,headers:{"content-type":"application/json"},body:JSON.stringify({error:error?.message||"Erro ao gerar os Reels."})};}
};
