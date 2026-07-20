# GOLD — Clínica médica (MedHub R1)

Padrão obrigatório para cada item em `scripts/_parts/cli-*.json`.

**Fontes (prioridade):** PDFs em `D:\MedHub R1\CM\<área>\` (Car/Inf/Pneumo/…). Ver `_REFS_CLINICA.md`. Complementar com `D:\MedHub R1\Livros\Clinica Medica\` (2025 sindrômico + Cecil). Extrair com `node scripts/extract-clinica-ref.js`. Não copiar enunciados; ancorar conduta clínica.

## Schema (array JSON)
```json
{
  "idPrefix": "cli-AREA#",
  "n": 1,
  "group": "NomeExatoDoGrupo",
  "theme": "Tema curto — subtítulo",
  "stem": "...",
  "correct": "...",
  "wrongs": ["...", "...", "...", "..."],
  "explain": "...",
  "trap": "..."
}
```

## Grupos válidos
Cardiologia | Infectologia | Pneumologia | Neurologia | Endocrinologia | Psiquiatria | Hematologia | Reumatologia | Nefrologia | Hepatologia

## Qualidade
- Stem denso estilo SUS-SP/ENAMED: **350–520** chars (contagem Unicode)
- 5 opções: `correct` + 4 `wrongs` near-miss, cada uma **120–165** chars
- **skew=0**: length(correct) não é o mínimo nem o máximo entre as 5
- Finais das opções distintos (não dá para chutar pelo formato)
- `explain` ≥ 120 chars; `trap` ≥ 40 chars
- pt-BR clínico; **sem** sigla nua **IVAS**
- Conteúdo original (não copiar enunciados de banca)
- Evitar repetir o mesmo `theme` já usado em partes anteriores da mesma área
- Sem boilerplate idêntico colado em todos os stems (variação clínica real)

## Validação antes de encerrar
Rodar checks de length/skew/JSON.parse; reportar **n=50** (ou n pedido) e ranges.
