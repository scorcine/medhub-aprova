# Referências — Clínica Médica (MedHub R1)

Mapa local para agentes gerarem flashcards/questões a partir das fontes em disco.
**Não** versionar dumps grandes de texto PDF no repositório.

## Prioridade de fontes

| Prioridade | Fonte | Uso |
|------------|--------|-----|
| **1 — PRIMARY** | Apostilas `D:\MedHub R1\CM\<especialidade>\` | Geração de questões/flashcards R1 (conteúdo por grupo) |
| **2 — Crosswalk** | Clínica Médica 2025 | Abordagem sindrômica; cruzar tema ↔ síndrome / páginas |
| **3 — Deep-dive** | Cecil (Goldman-Cecil PT) | Só quando a apostila CM for rasa ou o tópico exigir mecanismo/protocolo raro |

Regras:

1. Preferir **apostilas CM** do grupo MedHub correspondente.
2. Usar **Clínica Médica 2025** para encaixar síndrome / alto rendimento e citar página do sumário.
3. Usar **Cecil** apenas como deep-dive complementar — declarar as duas fontes.
4. Não colar blocos longos do PDF no repo; extrair sob demanda com `scripts/extract-clinica-ref.js`.

---

## Fontes secundárias (livros)

| Fonte | Caminho absoluto | Tamanho aprox. | Páginas |
|-------|------------------|----------------|---------|
| Clínica Médica 2025 (sindrômica) | `D:\MedHub R1\Livros\Clinica Medica\Clínica Médica 2025.pdf` | ~14 MB | 138 |
| Cecil (Goldman-Cecil Medicina Interna PT) | `D:\MedHub R1\Livros\Clinica Medica\CLÍNICA_MÉDICA_PORTUGUÊS_CECIL_Medicina.pdf` | ~131 MB | 9464 |

Identidade 2025: *Clínica Médica — Abordagem Sindrômica (2025)* (@casalmedresumos). Sem outline embutido; sumário nas pp. 4–5.

Cecil: outline embutido só divide Parte 1 / Parte 2 — usar índice/busca por tema, não TOC do viewer.

---

## PRIMARY — Apostilas CM por grupo MedHub

Raiz confirmada em disco: `D:\MedHub R1\CM\`

Nomes de arquivo abaixo são **exatos** (`-LiteralPath`). Em Infectologia, o volume 4 é `INf4.pdf` (N maiúsculo).

### Cardiologia

- `D:\MedHub R1\CM\Cardiologia\Car1.pdf`
- `D:\MedHub R1\CM\Cardiologia\Car2.pdf`
- `D:\MedHub R1\CM\Cardiologia\Car3.pdf`

### Endocrinologia

- `D:\MedHub R1\CM\Endocrinologia\End1.pdf`
- `D:\MedHub R1\CM\Endocrinologia\End2.pdf`
- `D:\MedHub R1\CM\Endocrinologia\End3.pdf`

### Hematologia

- `D:\MedHub R1\CM\Hematologia\Hem1.pdf`
- `D:\MedHub R1\CM\Hematologia\Hem2.pdf`
- `D:\MedHub R1\CM\Hematologia\Hem3.pdf`

### Hepatologia

- `D:\MedHub R1\CM\Hepatologia\Hep1.pdf`
- `D:\MedHub R1\CM\Hepatologia\Hep2.pdf`
- `D:\MedHub R1\CM\Hepatologia\Hep3.pdf`
- `D:\MedHub R1\CM\Hepatologia\Hep4.pdf`

### Infectologia

- `D:\MedHub R1\CM\Infectologia\Inf1.pdf`
- `D:\MedHub R1\CM\Infectologia\Inf2.pdf`
- `D:\MedHub R1\CM\Infectologia\Inf3.pdf`
- `D:\MedHub R1\CM\Infectologia\INf4.pdf`
- `D:\MedHub R1\CM\Infectologia\Inf5.pdf`

### Nefrologia

- `D:\MedHub R1\CM\Nefrologia\Nefro 1.pdf`
- `D:\MedHub R1\CM\Nefrologia\Nefro 2.pdf`
- `D:\MedHub R1\CM\Nefrologia\Nefro 3.pdf`
- `D:\MedHub R1\CM\Nefrologia\Nefro 4.pdf`
- `D:\MedHub R1\CM\Nefrologia\Nefro 5.pdf`

### Neurologia

- `D:\MedHub R1\CM\Neurologia\Neurologia.pdf`

### Pneumologia

- `D:\MedHub R1\CM\Pneumologia\Pneumo1.pdf`
- `D:\MedHub R1\CM\Pneumologia\Pneumo2.pdf` — amostrado: **85** páginas (sem outline embutido)

### Psiquiatria

- `D:\MedHub R1\CM\Psiquiatria\Psi.pdf` — amostrado: **81** páginas (sem outline embutido)

### Reumatologia

- `D:\MedHub R1\CM\Reumatologia\REU1.pdf`
- `D:\MedHub R1\CM\Reumatologia\REU2.pdf`
- `D:\MedHub R1\CM\Reumatologia\REU3.pdf`

### Fora dos 10 grupos (opcional)

**Dermatologista** — presente em `CM\`, mas **não** faz parte dos 10 grupos MedHub R1:

- `D:\MedHub R1\CM\Dermatologista\Der1.pdf`

Usar só se o card/questão for explicitamente de dermatologia; não misturar no pipeline dos 10 grupos.

---

## Como citar (agentes)

Apostila CM (preferida):

```text
Fonte: CM <Especialidade> — <arquivo> (<tema>; p. N se conhecido)
```

Exemplos:

- `Fonte: CM Cardiologia — Car2.pdf (IC / SCA)`
- `Fonte: CM Pneumologia — Pneumo2.pdf (p. 12)`
- `Fonte: CM Nefrologia — Nefro 3.pdf (eletrólitos)`

Crosswalk sindrômico:

```text
Fonte: Clínica Médica 2025 — <capítulo/síndrome> (p. N)
```

Deep-dive:

```text
Fonte: Cecil (Goldman-Cecil) — <tema>; complementar a CM <Especialidade> / Clínica Médica 2025
```

---

## Extração local

| Ferramenta | Status |
|------------|--------|
| Node.js | OK (v24+) |
| pdfjs-dist (npm) | OK — usado pelo helper |
| python / pip / pypdf | ausente |
| pdftotext / mutool | ausente |

```bash
# outline / page count
node scripts/extract-clinica-ref.js "D:\MedHub R1\CM\Psiquiatria\Psi.pdf" --outline

