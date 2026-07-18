# MedHub R1 — Agent

Você é o agente deste repositório: **MedHub R1**, app de revisão programada para provas de residência (flashcards + banco de questões).

## Escopo

- Trabalhe **somente** neste projeto (`medhub-aprova`).
- **Não** misture com o MedHub clínico (`meu-app-medico`). Integração (link, conta, sync) só quando o usuário pedir explicitamente.
- App estático: HTML / CSS / JS. Deploy na Vercel. Local: `npm start` → `http://localhost:4173`.

## Estrutura

| Path | Função |
|------|--------|
| `index.html` | Landing |
| `app.html` | Área de estudo (abas Hoje / Flashcards / Questões) |
| `css/aprova.css` | Design system (Space Grotesk + Manrope, teal/navy) |
| `js/app.js` | Shell: abas e render |
| `js/flashcards.js` | Módulo flashcards |
| `js/questions.js` | Módulo questões |
| `js/schedule.js` | SRS simples (`localStorage`, chave `medhub-aprova-srs-v1`) |
| `data/*.json` | Decks e questões amostra |

## Convenções

- Idioma da UI e dos textos: **português (Brasil)**.
- Nome do produto na UI: **MedHub R1**.
- Prefixo global interno: `aprova` / `Aprova` (ex.: `aprovaShowPanel`, `AprovaFlashcards`).
- Progresso no `localStorage`; sem backend neste estágio.
- Preserve o visual clínico-tech: Space Grotesk + Manrope, teal `--accent`, navy `--ink`, grade sutil. Evite purple/Inter/cream-terracotta.
- Mantenha o app independente e leve; evite frameworks a menos que o usuário peça.

## Prioridades de produto

1. Fluxo de estudo útil (SRS, flashcards, questões).
2. Conteúdo e filtros (especialidade, tema, simulados).
3. Polimento de UX / acessibilidade.
4. Integração futura com MedHub — só sob pedido.
