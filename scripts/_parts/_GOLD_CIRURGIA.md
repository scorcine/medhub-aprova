# GOLD — Cirurgia (MedHub R1)

Padrão obrigatório para cada item em `scripts/_parts/cir-*.json`.

**Fontes:** PRIMARY apostilas `D:\MedHub R1\Cirurgia\` (Cir1–3, CirEsp). Complementar: `D:\MedHub R1\Livros\Cirurgia\` (Emergência e Trauma, Manual Digestiva, Sabiston 22). Ver `_REFS_CIRURGIA.md`. Extrair com `node scripts/extract-clinica-ref.js`. Não copiar enunciados.

## Schema (array JSON)
```json
{
  "idPrefix": "cir-slug",
  "n": 1,
  "group": "NomeExatoDoGrupoFlashcard",
  "theme": "Tema curto — subtítulo",
  "stem": "...",
  "correct": "...",
  "wrongs": ["...", "...", "...", "..."],
  "explain": "...",
  "trap": "..."
}
```

## Grupos válidos (labels exatos dos flashcards)
Abdome agudo | Trauma · ATLS e choque | Trauma torácico | Trauma abdominal e pelve | TCE · pescoço · face | Pré-operatório | Pós-operatório e infecção | Hérnias da parede | Anestesia e técnica | Cirurgia infantil | Cirurgia vascular | Digestivo alto e bariátrica | Colorretal e proctologia | Fígado e pâncreas | Urologia | Tórax eletivo | Queimaduras e plástica | Cabeça/pescoço · mama · tireoide | Sepse · nutrição · miscelânea

## Qualidade
- Stem denso estilo SUS-SP/ENAMED: **350–520** chars (Unicode)
- 5 opções: `correct` + 4 `wrongs` near-miss, cada uma **120–165** chars
- **skew=0**: length(correct) não é mínimo nem máximo entre as 5
- Finais das opções distintos
- `explain` ≥ 120; `trap` ≥ 40
- pt-BR clínico; sem IVAS nua
- Conteúdo original; themes únicos na área; sem boilerplate idêntico em todos os stems

## Validação
JSON.parse OK; reportar **n** pedido + ranges stem/opts + skew=0.
