# GOLD — Clínica médica (MedHub R1) — v2 qualidade R1

Padrão obrigatório para `scripts/_parts/cli-*.json` da whitelist v2.

**Estilo:** provas em `D:\MedHub R1\Provas\` (USP/UNIFESP/ENARE/SUS-SP).
**Conteúdo:** apostilas `D:\MedHub R1\CM\` + livros clínicos. Não copiar enunciados.

## Schema
```json
{
  "idPrefix": "cli-cardio1",
  "n": 1,
  "group": "Cardiologia",
  "theme": "Subtema curto",
  "stem": "...",
  "correct": "...",
  "wrongs": ["...", "...", "...", "..."],
  "explain": "...",
  "trap": "..."
}
```

## Grupos válidos (labels EXATOS do banco)
- Cardiologia
- Pneumologia
- Infectologia
- Neurologia
- Endocrinologia
- Nefrologia
- Hematologia
- Reumatologia
- Hepatologia
- Psiquiatria

## Qualidade v2
- Stem = vinheta: paciente (idade + sexo) → contexto (PS, enfermaria, ambulatorio, UTI) → história → achados (vitais/exame/labs/imagem) → pergunta fechada (conduta/diagnóstico/próximo passo)
- Proibido boilerplate/padding e alternativas truncadas
- 1 correta + 4 near-miss íntegras; explain ≥ 100; trap ≥ 35
- Sem `fitStem`/`fitOpt`
- specialty no merge: `clinica`
