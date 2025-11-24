 # Tradutor Lógico -- Agente de IA via Navegador

  Este projeto implementa um **agente de tradução lógica** capaz de
  converter:

  -   **Linguagem natural -> Lógica Proposicional (CPC)**
  -   **Lógica Proposicional (CPC) -> Linguagem natural**

  O sistema roda inteiramente no navegador e utiliza a API do **Google
  Gemini** para realizar a interpretação semântica das frases.

  ------------------------------------------------------------------------

  # Arquitetura do Sistema

  A aplicação segue uma arquitetura **client--side**, simples e totalmente
  executada no navegador.

  ``` txt
  ┌──────────────────────────────┐
  │          index.html          │
  │ (estrutura da interface UI)  │
  └───────────────┬──────────────┘
                  │
  ┌───────────────▼──────────────┐
  │          styles.css           │
  │ (estilização, dark theme,     │
  │  layout responsivo)           │
  └───────────────┬──────────────┘
                  │
  ┌───────────────▼──────────────┐
  │          script.js            │
  │ Lógica principal:             │
  │ • Seleção de modo (NL ⇄ CPC)  │
  │ • Inserção de símbolos lógicos│
  │ • Chamada à API do Gemini     │
  │ • Tratamento de resposta      │
  └───────────────┬──────────────┘
                  │
  ┌───────────────▼────────────────────────────┐
  │   API Google Gemini (generateContent)       │
  │   • Interpretação semântica                 │
  │   • Tradução NL → CPC                       │
  │   • Tradução CPC → NL                       │
  └─────────────────────────────────────────────┘
  ```

  ------------------------------------------------------------------------

  ### ✔ Explicação do Funcionamento

  1.  O usuário seleciona o modo (Português -> Lógica ou Lógica ->
      Português).
  2.  O `script.js` ajusta a interface (toolbar, contexto e placeholder).
  3.  Ao clicar em "Traduzir":
      -   coleta o texto inserido
      -   identifica o modo escolhido
      -   monta automaticamente uma *system instruction*
  4.  O sistema identifica o melhor modelo Gemini disponível via API
      Discovery.
  5.  Envia a requisição `generateContent` com a instrução + entrada.
  6.  A resposta do Gemini contém **apenas a fórmula** ou **apenas a
      frase**, conforme o modo.
  7.  O resultado é exibido dinamicamente na interface.

  ------------------------------------------------------------------------

  # Estratégia de Tradução

  A tradução é dividida em dois modos: 1. Português -> Lógica Proposicional
  2. Lógica Proposicional -> Português

  ------------------------------------------------------------------------

  ## 1. Tradução de Português para Lógica Proposicional (NL -> CPC)

  O sistema envia ao modelo a seguinte instrução:

  > "Converta a frase para Lógica Proposicional usando P, Q, R, S\
  > e os conectivos ∧, ∨, ¬, →, ↔.\
  > Responda **somente a fórmula**."

  ### Regras usadas

    Linguagem Natural   Símbolo
    ------------------- ---------
    e, mas              ∧
    ou                  ∨
    não                 ¬
    se ... então        →
    se e somente se     ↔

  ------------------------------------------------------------------------

  ## 2. Tradução de Lógica Proposicional para Português (CPC -> NL)

  O sistema envia a instrução:

  > "Converta a fórmula para linguagem natural.\
  > Contexto: (variáveis definidas pelo usuário).\
  > Responda apenas a frase."

  ### Estratégia utilizada

  -   ∧ -> "e"
  -   ∨ -> "ou"
  -   ¬P -> "não P"
  -   P -> Q -> "se P, então Q"
  -   P <-> Q -> "P se e somente se Q"

  ------------------------------------------------------------------------

  # Uso da API Gemini

  1.  O script detecta automaticamente o melhor modelo disponível.
  2.  Envia a requisição:

  ``` js
  fetch(`https://generativelanguage.googleapis.com/v1beta/${modelo}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { parts: [{ text: `${systemInstruction}

  Entrada: ${texto}` }] }
      ]
    })
  });
  ```

  3.  Coleta o texto:

  ``` js
  data.candidates[0].content.parts[0].text
  ```

  4.  Exibe na interface.

  ------------------------------------------------------------------------

  # Conclusão

  O sistema combina:

  -   Interface leve e intuitiva
  -   Inserção simples de símbolos lógicos
  -   Tradução contextualizada via Gemini
  -   Arquitetura 100% client-side

  Criando assim um agente lógico funcional, rápido e eficiente para o
  navegador.

