/*************************************************
 * ARQUIVO PRINCIPAL
 * Inicializa a aplicação e gerencia os loops principais
 *************************************************/

// Variáveis globais para visualização
let canvasPong, ctxPong;
let canvasRede, ctxRede;
let canvasGrafico, ctxGrafico;
let divInfo;

// Instâncias do ambiente e redes
let ambienteVisualizacao;
let redeVisualizacao;
let redeAG;
let tamanhoGenoma;
let algoritmoGenetico;

// Estado global
let melhorGenoma;
let historicoMelhorFitness = [];
let historicoFitnessMedio = [];
let treinando = true;

// Instâncias adicionais de jogos para visualização
let ambienteJogo1, redeJogo1, canvasJogo1, ctxJogo1;
let ambienteJogo2, redeJogo2, canvasJogo2, ctxJogo2;
let ambienteJogo3, redeJogo3, canvasJogo3, ctxJogo3;
let genomaJogo1, genomaJogo2, genomaJogo3;

// Variáveis para suavização da visualização da rede neural
let ativacoesAtuais = null;
let ativacoesAnteriores = null;

/**
 * Inicializa todos os elementos da aplicação
 */
function inicializar() {
  // Obtém referências aos elementos do DOM
  canvasPong = document.getElementById("pongCanvas");
  ctxPong = canvasPong.getContext("2d");

  canvasRede = document.getElementById("nnCanvas");
  ctxRede = canvasRede.getContext("2d");

  canvasGrafico = document.getElementById("plotCanvas");
  ctxGrafico = canvasGrafico.getContext("2d");

  divInfo = document.getElementById("info");

  // Cria instâncias do ambiente e redes
  ambienteVisualizacao = new AmbientePong(200, 150);
  redeVisualizacao = new RedeNeural(TAMANHO_ENTRADA, TAMANHO_OCULTO, TAMANHO_SAIDA);
  redeAG = new RedeNeural(TAMANHO_ENTRADA, TAMANHO_OCULTO, TAMANHO_SAIDA);
  tamanhoGenoma = redeAG.tamanhoGenoma;

  // Inicializa algoritmo genético
  algoritmoGenetico = new AlgoritmoGenetico(TAMANHO_POPULACAO, tamanhoGenoma);

  // Inicializa melhor genoma (vazio por enquanto)
  melhorGenoma = new Float64Array(tamanhoGenoma);

  // Cria instâncias dos jogos adicionais
  ambienteJogo1 = new AmbientePong(200, 150);
  redeJogo1 = new RedeNeural(TAMANHO_ENTRADA, TAMANHO_OCULTO, TAMANHO_SAIDA);
  canvasJogo1 = document.getElementById("game1Canvas");
  ctxJogo1 = canvasJogo1.getContext("2d");

  ambienteJogo2 = new AmbientePong(200, 150);
  redeJogo2 = new RedeNeural(TAMANHO_ENTRADA, TAMANHO_OCULTO, TAMANHO_SAIDA);
  canvasJogo2 = document.getElementById("game2Canvas");
  ctxJogo2 = canvasJogo2.getContext("2d");

  ambienteJogo3 = new AmbientePong(200, 150);
  redeJogo3 = new RedeNeural(TAMANHO_ENTRADA, TAMANHO_OCULTO, TAMANHO_SAIDA);
  canvasJogo3 = document.getElementById("game3Canvas");
  ctxJogo3 = canvasJogo3.getContext("2d");

  // Inicializa genomas aleatórios para os jogos adicionais
  genomaJogo1 = new Float64Array(tamanhoGenoma);
  genomaJogo2 = new Float64Array(tamanhoGenoma);
  genomaJogo3 = new Float64Array(tamanhoGenoma);
  for (let i = 0; i < tamanhoGenoma; i++) {
    genomaJogo1[i] = aleatorioIntervalo(-1, 1);
    genomaJogo2[i] = aleatorioIntervalo(-1, 1);
    genomaJogo3[i] = aleatorioIntervalo(-1, 1);
  }

  // Inicializa ativações anteriores com valores neutros
  ativacoesAnteriores = {
    entrada: new Array(TAMANHO_ENTRADA).fill(0),
    oculto: new Array(TAMANHO_OCULTO).fill(0),
    saida: new Array(TAMANHO_SAIDA).fill(0)
  };

  // Configura controles da interface
  configurarControles();

  // Desenho inicial
  desenharRedeNeural(melhorGenoma, null);
  desenharGraficoFitness();
  ambienteVisualizacao.reiniciar();
  desenharPong(ambienteVisualizacao, ctxPong, 200, 150);
  ambienteJogo1.reiniciar();
  ambienteJogo2.reiniciar();
  ambienteJogo3.reiniciar();
  desenharPong(ambienteJogo1, ctxJogo1, 200, 150);
  desenharPong(ambienteJogo2, ctxJogo2, 200, 150);
  desenharPong(ambienteJogo3, ctxJogo3, 200, 150);

  // Loop de treinamento (uma geração a cada ~30 ms)
  setInterval(trainingStep, 30);

  // Atualiza genomas dos jogos adicionais periodicamente com genomas aleatórios da população
  setInterval(() => {
    if (algoritmoGenetico.populacao.length > 0) {
      const idx1 = Math.floor(Math.random() * algoritmoGenetico.populacao.length);
      const idx2 = Math.floor(Math.random() * algoritmoGenetico.populacao.length);
      const idx3 = Math.floor(Math.random() * algoritmoGenetico.populacao.length);
      genomaJogo1 = new Float64Array(algoritmoGenetico.populacao[idx1]);
      genomaJogo2 = new Float64Array(algoritmoGenetico.populacao[idx2]);
      genomaJogo3 = new Float64Array(algoritmoGenetico.populacao[idx3]);
    }
  }, 2000);

  // Loop de animação do jogo
  requestAnimationFrame(loopAnimacao);
}

