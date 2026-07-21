# GOLD — Preventiva (MedHub R1) — v2 qualidade R1

Padrão para `scripts/_parts/prev-*.json`.

**Estilo:** provas em `D:\MedHub R1\Provas\` + decisões em APS/UBS/vigilância.
**Conteúdo:** `D:\MedHub R1\Preventiva\` (se existir) + flashcards `data/flashcards-prev*.json`.
Não copiar enunciados. Casos originais.

## Schema
Igual Cirurgia/GO: idPrefix, n, group, theme, stem, correct, wrongs[4], explain, trap.

## Grupos válidos (labels EXATOS dos flashcards / revisao.js)
- SUS · APS · programas
- Epidemiologia · estudos · testes
- Vigilância · HND · ética
- Indicadores · mortalidade · Swaroop-Uemura

## Qualidade v2
- Stem = **vinheta de decisão** (não definição seca):
  - personagem (médico de família, enfermeiro, gestor, paciente com idade) + cenário (UBS, sala de vacina, vigilância, conselho) + dados + pergunta fechada (conduta, interpretação, próximo passo)
- Para epidemiologia: preferir cenário com números (tabela mental: VP/FP/FN/VN, RR, OR) embutidos na vinheta
- Proibido boilerplate de padding Cirurgia
- 1 correta + 4 near-miss; explain ≥ 100; trap ≥ 35
- `theme` = nome do deck do flashcard correspondente
- specialty no merge: `preventiva`
- **Anti-viés de tamanho:** as 5 alternativas devem ter comprimento parecido. A correta **não** pode ser sistematicamente a mais longa/completa. Distratores também são frases fechadas e informativas (near-miss), não “versões curtas”.
