# GOLD — Ginecologia e Obstetrícia (MedHub R1) — v2 qualidade R1

Padrão obrigatório para `scripts/_parts/go-*.json`.

**Estilo:** provas em `D:\MedHub R1\Provas\` (USP/UNIFESP/ENARE/SUS-SP).
**Conteúdo:** `D:\MedHub R1\Ginecologia\` e `D:\MedHub R1\Obstetricia\` + flashcards `data/flashcards-gin*.json` / `flashcards-obs*.json`.
Não copiar enunciados de prova. Casos originais.

## Schema
```json
{
  "idPrefix": "go-gin1",
  "n": 1,
  "group": "Endócrino / ciclo",
  "theme": "Nome do deck/subtema do flashcard",
  "stem": "...",
  "correct": "...",
  "wrongs": ["...", "...", "...", "..."],
  "explain": "...",
  "trap": "..."
}
```

## Grupos válidos (labels EXATOS dos flashcards / revisao.js)
**Ginecologia**
- Endócrino / ciclo
- SUA / miomatose
- Climatério / urogin
- Mastologia / ovário
- Oncoginecologia
- Infecto / IST

**Obstetrícia**
- Parto operatório · Med. fetal · Puerpério
- Diagnóstico de gravidez · Pré-natal
- Parto · RPMO · Prematuridade
- Sangramentos na gestação
- HAS · Diabetes · Gemelaridade

## Qualidade v2 (igual Cirurgia)
- Stem = vinheta clínica: paciente (mulher/gestante + idade) → contexto → história → achados → pergunta fechada (conduta/diagnóstico/próximo passo)
- Proibido boilerplate/padding e alternativas truncadas
- 1 correta + 4 near-miss íntegras; explain ≥ 100; trap ≥ 35
- `theme` deve refletir o subtema/deck do flashcard correspondente
- specialty no merge final: `go`