/**
 * Executa um passo do treinamento (avalia população e gera nova geração)
 */
function trainingStep() {
  if (!treinando) return;

  const { melhorFitness, melhorIndice, fitnessMedio } = algoritmoGenetico.avaliarPopulacao((genome) => {
    return avaliarGenoma(genome, redeAG); 
  });

  // Atualiza melhor genoma global
  melhorGenoma = new Float64Array(algoritmoGenetico.populacao[melhorIndice]);

  historicoMelhorFitness.push(melhorFitness);
  historicoFitnessMedio.push(fitnessMedio);

  algoritmoGenetico.proximaGeracao();

  // Atualiza info textual
  divInfo.textContent =
    `Geração: ${algoritmoGenetico.geracao}\n` +
    `Melhor fitness: ${melhorFitness.toFixed(1)}\n` +
    `Fitness médio: ${fitnessMedio.toFixed(1)}\n` +
    `População: ${TAMANHO_POPULACAO}`;

  // Atualiza visualizações
  desenharRedeNeural(melhorGenoma, ativacoesAtuais);
  desenharGraficoFitness();
}

/**
 * Atualiza a visualização do jogo Pong principal
 * Calcula ativações da rede e suaviza para visualização
 */
function atualizarVisualizacaoPong() {
  // Usa o melhor genoma atual
  redeVisualizacao.carregarDoGenoma(melhorGenoma);
  const estado = ambienteVisualizacao._obterEstado();
  const { oculto, saida } = redeVisualizacao.propagar(estado);
  const acao = saida[0];

  // Normaliza e limita os valores de ativação
  const estadoNormalizado = estado.map(v => Math.max(-1, Math.min(1, v)));
  const ocultoNormalizado = Array.from(oculto).map(v => Math.max(-1, Math.min(1, v)));
  const saidaNormalizada = Array.from(saida).map(v => Math.max(-1, Math.min(1, v)));

  // Suavização: interpola entre valores anteriores e novos (fator de 0.3 = 30% do novo valor)
  const fatorSuavizacao = 0.3;
  if (ativacoesAnteriores) {
    // Interpola entrada
    for (let i = 0; i < estadoNormalizado.length; i++) {
      estadoNormalizado[i] = ativacoesAnteriores.entrada[i] * (1 - fatorSuavizacao) + estadoNormalizado[i] * fatorSuavizacao;
    }
    // Interpola oculto
    for (let h = 0; h < ocultoNormalizado.length; h++) {
      ocultoNormalizado[h] = ativacoesAnteriores.oculto[h] * (1 - fatorSuavizacao) + ocultoNormalizado[h] * fatorSuavizacao;
    }
    // Interpola saída
    for (let o = 0; o < saidaNormalizada.length; o++) {
      saidaNormalizada[o] = ativacoesAnteriores.saida[o] * (1 - fatorSuavizacao) + saidaNormalizada[o] * fatorSuavizacao;
    }
  }

  // Salva as ativações para visualização
  ativacoesAtuais = {
    entrada: estadoNormalizado,
    oculto: ocultoNormalizado,
    saida: saidaNormalizada
  };

  // Atualiza ativações anteriores para próxima iteração
  ativacoesAnteriores = {
    entrada: [...estadoNormalizado],
    oculto: [...ocultoNormalizado],
    saida: [...saidaNormalizada]
  };

  const resultado = ambienteVisualizacao.passo(acao);
  if (resultado.terminado) {
    ambienteVisualizacao.reiniciar();
  }
}

/**
 * Atualiza um jogo individual (para os jogos adicionais)
 * @param {AmbientePong} ambiente - Ambiente do jogo
 * @param {RedeNeural} rede - Rede neural do jogo
 * @param {Float64Array} genoma - Genoma da rede
 */
function atualizarJogo(ambiente, rede, genoma) {
  rede.carregarDoGenoma(genoma);
  const estado = ambiente._obterEstado();
  const { saida } = rede.propagar(estado);
  const acao = saida[0];

  const resultado = ambiente.passo(acao);
  if (resultado.terminado) {
    ambiente.reiniciar();
  }
}

/**
 * Loop principal de animação
 * Atualiza todos os jogos e visualizações
 */
function loopAnimacao() {
  // Jogo principal
  atualizarVisualizacaoPong();
  desenharPong(ambienteVisualizacao, ctxPong, 200, 150);

  // Atualiza visualização da rede neural com ativações
  desenharRedeNeural(melhorGenoma, ativacoesAtuais);

  // Jogos adicionais
  atualizarJogo(ambienteJogo1, redeJogo1, genomaJogo1);
  desenharPong(ambienteJogo1, ctxJogo1, 200, 150);

  atualizarJogo(ambienteJogo2, redeJogo2, genomaJogo2);
  desenharPong(ambienteJogo2, ctxJogo2, 200, 150);

  atualizarJogo(ambienteJogo3, redeJogo3, genomaJogo3);
  desenharPong(ambienteJogo3, ctxJogo3, 200, 150);

  requestAnimationFrame(loopAnimacao);
}

// Inicializa a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializar);
} else {
  inicializar();
}