=================================================================================================================

Mapeamento básico:
não → ¬P
e / mas → P ∧ Q
ou (inclusivo) → P ∨ Q
ou… ou… (exclusivo) → (P ∨ Q) ∧ ¬(P ∧ Q)
se… então… → P → Q
somente se / é necessário que → P → Q
se e somente se → P ↔ Q

Processo:
A LLM identifica proposições simples (P, Q, R...).
Reduz frases complexas para proposições básicas.
Usa somente: ¬, ∧, ∨, →, ↔.

Mapeamento reverso:
¬P → “não P”
P ∧ Q → “P e Q”
P ∨ Q → “P ou Q”
P → Q → “se P, então Q”
P ↔ Q → “P se e somente se Q”

Uso do contexto:
Se o usuário fornece:
P=Estudar, Q=Passar na prova
A saída se torna natural:
(P → Q) → “Se eu estudar, então passarei na prova.”

LLM:
O sistema pergunta à API quais modelos estão disponíveis.
Ele escolhe automaticamente:
um modelo rápido (flash),
se não tiver, um mais avançado (pro),
se nada disso existir, usa o primeiro da lista.
Isso evita erros e garante que sempre exista um modelo funcionando.

Quando o usuário escreve uma frase em português
Dizemos para a IA:
“Transforme isso em lógica proposicional. Só use ¬, ∧, ∨, →, ↔ e variáveis P, Q, R. Responda só a fórmula.”
A IA analisa a frase e cria a estrutura lógica.

Quando o usuário escreve uma fórmula lógica
Dizemos para a IA:
“Traduza isso para português usando o contexto (ex.: P = Estudar). Responda só a frase.”
A IA substitui P, Q, R pelo significado e monta uma frase natural.

=================================================================================================================

Discussão sobre limitações e possibilidades de melhoria:

Limitações:
Dependência total da IA:
A lógica usada não é validada por regras internas; se a IA interpretar errado, o sistema aceita mesmo assim.
Ambiguidade em frases naturais:
Frases com duplo sentido podem gerar fórmulas erradas, porque o modelo “chuta” a interpretação mais provável.
Sem verificação sintática da fórmula lógica:
O usuário pode digitar algo inválido como P ∧ → Q e a IA tenta interpretar mesmo assim.
Uso fixo de P, Q, R...
Em frases mais complexas, a limitação de poucas variáveis pode atrapalhar.
Conectivo “ou” sem distinção entre inclusivo/exclusivo:
A IA escolhe a interpretação mais comum (inclusiva), mas não pergunta ao usuário qual é a desejada.
Contexto limitado:
Quando o usuário não define o contexto das variáveis, a IA precisa inventar significados genéricos.


Possibilidades de Melhoria:
Adicionar validação de sintaxe lógica:
Um parser simples (ex.: algoritmo de pilha) poderia verificar se a fórmula é válida antes de enviar para IA.
Expansão automática de variáveis:
Gerar P, Q, R, S, T… conforme necessário, em vez de ficar limitado aos primeiros símbolos.
Detecção de ambiguidade:
A IA poderia responder:
“Essa frase é ambígua. Você quis dizer A ou B?”
Modo “explicação opcional”:
Adicionar botão “ver explicação” permitindo que a IA mostre raciocínio sem poluir o resultado principal.
Cache de traduções:
Para frases repetidas, evitar chamadas desnecessárias à API.
Melhor tratamento de erros:
Mensagens mais claras quando a API falhar ou quando o usuário digitar algo impossível de traduzir.
Interface de edição:
Permitir ao usuário editar proposições identificadas pela IA (ex.: P = chover, Q = molhar).

=================================================================================================================

 
