const API_KEY = "AIzaSyBPtaQDy9mgS4D0V0n_5eXRMdxI6ZOVr8E";


const inputText = document.getElementById('inputText');
const contextInput = document.getElementById('contextInput');
const btnTraduzir = document.getElementById('btnTraduzir');
const outputText = document.getElementById('outputText');
const resultArea = document.getElementById('resultArea');
const inputLabel = document.getElementById('inputLabel');
const contextBox = document.getElementById('contextBox');
const symbolToolbar = document.getElementById('symbolToolbar');
const radios = document.querySelectorAll('input[name="modo"]');


function handleModeChange(e) {
    const mode = e.target.value;
    resultArea.classList.add('hidden');
    outputText.innerText = "...";

    if (mode === 'cpc_to_nl') {
        contextBox.classList.remove('hidden');
        symbolToolbar.classList.remove('hidden');
        inputLabel.innerText = "Digite a Fórmula Lógica:";
        inputText.placeholder = "Use os botões: (P ∧ Q) → ¬R";
    } else {
        contextBox.classList.add('hidden');
        symbolToolbar.classList.add('hidden');
        inputLabel.innerText = "Digite a frase em Português:";
        inputText.placeholder = "Ex: Se eu estudar, passarei na prova.";
    }
}
radios.forEach(radio => radio.addEventListener('change', handleModeChange));

window.inserirSimbolo = function(simbolo) {
    const inicio = inputText.selectionStart;
    const fim = inputText.selectionEnd;
    const textoAtual = inputText.value;
    inputText.value = textoAtual.substring(0, inicio) + simbolo + textoAtual.substring(fim);
    inputText.focus();
    inputText.selectionEnd = inicio + simbolo.length;
}


async function obterModeloAtivo() {

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY.trim()}`;
    
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        
        if (!data.models) return "models/gemini-1.5-flash";


        const disponiveis = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        

        const escolhido = disponiveis.find(m => m.name.includes("flash")) || 
                          disponiveis.find(m => m.name.includes("pro")) || 
                          disponiveis[0];
                          
        console.log("Modelo detectado automaticamente:", escolhido.name);
        return escolhido.name; 
    } catch (e) {
        console.error("Erro no discovery:", e);
        return "models/gemini-1.5-flash";
    }
}

async function traduzir() {
    const texto = inputText.value.trim();
    const contexto = contextInput.value.trim();
    const modo = document.querySelector('input[name="modo"]:checked').value;

    if (!texto) { alert("⚠️ Digite o texto."); return; }

    btnTraduzir.disabled = true;
    btnTraduzir.innerText = "Conectando...";
    resultArea.classList.remove('hidden');
    outputText.innerText = "Negociando modelo com o Google...";

    try {
        const nomeModelo = await obterModeloAtivo();
        let systemInstruction = "";
        if (modo === 'nl_to_cpc') {
            systemInstruction = "Atue como especialista em Lógica. Converta a frase para Lógica Proposicional (use P, Q, R, S e ∧, ∨, ¬, →, ↔). Responda APENAS a fórmula.";
        } else {
            systemInstruction = `Atue como tradutor. Converta a fórmula para português. Contexto: ${contexto || "Geral"}. Responda apenas a frase.`;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/${nomeModelo}:generateContent?key=${API_KEY.trim()}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `${systemInstruction}\n\nEntrada: ${texto}` }] }]
            })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error?.message || "Erro na API");

        const respostaTexto = data.candidates[0].content.parts[0].text;
        outputText.innerText = respostaTexto;

    } catch (error) {
        console.error(error);
        outputText.innerText = `❌ Erro: ${error.message}`;
    } finally {
        btnTraduzir.disabled = false;
        btnTraduzir.innerText = "Traduzir";
    }
}


btnTraduzir.addEventListener('click', traduzir);
