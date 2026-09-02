const OpenAI = require("openai");

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
  while (parts.length < 5) parts.push("Feche com uma ideia específica ligada diretamente ao tema.");
  const step = duration / 5;
  return parts.map((text,index)=>({start:Number((index*step).toFixed(1)),end:Number(((index+1)*step).toFixed(1)),text}));
}

function localScripts(idea, count) {
  const topic=cleanText(idea);
  const angles=[
    ["O erro que quase todo mundo comete",`O erro mais comum em ${topic} não parece grave — até começar a custar resultado.`,`O problema está em tratar ${topic} de forma superficial. O ponto decisivo é identificar exatamente o que muda o resultado e em qual situação isso acontece.`,`Imagine alguém diante de uma decisão real sobre ${topic}: compare a escolha automática com uma escolha feita depois de analisar esse ponto.`,`Antes de repetir o padrão, identifique qual parte de ${topic} realmente está causando o problema.`,`Nem sempre é falta de informação; às vezes é usar a informação certa no momento errado.`],
    ["A diferença que muda tudo",`Duas pessoas podem fazer exatamente a mesma coisa em ${topic} e chegar a resultados completamente diferentes.`,`A diferença costuma estar no contexto: objetivo, momento, público ou forma de execução. Em ${topic}, detalhe muda interpretação.`,`Pegue um caso concreto de ${topic} e altere apenas uma dessas condições. O resultado já muda?`,`Teste uma variável por vez em vez de mudar tudo ao mesmo tempo.`,`O detalhe que parece pequeno pode ser justamente o que separa tentativa de resultado.`],
    ["O que ninguém explica direito",`Se você só ouviu dicas rápidas sobre ${topic}, está faltando uma parte importante da história.`,`Antes da dica existe uma lógica: o que causa o problema, o que influencia a decisão e qual consequência aparece depois.`,`Use uma situação real de ${topic} e conte essa sequência em três passos: causa, escolha e consequência.`,`Na próxima vez que falar de ${topic}, comece pela causa em vez da conclusão.`,`Entender o porquê faz a dica deixar de ser apenas uma frase bonita.`],
    ["Antes de fazer isso, pense nisto",`Antes de tomar qualquer decisão sobre ${topic}, existe uma pergunta que vale mais que uma resposta pronta.`,`Pergunte qual resultado você quer e qual evidência mostraria que a decisão funcionou. Isso evita agir apenas por impulso.`,`Em uma situação real de ${topic}, escreva o resultado esperado antes de executar a ação.`,`Defina um critério de sucesso para a sua próxima tentativa.`,`Uma boa decisão começa antes da ação.`],
    ["Um caso prático",`Vamos tirar ${topic} da teoria e colocar em uma situação que poderia acontecer hoje.`,`Imagine uma pessoa enfrentando um problema específico de ${topic}. Ela tem duas opções e precisa escolher com base em uma consequência concreta.`,`Mostre o que acontece com cada opção e destaque exatamente onde os caminhos se separam.`,`Use esse mesmo raciocínio em uma situação parecida com a sua.`,`Quando você enxerga o caso, a teoria fica muito mais fácil de entender.`],
    ["A pergunta que quase ninguém faz",`Quer analisar ${topic} de um jeito melhor? Faça esta pergunta antes de começar.`,`Em vez de perguntar apenas o que fazer, pergunte o que precisa ser verdade para essa estratégia funcionar.`,`Aplique a pergunta a um caso real de ${topic} e veja quais condições aparecem.`,`Liste as duas condições mais importantes e verifique se elas existem no seu caso.`,`Perguntas melhores produzem decisões melhores.`],
    ["Mito ou realidade",`Existe uma ideia muito repetida sobre ${topic} que merece ser colocada à prova.`,`O problema não é discordar da ideia; é verificar em qual situação ela funciona e onde deixa de funcionar.`,`Pegue um exemplo concreto de ${topic} e procure uma situação em que a regra falha.`,`Não aceite uma regra como universal sem testar o contexto.`,`O contexto é parte da resposta.`],
    ["Como eu explicaria isso para uma criança",`Se eu tivesse que explicar ${topic} sem usar palavras difíceis, começaria por uma situação do dia a dia.`,`Troque abstrações por causa e efeito: acontece isto, você faz aquilo, e então surge esta consequência.`,`Escolha um exemplo cotidiano ligado a ${topic} e conte a sequência em linguagem simples.`,`Se você não consegue explicar o mecanismo, volte uma etapa e descubra o que está faltando.`,`Simplicidade não é falta de profundidade; é clareza.`],
    ["O que fazer nos próximos 10 minutos",`Você não precisa resolver ${topic} inteiro hoje. Precisa descobrir qual é o próximo passo útil.`,`Escolha uma parte pequena, observe o que já existe e defina uma ação que produza alguma evidência.`,`Faça um teste pequeno relacionado a ${topic} e registre o que aconteceu.`,`Use o resultado do teste para decidir o próximo movimento.`,`A melhor próxima ação é aquela que gera informação nova.`],
    ["Uma visão diferente",`Talvez você esteja olhando para ${topic} pela pergunta errada.`,`Em vez de pensar apenas no resultado final, observe o processo que produz esse resultado e qual etapa pode ser ajustada.`,`Mapeie uma situação real de ${topic} do início ao fim e marque onde aparece a maior perda ou ganho.`,`Mude primeiro a etapa com maior impacto.`,`Às vezes a solução aparece quando você muda o ângulo da pergunta.`]
  ];
  return Array.from({length:count},(_,i)=>{const a=angles[i%angles.length];return {titulo:`${a[0]}: ${topic}`,hook:a[1],body:a[2],example:a[3],action:a[4],close:a[5]};});
}

