# Sinal — versão Vercel (com QR dinâmico)

Mesma ferramenta de sempre: 4 tipos de QR (Link, Pix, WhatsApp, Instagram),
exportação em PNG/SVG/PDF, e QR dinâmico editável por link secreto — sem
cadastro, sem senha fixa.

A única mudança é onde ela roda: em vez de Netlify + Netlify Blobs, agora é
**Vercel + Upstash Redis** (outro banco de dados leve e gratuito).

## Passo a passo completo

### 1. Subir pro GitHub
Cria um repositório novo (ex: `sinal-vercel`) e sobe todos os arquivos desta
pasta: `index.html`, `favicon.svg`, `vercel.json`, `package.json`, e a pasta
`api/` inteira (com os 4 arquivos dentro: `create.js`, `update.js`,
`redirect.js`, `lookup.js`).

### 2. Conectar no Vercel
1. Entra em [vercel.com](https://vercel.com) e faz login (dá pra usar a
   conta do GitHub direto)
2. Clica em **Add New > Project**
3. Escolhe o repositório que você acabou de criar
4. Nas configurações, pode deixar tudo no padrão — não precisa mexer em
   build command nem output directory, o Vercel detecta sozinho
5. **Ainda não clica em Deploy** — antes, vai pro passo 3

### 3. Criar o banco de dados (Upstash Redis)
1. Ainda na tela de configuração do projeto (ou depois, em
   **Project Settings > Storage**), clica em **Storage** ou procura por
   **Marketplace** no menu do projeto
2. Procura **Upstash** e clica em **Add** / **Install**
3. Escolhe criar um banco Redis novo (gratuito) e vincula ao seu projeto
4. O Vercel vai configurar sozinho duas variáveis de ambiente
   (`KV_REST_API_URL` e `KV_REST_API_TOKEN`) — não precisa copiar nada na
   mão, é automático

### 4. Publicar
Agora sim, clica em **Deploy**. Em menos de um minuto o site está no ar,
com um link tipo `sinal-vercel.vercel.app`.

### 5. Testar
1. Abre o link do site
2. Gera um QR marcando **"Tornar este QR editável"**
3. Copia o link secreto de edição e guarda em lugar seguro
4. Escaneia o QR — deve redirecionar certo
5. Abre o link secreto guardado, troca o destino, confirma que atualizou
6. Escaneia o mesmo QR de novo — deve ir pro destino novo

## Diferenças da versão Netlify

- O link do QR dinâmico continua limpo: `seusite.vercel.app/r/codigo` (igual
  ao Netlify, diferente da versão Streamlit que precisa de `?r=codigo`)
- O banco (Upstash Redis) tem um plano grátis generoso: 256MB de
  armazenamento e 10 mil comandos por dia — muito acima do que uma
  ferramenta como essa costuma usar
- Se um dia o Vercel também tiver algum problema de plataforma, os dados
  ficam no Upstash, não no Vercel — então dá pra reconectar em outro lugar
  sem perder nada
