# MedHub R1

Revisão programada para provas de **residência (R1)**: flashcards + banco de questões, feito para estudantes de medicina.

App **independente** do MedHub clínico (`meu-app-medico`). Integração (link, conta, conteúdo compartilhado) fica para quando o produto estiver pronto.

## Stack

HTML / CSS / JS estático — deploy na Vercel (mesmo modelo do MedHub).

## Como abrir no Cursor

1. **File → Open Folder** → `Desktop/medhub-aprova`
2. Abra um **Agent** nesta janela (não misture com o MedHub)
3. Peça features (SRS, filtros de especialidade, simulados, etc.)

## Rodar local

```bash
npm start
```

Abre em `http://localhost:4173`.

## Estrutura

| Pasta / arquivo | Função |
|-----------------|--------|
| `index.html` | Landing |
| `app.html` | Área de estudo |
| `js/flashcards.js` | Módulo de flashcards |
| `js/questions.js` | Módulo de questões |
| `js/schedule.js` | Revisão programada (SRS) |
| `data/` | Decks e questões (JSON) |

## Integração futura com MedHub

Quando estiver estável:

1. Publicar este app (ex.: `r1.medhub.ia.br` ou `medhub-aprova.vercel.app`)
2. No MedHub, adicionar entrada na landing estudantes apontando para cá
3. Opcional: login compartilhado e sync de progresso

## Status

Protótipo — landing + área de estudo (SRS, flashcards, questões).
