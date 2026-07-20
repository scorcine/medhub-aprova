# Referências — Cirurgia (MedHub R1)

## Prioridade

| Ordem | Fonte | Uso |
|-------|--------|-----|
| **1 — PRIMARY** | Apostilas `D:\MedHub R1\Cirurgia\` (Cir1–Cir3, CirEsp) | Geração R1 por grupo |
| **2 — Crosswalk** | Manual de Cirurgia Geral e Digestiva + Emergência e Trauma | Síndromes / urgência |
| **3 — Deep-dive** | Sabiston 22nd | Mecanismo / protocolo detalhado |

Não versionar dumps grandes de PDF no repo. Extrair sob demanda:
```bash
node scripts/extract-clinica-ref.js "<caminho.pdf>" --pages A-B --out scripts/_tmp/sample.txt
```

---

## Apostilas (PRIMARY)

| Apostila | Caminho | Foco |
|----------|---------|------|
| **Cir1** | `D:\MedHub R1\Cirurgia\Cir1.pdf` | Vascular, procto, bariátrica, infantil, cabeça/pescoço |
| **Cir2** | `D:\MedHub R1\Cirurgia\Cir2.pdf` | Trauma (ATLS, tórax, abdome, TCE/pescoço) |
| **Cir3** | `D:\MedHub R1\Cirurgia\Cir3.pdf` | Pré/pós-op, hérnias, anestesia/técnica |
| **CirEsp** | `D:\MedHub R1\Cirurgia\CirEsp.pdf` | Resposta ao trauma, queimaduras, cicatrização, choque, nutrição |

---

## Livros (`D:\MedHub R1\Livros\Cirurgia`)

| Livro | Caminho absoluto | Uso |
|-------|------------------|-----|
| **Emergência e Trauma** | `D:\MedHub R1\Livros\Cirurgia\Cirurgia Geral - Emergência e Trauma.pdf` | Trauma, ATLS, choque, tórax/abdome agudo traumático (~104 MB) |
| **Manual Cirurgia Geral e Digestiva** | `D:\MedHub R1\Livros\Cirurgia\MANUAL+DE+CIRURGIA+GERAL+E+DIGESTIVA.pdf` | Abdome, digestivo, vias, colorretal (~22 MB) |
| **Sabiston 22nd** | `D:\MedHub R1\Livros\Cirurgia\Sabiston Textbook of Surgery 22nd Edition.pdf` | Deep-dive inglês (~507 MB) |

> Se o nome de “Emergência e Trauma” aparecer com encoding estranho no Explorer, use listagem via PowerShell `-LiteralPath` ou o caminho retornado por `Get-ChildItem`.

---

## Mapa grupo → fonte

| Grupo flashcard | Apostila | Livro complementar |
|-----------------|----------|-------------------|
| Trauma · ATLS e choque | Cir2 + CirEsp | Emergência e Trauma |
| Trauma torácico | Cir2 | Emergência e Trauma |
| Trauma abdominal e pelve | Cir2 | Emergência e Trauma |
| TCE · pescoço · face | Cir2 | Emergência e Trauma |
| Abdome agudo | Cir2/Cir3 | Manual Digestiva + Emergência |
| Pré-operatório | Cir3 | Sabiston (pré-op) |
| Pós-operatório e infecção | Cir3 | Sabiston / Manual |
| Hérnias da parede | Cir3 | Manual Digestiva |
| Anestesia e técnica | Cir3 | — |
| Cirurgia infantil | Cir1 | Sabiston ped chapters |
| Cirurgia vascular | Cir1 | Sabiston vascular |
| Digestivo alto e bariátrica | Cir1 | Manual Digestiva |
| Colorretal e proctologia | Cir1 | Manual Digestiva |
| Fígado e pâncreas | Cir1 | Manual Digestiva |
| Urologia | Cir1 | Sabiston uro |
| Tórax eletivo | Cir / cg-torax | Sabiston thoracic |
| Queimaduras e plástica | CirEsp | Emergência e Trauma |
| Cabeça/pescoço · mama · tireoide | Cir1 | Sabiston |
| Sepse · nutrição · miscelânea | CirEsp | Sabiston / Manual |

## Citação sugerida
```text
Fonte: Cir2 — <tema> (p. N)
Fonte: Manual Digestiva — <capítulo>
Fonte: Sabiston 22 — <capítulo> (deep-dive)
```
