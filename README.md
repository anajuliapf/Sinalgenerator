# Sinal

Gerador de QR codes para Link, Pix, WhatsApp e Instagram — com QR dinâmico
(editável depois de impresso), sem cadastro e sem senha.

🔗https://sinalgenerator-vercel.vercel.app/

## O problema

Precisei gerar um QR code pra divulgar um evento, e toda ferramenta que
encontrei tinha o mesmo padrão: pedia login, cobrava depois de um tempo, ou
o QR simplesmente expirava. E nenhuma delas resolvia o problema mais óbvio —
se o link mudasse depois de impresso, o QR inteiro virava lixo.

## O que ele faz

→ Criei 4 tipos de QR: link genérico, Pix (implementando o padrão BR Code do Banco Central do zero), WhatsApp (com mensagem pré-preenchida) e Instagram.
→ Resolvi o problema do QR "que não pode mudar" com QR dinâmico: o código impresso aponta pra um redirecionamento que eu controlo, então o destino pode ser trocado depois — sem precisar reimprimir nada.
→ Pra isso, sem virar uma dor de cabeça de conta/senha, desenhei um sistema de edição por link secreto (parecido com o "editar resposta" do Google Forms): sem login, sem cadastro, só posse de um link único gerado na hora da criação.
→ Depois vieram as exportações: PNG pra uso rápido, e SVG/PDF desenhados como vetor de verdade (não imagem embutida), pra imprimir sem perder qualidade em qualquer tamanho — de etiqueta a banner.
→ Sem cadastro, sem senha: O Sinal é 100% gratuito, sem cadastro, sem limite escondido, e estou disponibilizando aqui pra quem quiser usar. Se você tem um pequeno negócio, vende algum produto, ou só precisa colocar um link em algum lugar pras pessoas escanearem, ele resolve exatamente esse problema que sempre me incomodou nos geradores de QRs.
→ Tudo isso rodando 100% grátis: frontend estático + funções serverless + banco leve, sem servidor pra manter.

📈 RESULTADO Uma ferramenta funcional, no ar, publicada e testada ponta a ponta — do gerador de QR até a lógica de redirecionamento e a validação do CRC do payload do Pix.

## Como foi construído

O Pix foi a parte mais interessante tecnicamente: implementei o padrão BR
Code do Banco Central do zero — o payload EMV com todos os campos TLV
(chave, nome, cidade, valor) e o checksum CRC16, testado byte a byte antes
de confiar que qualquer banco reconheceria o QR gerado.

O QR dinâmico foi o problema de arquitetura mais interessante: como editar
o destino sem forçar login? A solução foi separar duas coisas — um código
público curto (o que fica visível, dentro do QR) e um token secreto de alta
entropia, gerado uma única vez e nunca reexibido. Só o hash do token fica no
banco; nem uma cópia do banco vazada revelaria o token original. Posse do
link secreto é a única forma de provar que alguém pode editar aquele QR
específico.

As exportações em SVG e PDF desenham a matriz do QR direto como formas
vetoriais (retângulos), a partir dos mesmos dados binários que geram o PNG —
em vez de embutir uma imagem raster dentro de um SVG ou PDF, que perderia
nitidez em qualquer escala maior que a original.

## Arquitetura

- **Frontend**: HTML/CSS/JS puro, sem framework
- **Backend**: funções serverless (Vercel Functions)
- **Banco de dados**: Upstash Redis (armazena o código → destino → hash do
  token de edição)
- **Geração de QR**: matriz própria, renderizada em três formatos (raster
  pro PNG, vetor pro SVG e PDF)

Tudo rodando de graça, sem servidor fixo pra manter.

## Sobre a versão que você está vendo

Esse projeto já passou por duas hospedagens diferentes durante o
desenvolvimento (começou no Netlify, migrou pra Vercel), e por decisões de
design que mudaram no meio do caminho — inclusive o próprio modelo de
autenticação, que passou por três abordagens diferentes até chegar no link
secreto sem cadastro. Documentei isso porque o processo de errar o modelo
duas vezes antes de achar o certo fez parte real da construção.