# intervalo de páginas (RAG pontual)
node scripts/extract-clinica-ref.js "<caminho.pdf>" --pages 6-12 --out scripts/_tmp/sample.txt
```

Dependência: `pdfjs-dist` no projeto (`npm install pdfjs-dist`). Manter amostras em `scripts/_tmp/` < ~200 KB.

---

## Crosswalk — Clínica Médica 2025 → grupos MedHub

Números = página inicial no PDF 2025 (sumário). Usar **depois** de escolher a apostila CM do grupo.

| Grupo MedHub | Cobertura no 2025 | Capítulos / tópicos (p.) |
|--------------|-------------------|---------------------------|
| Hepatologia | Forte | Ictérica I — Hepatites (6); Ictérica II — Colestase (12); Abscesso hepático (76) |
| Endocrinologia | Forte | Metabólica I — HAS, Dislipidemia (29); II — DM, Obesidade (34); Endócrinas I–III (46–58) |
| Infectologia | Forte | Pneumonias (61); Síndromes bacterianas (71); Imunodeficiência (78); Febris (87); TB/micoses (96–100) |
| Pneumologia | Forte | Pneumonias (61); Tosse crônica (96); Dispneica (102) |
| Neurologia | Forte | Neurovascular — AVE (112); Epiléptica (122); Fraqueza (124); Cefaleias (129) |
| Cardiologia | Parcial no 2025 | HAS (29); Endocardite (71); TEP (102); HAP (111) — detalhe em Car1–3 |
| Nefrologia | Fraca no 2025 | ITU (74) — detalhe em Nefro 1–5 |
| Hematologia | Fraca no 2025 | Hemólise na icterícia — detalhe em Hem1–3 |
| Reumatologia | Ausente no 2025 | Usar REU1–3 |
| Psiquiatria | Ausente no 2025 | Usar Psi.pdf |

### Ainda no 2025, transversal

- **Síndrome diarreica (18)** — GI / infecto-GI conforme o card.
- Conteúdo transversal (ex.: síndrome metabólica) pode mapear a mais de um grupo.

### Sumário completo (2025)

1. Síndrome ictérica I — Hepatites — p. 6  
2. Síndrome ictérica II — Colestase — p. 12  
3. Síndrome diarreica — p. 18  
4. Síndrome metabólica I (HAS, Dislipidemia) — p. 29  
5. Síndrome metabólica II (DM, Obesidade) — p. 34  
6. Síndromes endócrinas I — Tireoide — p. 46  
7. Síndromes endócrinas II (Adrenal, Paratireoide) — p. 51  
8. Síndromes endócrinas III (Metabolismo ósseo, Hipófise/Hipotálamo) — p. 58  
9. Pneumonias e influenza — p. 61  
10. Grandes síndromes bacterianas — p. 71  
11. Síndromes de imunodeficiência — p. 78  
12. Síndromes febris — p. 87  
13. Tosse crônica — p. 96  
14. Síndrome dispneica — p. 102  
15. Síndrome neurovascular — AVE — p. 112  
16. Síndrome epiléptica — p. 122  
17. Fraqueza muscular — p. 124  
18. Cefaleias — p. 129  

---

## Uso recomendado por agente

1. Escolher o **grupo MedHub** e abrir o(s) PDF(s) CM listados acima (PRIMARY).
2. Se precisar de encaixe sindrômico / alto rendimento, cruzar com a tabela 2025 (página inicial) e extrair só o intervalo (`--pages`).
3. Gerar cards no padrão MedHub R1; citar apostila CM + tema (+ página se conhecida).
4. Se o tópico for raso na CM, complementar com Cecil e declarar as fontes.
5. Não usar Dermatologista no fluxo dos 10 grupos, salvo pedido explícito.

---
*Gerado para agentes MedHub R1. Extratos temporários: `scripts/_tmp/` (não versionar dumps grandes).*