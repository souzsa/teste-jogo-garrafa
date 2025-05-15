const cores = ["Vermelho", "Azul", "Roxo", "Verde", "Amarelo"]; // Cores permitidas
const coresHex = {
    "Vermelho": "#ff0000",
    "Azul": "#0000ff",
    "Roxo": "#800080",
    "Verde": "#008000",
    "Amarelo": "#ffff00",
};

// Configurações do jogo
const config = localStorage.getItem('configJogo') || "5,45";
const [maxTentativas, tempoTotal] = config.split(',').map(Number);

let ordemCorreta = [];
let tentativasRestantes = maxTentativas;
let palpiteAtual = [];
let palpites = [];
let tempoRestante = tempoTotal;
let timer;
let jogoAtivo = true;

// Elementos DOM
const tempoElement = document.getElementById('tempo');
const tentativasElement = document.getElementById('tentativas');
const confirmarBtn = document.getElementById('confirmar');
const voltarInicioBtn = document.getElementById('voltar-inicio');
const modal = document.getElementById('modal');

document.addEventListener('DOMContentLoaded', iniciarJogo);
confirmarBtn.addEventListener('click', verificarPalpite);
console.log(modal);

const tipoMessage = modal.getAttribute('tipo');
console.log(tipoMessage);

if( tipoMessage === 'Atenção'){
    voltarInicioBtn.addEventListener('click', () => {
        window.location.href = 'jogo.html';
    });
}

voltarInicioBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
});

function iniciarJogo() {
    // Gerar ordem aleatória das cores sem repetição
    ordemCorreta = [...cores]
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);

    // Inicializar palpite atual (vazio no início)
    palpiteAtual = Array(5).fill(null);

    // Iniciar temporizador
    iniciarTemporizador();

    criarQuadradosPalpite();
    atualizarUI();
}

function iniciarTemporizador() {
    atualizarTempoDisplay();
    timer = setInterval(() => {
        tempoRestante--;
        atualizarTempoDisplay();

        if (tempoRestante <= 0) {
            clearInterval(timer);
            jogoAtivo = false;
            mostrarModal("Tempo Esgotado!", "O tempo acabou antes de você resolver o desafio!");
            mostrarSolucao();
            document.getElementById('confirmar').disabled = true;
        }
    }, 1000);
}

function atualizarTempoDisplay() {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    tempoElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

    // Mudar cor quando o tempo estiver acabando
    if (tempoRestante <= 10) {
        tempoElement.style.color = "#e63946";
        tempoElement.style.animation = "pulse 0.5s infinite alternate";
    }
}

function criarQuadradosPalpite() {
    const container = document.getElementById('palpites-container');
    container.innerHTML = '';  // Limpa o container antes de adicionar os quadrados

    for (let i = 0; i < 5; i++) {
        const quadrado = document.createElement('div');
        quadrado.className = 'cor-quadrado';
        quadrado.dataset.index = i;

        if (palpiteAtual[i]) {
            quadrado.style.backgroundColor = coresHex[palpiteAtual[i]];
            quadrado.textContent = palpiteAtual[i].charAt(0);
        }

        quadrado.addEventListener('click', () => {
            if (jogoAtivo) mudarCorQuadrado(quadrado, i);
        });
        container.appendChild(quadrado);
    }
}

function mudarCorQuadrado(quadrado, index) {
    // Se for o primeiro clique ou não tiver cor, começa com uma cor aleatória
    if (!palpiteAtual[index]) {
        // Filtra as cores que ainda não estão no palpite atual
        const coresDisponiveis = cores.filter(cor => !palpiteAtual.includes(cor));
        
        // Se houver cores disponíveis, escolhe uma aleatória
        if (coresDisponiveis.length > 0) {
            palpiteAtual[index] = coresDisponiveis[Math.floor(Math.random() * coresDisponiveis.length)];
        } else {
            // Se todas as cores já estiverem no palpite, escolhe qualquer uma aleatoriamente
            palpiteAtual[index] = cores[Math.floor(Math.random() * cores.length)];
        }
    } else {
        // Cicla para a próxima cor, garantindo que não repita cores no palpite
        const currentIndex = cores.indexOf(palpiteAtual[index]);
        let nextIndex = (currentIndex + 1) % cores.length;

        // Encontra a próxima cor que não está no palpite atual
        while (palpiteAtual.includes(cores[nextIndex]) && palpiteAtual[index] !== cores[nextIndex]) {
            nextIndex = (nextIndex + 1) % cores.length;
        }

        palpiteAtual[index] = cores[nextIndex];
    }

    // Atualiza a cor visualmente
    quadrado.style.backgroundColor = coresHex[palpiteAtual[index]];
    quadrado.textContent = palpiteAtual[index].charAt(0);
}

