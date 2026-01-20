javascript:(function(){
    // CONFIGURAÇÃO GEMINI - COLE SUA CHAVE AQUI!
    const API_KEY = 'AIzaSyC_-hhP--Z9ttDrC7LNIRvoUT74qLyn5BI'; // ← Obtenha em: https://aistudio.google.com/
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;
    
    // Verificar chave
    if(!API_KEY || API_KEY === 'SUA_CHAVE_GEMINI_AQUI') {
        alert('❌ CONFIGURE SUA API KEY GEMINI!\n\n1. Acesse: https://aistudio.google.com/\n2. Crie uma API Key\n3. Cole no código onde diz "SUA_CHAVE_GEMINI_AQUI"');
        return;
    }
    
    // CSS do Destroyer
    const css = `
    .wag-destroyer { 
        position: fixed; top: 10px; right: 10px; width: 450px; height: 600px; 
        background: #000; border: 3px solid #4285f4; z-index: 9999; color: white;
        font-family: Arial; display: flex; flex-direction: column; 
    }
    .wag-header { 
        background: #4285f4; padding: 10px; color: white; font-weight: bold;
        display: flex; justify-content: space-between; 
    }
    .wag-messages { 
        flex: 1; padding: 15px; overflow-y: auto; background: #111; 
    }
    .wag-message { 
        margin: 10px 0; padding: 8px; border-radius: 5px; max-width: 90%; 
    }
    .wag-user { background: #333; margin-left: auto; }
    .wag-ai { background: #1a73e8; margin-right: auto; }
    .wag-input-area { 
        padding: 15px; background: #222; display: flex; gap: 10px; 
    }
    .wag-input { 
        flex: 1; padding: 10px; background: #333; color: white; border: 1px solid #4285f4; 
    }
    .wag-send { 
        background: #4285f4; color: white; border: none; padding: 10px 15px; cursor: pointer; 
    }
    .wag-typing { color: #4285f4; padding: 10px; display: none; }
    `;

    // HTML
    const html = `
    <div class="wag-destroyer" id="wagDestroyer">
        <div class="wag-header">
            <span>🤖 WagroundDestroyerIA (Gemini)</span>
            <button onclick="document.getElementById('wagDestroyer').remove()" style="background:red; color:white; border:none; padding:2px 8px;">X</button>
        </div>
        <div class="wag-messages" id="wagMessages">
            <div class="wag-message wag-ai">
                <strong>✅ Gemini Configurado!</strong><br>
                Pronto para analisar tarefas do WayGround.
            </div>
        </div>
        <div class="wag-typing" id="wagTyping">🤖 Gemini analisando...</div>
        <div class="wag-input-area">
            <input type="text" class="wag-input" id="wagInput" placeholder="Pergunte sobre a tarefa...">
            <button class="wag-send" id="wagSend">Enviar</button>
        </div>
    </div>
    `;

    // Remover se já existir
    if(document.getElementById('wagDestroyer')) {
        document.getElementById('wagDestroyer').remove();
        return;
    }

    // Injeta CSS e HTML
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', html);

    // FUNÇÃO PARA EXTRAIR CÓDIGO DA PÁGINA
    function extractPageContent() {
        return `
TÍTULO: ${document.title}
URL: ${location.href}

TEXTO DA PÁGINA:
${document.body.innerText.substring(0, 2000)}

HTML (trecho):
${document.documentElement.outerHTML.substring(0, 1000)}
        `;
    }

    // FUNÇÃO CHAMAR GEMINI API (CORRIGIDA)
    async function callGeminiAI(userMessage) {
        try {
            const pageContent = extractPageContent();
            
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Você é um especialista em analisar tarefas de programação. 

ANALISE esta página web e RESPONDA a pergunta do usuário de forma técnica e precisa.

CONTEÚDO DA PÁGINA:
${pageContent}

PERGUNTA DO USUÁRIO: ${userMessage}

RESPONDA de forma direta e técnica, focando na resolução da tarefa:`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                return '❌ Resposta inesperada da API Gemini';
            }

        } catch (error) {
            return `❌ Erro Gemini: ${error.message}`;
        }
    }

    // FUNÇÕES DO CHAT
    function addMessage(text, sender) {
        const messages = document.getElementById('wagMessages');
        const msg = document.createElement('div');
        msg.className = `wag-message wag-${sender}`;
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage() {
        const input = document.getElementById('wagInput');
        const message = input.value.trim();
        
        if (!message) return;

        addMessage(message, 'user');
        input.value = '';

        const typing = document.getElementById('wagTyping');
        typing.style.display = 'block';

        try {
            const response = await callGeminiAI(message);
            typing.style.display = 'none';
            addMessage(response, 'ai');
        } catch (error) {
            typing.style.display = 'none';
            addMessage(`Erro: ${error.message}`, 'ai');
        }
    }

    // EVENT LISTENERS
    document.getElementById('wagSend').onclick = sendMessage;
    document.getElementById('wagInput').onkeypress = function(e) {
        if (e.key === 'Enter') sendMessage();
    };

    // Foco no input
    setTimeout(() => {
        document.getElementById('wagInput').focus();
    }, 500);

    console.log('🤖 WagroundDestroyerIA Gemini carregado!');
})();
