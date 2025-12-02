/*************************************************
 * CONTROLES DA INTERFACE
 * Gerencia todos os event listeners e interações do usuário
 *************************************************/

/**
 * Configura todos os controles da interface
 * Inclui sliders de parâmetros e botões de ação
 */
function configurarControles() {
  // Referências aos elementos do DOM
  const btnToggleTreinamento = document.getElementById("toggleTrainingBtn");
  const btnReset = document.getElementById("resetBtn");
  const popSizeSlider = document.getElementById("popSizeSlider");
  const eliteCountSlider = document.getElementById("eliteCountSlider");
  const mutationRateSlider = document.getElementById("mutationRateSlider");
  const mutationStdSlider = document.getElementById("mutationStdSlider");
  const episodesSlider = document.getElementById("episodesSlider");
  const maxStepsSlider = document.getElementById("maxStepsSlider");

  const popSizeValue = document.getElementById("popSizeValue");
  const eliteCountValue = document.getElementById("eliteCountValue");
  const mutationRateValue = document.getElementById("mutationRateValue");
  const mutationStdValue = document.getElementById("mutationStdValue");
  const episodesValue = document.getElementById("episodesValue");
  const maxStepsValue = document.getElementById("maxStepsValue");
  const applyParamsBtn = document.getElementById("applyParamsBtn");
  const pendingChangesMsg = document.getElementById("pendingChangesMsg");

  // Valores atualmente aplicados
  let valoresAplicados = {
    tamanhoPopulacao: TAMANHO_POPULACAO,
    numeroElites: NUMERO_ELITES,
    taxaMutacao: TAXA_MUTACAO,
    desvioPadraoMutacao: DESVIO_PADRAO_MUTACAO,
    episodiosPorGenoma: EPISODIOS_POR_GENOMA,
    maxPassosPorEpisodio: MAX_PASSOS_POR_EPISODIO
  };

  /**
   * Verifica se há mudanças pendentes nos parâmetros
   * Mostra/esconde mensagem de aviso e habilita/desabilita botão
   */
  function verificarMudancasPendentes() {
    const novoValorPop = parseInt(popSizeSlider.value);
    const novoValorElites = parseInt(eliteCountSlider.value);
    const novoValorTaxa = parseFloat(mutationRateSlider.value);
    const novoValorDesvio = parseFloat(mutationStdSlider.value);
    const novoValorEpisodios = parseInt(episodesSlider.value);
    const novoValorPassos = parseInt(maxStepsSlider.value);

    const temMudancas = 
      novoValorPop !== valoresAplicados.tamanhoPopulacao ||
      novoValorElites !== valoresAplicados.numeroElites ||
      novoValorTaxa !== valoresAplicados.taxaMutacao ||
      novoValorDesvio !== valoresAplicados.desvioPadraoMutacao ||
      novoValorEpisodios !== valoresAplicados.episodiosPorGenoma ||
      novoValorPassos !== valoresAplicados.maxPassosPorEpisodio;

    if (temMudancas) {
      pendingChangesMsg.style.display = "block";
      applyParamsBtn.disabled = false;
    } else {
      pendingChangesMsg.style.display = "none";
      applyParamsBtn.disabled = true;
    }
  }

  /**
   * Aplica os novos parâmetros e reinicia o algoritmo genético
   */
  function aplicarParametros() {
    // Aplica os novos valores
    TAMANHO_POPULACAO = parseInt(popSizeSlider.value);
    NUMERO_ELITES = parseInt(eliteCountSlider.value);
    TAXA_MUTACAO = parseFloat(mutationRateSlider.value);
    DESVIO_PADRAO_MUTACAO = parseFloat(mutationStdSlider.value);
    EPISODIOS_POR_GENOMA = parseInt(episodesSlider.value);
    MAX_PASSOS_POR_EPISODIO = parseInt(maxStepsSlider.value);

    // Atualiza valores aplicados
    valoresAplicados = {
      tamanhoPopulacao: TAMANHO_POPULACAO,
      numeroElites: NUMERO_ELITES,
      taxaMutacao: TAXA_MUTACAO,
      desvioPadraoMutacao: DESVIO_PADRAO_MUTACAO,
      episodiosPorGenoma: EPISODIOS_POR_GENOMA,
      maxPassosPorEpisodio: MAX_PASSOS_POR_EPISODIO
    };

    // Recria o algoritmo genético com os novos parâmetros
    algoritmoGenetico = new AlgoritmoGenetico(TAMANHO_POPULACAO, tamanhoGenoma);
    historicoMelhorFitness = [];
    historicoFitnessMedio = [];
    ambienteVisualizacao.reiniciar();

    // Esconde mensagem de mudanças pendentes
    pendingChangesMsg.style.display = "none";
    applyParamsBtn.disabled = true;

    divInfo.textContent = "Parâmetros aplicados! População reiniciada.";
  }

  // Event listener: Toggle treinamento
  btnToggleTreinamento.addEventListener("click", () => {
    treinando = !treinando;
    btnToggleTreinamento.textContent = treinando ? "Pausar Treinamento" : "Retomar Treinamento";
  });

  // Event listener: Reset população
  btnReset.addEventListener("click", () => {
    // Recria o AG com os novos parâmetros
    algoritmoGenetico = new AlgoritmoGenetico(TAMANHO_POPULACAO, tamanhoGenoma);
    historicoMelhorFitness = [];
    historicoFitnessMedio = [];
    ambienteVisualizacao.reiniciar();
    divInfo.textContent = "População resetada.";
  });

  // Event listeners: Sliders de parâmetros
  popSizeSlider.addEventListener("input", (e) => {
    const novoValor = parseInt(e.target.value);
    popSizeValue.textContent = novoValor;
    
    // Garante que NUMERO_ELITES não seja maior que TAMANHO_POPULACAO
    if (parseInt(eliteCountSlider.value) > novoValor) {
      const novoElite = Math.max(1, Math.floor(novoValor / 4));
      eliteCountSlider.value = novoElite;
      eliteCountValue.textContent = novoElite;
    }
    eliteCountSlider.max = Math.max(1, Math.floor(novoValor / 2));
    
    verificarMudancasPendentes();
  });

  eliteCountSlider.addEventListener("input", (e) => {
    eliteCountValue.textContent = e.target.value;
    verificarMudancasPendentes();
  });

  mutationRateSlider.addEventListener("input", (e) => {
    mutationRateValue.textContent = parseFloat(e.target.value).toFixed(2);
    verificarMudancasPendentes();
  });

  mutationStdSlider.addEventListener("input", (e) => {
    mutationStdValue.textContent = parseFloat(e.target.value).toFixed(1);
    verificarMudancasPendentes();
  });

  episodesSlider.addEventListener("input", (e) => {
    episodesValue.textContent = e.target.value;
    verificarMudancasPendentes();
  });

  maxStepsSlider.addEventListener("input", (e) => {
    maxStepsValue.textContent = e.target.value;
    verificarMudancasPendentes();
  });

  // Event listener: Aplicar parâmetros
  applyParamsBtn.addEventListener("click", aplicarParametros);
  
  // Inicializa o botão como desabilitado (sem mudanças pendentes)
  applyParamsBtn.disabled = true;

  // Configura limites iniciais dos sliders
  eliteCountSlider.max = Math.max(1, Math.floor(TAMANHO_POPULACAO / 2));
}