function verificarPalpite() {
    if (!jogoAtivo || tentativasRestantes <= 0 || palpiteAtual.some(cor => !cor)) return;

    // Verifica se há cores repetidas no palpite
    const coresUnicas = new Set(palpiteAtual);
    if (coresUnicas.size < 5) {
        // Não permite palpites com cores repetidas
        mostrarModal("Atenção", "Você não pode repetir cores em seu palpite!");
        return; // Bloqueia a confirmação e não deixa o jogo prosseguir
    }

    // Adiciona o palpite à lista de palpites
    palpites.push([...palpiteAtual]);

    // Limpa os palpites anteriores para evitar duplicação
    mostrarPalpitesAnteriores();

    // Cria feedback
    criarFeedback();

    // Verifica se acertou todas as cores
    if (palpiteAtual.every((cor, i) => cor === ordemCorreta[i])) {
        jogoAtivo = false;
        clearInterval(timer);
        setTimeout(() => {
            mostrarModal("🎉 Parabéns!", "Você acertou a ordem das cores!");
            mostrarSolucao();
            document.getElementById('confirmar').disabled = true;

            // Atualizar estatísticas no modal
            document.getElementById('tempo-restante').textContent = tempoElement.textContent;
            document.getElementById('tentativas-usadas').textContent = maxTentativas - tentativasRestantes + 1;
        }, 300);
        return;
    }

    tentativasRestantes--;
    atualizarUI();

    if (tentativasRestantes === 0) {
        jogoAtivo = false;
        clearInterval(timer);
        setTimeout(() => {
            mostrarModal("Fim de jogo", "Você esgotou todas as tentativas!");
            mostrarSolucao();
            document.getElementById('confirmar').disabled = true;
        }, 300);
    } else {
        // Prepara para o próximo palpite
        palpiteAtual = Array(5).fill(null);
        criarQuadradosPalpite();
    }
}

function mostrarModal(titulo, mensagem) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    modal.setAttribute('tipo', titulo);

    modalTitle.textContent = titulo;
    modalMessage.textContent = mensagem;
    modal.style.display = 'flex';
}

function mostrarSolucao() {
    const container = document.getElementById('solucao-container');
    container.innerHTML = '<p style="margin-bottom: 15px; width: 100%;">A ordem correta era:</p>';

    ordemCorreta.forEach(cor => {
        const item = document.createElement('div');
        item.className = 'cor-quadrado';
        item.style.backgroundColor = coresHex[cor];
        item.textContent = cor.charAt(0);
        container.appendChild(item);
    });
}

function mostrarPalpitesAnteriores() {
    const container = document.getElementById('palpites-anteriores');
    
    // Limpar a área de palpites anteriores antes de adicionar novos
    container.innerHTML = '';

    palpites.forEach((palpite, index) => {
        const palpiteDiv = document.createElement('div');
        palpiteDiv.className = 'feedback';
        palpiteDiv.style.margin = '8px 0';
        palpiteDiv.style.display = 'flex';
        palpiteDiv.style.gap = '12px';
        palpiteDiv.style.justifyContent = 'center';

        palpite.forEach(cor => {
            const item = document.createElement('div');
            item.className = 'cor-quadrado';
            item.style.backgroundColor = coresHex[cor];
            item.textContent = cor.charAt(0);
            palpiteDiv.appendChild(item);
        });

        container.appendChild(palpiteDiv);
    });
}

function criarFeedback() {
    const feedbackContainer = document.getElementById('feedback-container');
    const feedbackDiv = document.createElement('div');
    feedbackDiv.className = 'feedback';
    feedbackDiv.style.margin = '10px 0';

    for (let i = 0; i < 5; i++) {
        const feedbackItem = document.createElement('div');
        feedbackItem.className = 'feedback-item';

        if (palpiteAtual[i] === ordemCorreta[i]) {
            feedbackItem.classList.add('certo');
        } else if (ordemCorreta.includes(palpiteAtual[i])) {
            feedbackItem.classList.add('presente');
        } else {
            feedbackItem.classList.add('errado');
        }

        feedbackDiv.appendChild(feedbackItem);
    }

    feedbackContainer.appendChild(feedbackDiv);
}

function atualizarUI() {
    tentativasElement.textContent = tentativasRestantes;

    // Mudar cor quando as tentativas estiverem acabando
    if (tentativasRestantes <= 2) {
        tentativasElement.style.color = "#e63946";
        tentativasElement.style.fontWeight = "bold";
    } else {
        tentativasElement.style.color = "";
        tentativasElement.style.fontWeight = "";
    }
}
