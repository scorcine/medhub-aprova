# GOLD — Pediatria (MedHub R1) — v2 qualidade R1

Padrão obrigatório para `scripts/_parts/ped-*.json`.

**Estilo:** provas em `D:\MedHub R1\Provas\` (USP/UNIFESP/ENARE/SUS-SP).
**Conteúdo:** apostilas/flashcards de Pediatria + módulos em `js/revisao.js`.
Não copiar enunciados de prova. Casos originais.

## Schema
```json
{
  "idPrefix": "ped-neo1",
  "n": 1,
  "group": "Neonatologia",
  "theme": "Subtema curto",
  "stem": "...",
  "correct": "...",
  "wrongs": ["...", "...", "...", "..."],
  "explain": "...",
  "trap": "..."
}
```

## Grupos válidos (labels EXATOS)
- Neonatologia
- Puericultura e prevenção
- Infectologia pediátrica
- Pneumologia pediátrica
- Gastroenterologia pediátrica
- Emergências pediátricas
- Nefrologia pediátrica
- Endocrinologia pediátrica
- Cardiologia pediátrica
- Neurologia pediátrica
- Hematologia e imunologia
- Reumatologia pediátrica
- Maus-tratos / proteção

## Qualidade v2
- Stem = vinheta: paciente pediátrico (idade em dias/meses/anos OU RN/lactente/escolar) → contexto (PS, UBS, enfermaria, sala de parto) → história → achados → pergunta fechada (conduta/diagnóstico/próximo passo)
- Proibido boilerplate/padding e alternativas truncadas
- 1 correta + 4 near-miss íntegras; explain ≥ 100; trap ≥ 35
- Sem `fitStem`/`fitOpt`
- specialty no merge: `pediatria`