function extractJson(text){const value=String(text||"").trim();try{return JSON.parse(value)}catch(_){}const match=value.match(/\{[\s\S]*\}/);if(match)return JSON.parse(match[0]);throw new Error("A IA retornou uma resposta em formato inválido.")}

function generationInstructions({idea,duration,style,count}) {
  return `Você é o roteirista principal do ReelsAI. Crie ${count} roteiros realmente diferentes sobre o tema: "${idea}". Estilo: ${style}. Duração aproximada: ${duration}s.\n\nREGRA PRINCIPAL: PROIBIDO repetir estrutura, frases, ideias ou exemplos entre os roteiros. Cada Reel precisa ter um ângulo editorial diferente. Não faça apenas pequenas trocas de palavras.\n\nEscolha ângulos diferentes como: erro comum, mito, caso prático, comparação, pergunta provocadora, passo a passo, bastidor, consequência, contrarianismo, história curta, dado/contexto ou aplicação prática. Use somente os que fizerem sentido para o tema.\n\nSe o usuário pedir frases, hooks ou ideias, produza frases específicas para o tema, não frases motivacionais genéricas. Nunca use enchimentos como "pouca gente fala disso", "comece por aqui", "isso pode mudar tudo", "salve este post" ou "compartilhe com alguém" a menos que sejam indispensáveis e não exista alternativa melhor.\n\nCada roteiro deve conter: título específico; hook curto e forte; corpo com informação concreta; exemplo específico do tema; ação aplicável; fechamento memorável. Não repita o mesmo verbo, argumento ou conclusão em todos os itens. Não invente fatos. Para Bíblia, use referências reais; para saúde, direito e finanças, seja responsável. Português brasileiro natural, sem linguagem robótica. Retorne somente JSON.`;
}

async function callClaude({idea,duration,style,count}) {
  const response=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":process.env.ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:process.env.ANTHROPIC_MODEL||"claude-sonnet-4-5",max_tokens:5000,system:generationInstructions({idea,duration,style,count}),messages:[{role:"user",content:`Tema: ${idea}`} ]})});
  if(!response.ok) throw new Error(`Claude API ${response.status}: ${await response.text()}`);
  const data=await response.json();
  const text=(data.content||[]).map(x=>x.text||"").join("\n");
  return {parsed:extractJson(text),mode:"claude"};
}

async function callPerplexity({idea,duration,style,count}) {
  const response=await fetch("https://api.perplexity.ai/chat/completions",{method:"POST",headers:{"content-type":"application/json","authorization":`Bearer ${process.env.PERPLEXITY_API_KEY}`},body:JSON.stringify({model:process.env.PERPLEXITY_MODEL||"sonar",messages:[{role:"system",content:generationInstructions({idea,duration,style,count})+" Use pesquisa web apenas quando necessário para fatos atuais."},{role:"user",content:`Tema: ${idea}`}],temperature:0.9})});
  if(!response.ok) throw new Error(`Perplexity API ${response.status}: ${await response.text()}`);
  const data=await response.json();
  const text=data.choices?.[0]?.message?.content||"";
  return {parsed:extractJson(text),mode:"perplexity"};
}

async function generateWithAI({idea,duration,style,count}) {
  try {
    const provider=(process.env.AI_PROVIDER||"").toLowerCase();
    let result;
    if((provider==="claude"||(!provider&&process.env.ANTHROPIC_API_KEY))&&process.env.ANTHROPIC_API_KEY) result=await callClaude({idea,duration,style,count});
    else if((provider==="perplexity"||(!provider&&process.env.PERPLEXITY_API_KEY))&&process.env.PERPLEXITY_API_KEY) result=await callPerplexity({idea,duration,style,count});
    else if(process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response=await client.responses.create({model:process.env.OPENAI_MODEL||"gpt-5.6-luna",instructions:generationInstructions({idea,duration,style,count}),input:cleanText(idea),text:{format:{type:"json_schema",name:"reels_generation",strict:true,schema:{type:"object",additionalProperties:false,properties:{reels:{type:"array",minItems:1,maxItems:10,items:{type:"object",additionalProperties:false,properties:{titulo:{type:"string"},hook:{type:"string"},body:{type:"string"},example:{type:"string"},action:{type:"string"},close:{type:"string"}},required:["titulo","hook","body","example","action","close"]}}},required:["reels"]}}}});
      result={parsed:extractJson(response.output_text||""),mode:"openai"};
    } else return {items:localScripts(idea,count),mode:"local-fallback"};
    if(!result.parsed?.reels?.length) throw new Error("A IA não retornou nenhum roteiro.");
    return {items:result.parsed.reels.slice(0,count),mode:result.mode};
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