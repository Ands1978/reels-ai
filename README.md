# ReelsAI — Netlify

Versão preparada para deploy no Netlify.

## Deploy
1. Crie um repositório no GitHub e envie estes arquivos.
2. No Netlify, escolha **Add new project / Import from Git**.
3. Selecione o repositório.
4. O Netlify detectará `netlify.toml`.
5. Publique.

Também é possível arrastar a pasta `public` para um deploy manual, mas as Functions exigem deploy do projeto completo.

## Importante
O Netlify não é o lugar ideal para renderização FFmpeg pesada e persistência de arquivos grandes.
Nesta versão:
- frontend: Netlify
- geração de roteiro: Netlify Function local/fallback
- renderização de MP4: deve ser ligada a um serviço externo de renderização ou worker quando você quiser vídeos reais em escala.

A versão atual funciona como demonstração sem API paga.
