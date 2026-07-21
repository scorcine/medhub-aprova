# GOLD — Cirurgia (MedHub R1) — v2 qualidade R1

Padrão obrigatório para cada item em `scripts/_parts/cir-*.json`.

**Fontes de conteúdo:** apostilas `D:\MedHub R1\Cirurgia\` + livros em `D:\MedHub R1\Livros\Cirurgia\`.
**Fontes de estilo:** provas reais em `D:\MedHub R1\Provas\` (USP-SP, UNIFESP, ENARE, SUS-SP, FMABC, HIAE, SCMSP).
Não copiar enunciados de prova. Elaborar casos originais no mesmo padrão.

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

## Qualidade — obrigatório (v2)

### Stem = vinheta clínica (não conceito nu)
Todo stem deve ter, nesta ordem lógica:
1. **Paciente** — idade + sexo (ou neonato/criança quando infantil)
2. **Contexto** — PS, sala de trauma, enfermaria, ambulatorio, PO
3. **História** — tempo de evolução, queixa, mecanismo (trauma) ou quadro progressivo
4. **Achados** — exame dirigido e/ou vitais e/ou exame complementar pertinente
5. **Pergunta fechada** — conduta, diagnóstico mais provável, próximo passo, classificação+conduta

**Proibido:**
- Frases de preenchimento / boilerplate (`Reavaliar PA, FC…`, `Sem alergias conhecidas…`, `Exames em andamento não devem atrasar…`, `A equipe discute o próximo passo…`, etc.)
- Stem só conceitual (“Sobre apendicite, assinale…”) sem caso
- Duplicar a mesma frase no stem
- Cortar alternativas no meio da frase

**Comprimento sugerido (orientação, NÃO forçar com padding):**
- Stem: em geral **280–650** chars com conteúdo clínico real
- Opções: frases completas e homogêneas, tipicamente **60–180** chars — sem truncar
- `explain` ≥ 100; `trap` ≥ 35

### Alternativas
- 1 correta + 4 near-miss plausíveis (erro clássico de prova)
- Todas gramaticalmente completas
- Sem repetir o mesmo sufixo em todas as erradas (“o que atrasa o manejo correto” em loop)
- Sem pista por tamanho (evitar correta obviamente mais curta/longa), mas **sem** padding mecânico

### Conteúdo
- pt-BR clínico; alinhado a ATLS / diretrizes / apostilas Cir1–3
- Themes únicos na área; casos originais
- Uma ideia por questão

## Validação
JSON.parse OK; sem frases da lista negra de boilerplate; stem com idade OU “paciente/homem/mulher/neonato/criança” + achado clínico; 5 opções íntegras.
