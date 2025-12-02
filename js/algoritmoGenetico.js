/*************************************************
 * ALGORITMO GENÉTICO
 * Implementa o algoritmo genético para evolução da população
 * Inclui: seleção, crossover, mutação e elitismo
 *************************************************/

/**
 * Avalia o fitness de um genoma
 * O genoma é testado em múltiplos episódios do jogo Pong
 * @param {Float64Array} genoma - Genoma a ser avaliado
 * @param {RedeNeural} rede - Instância da rede neural para avaliação
 * @returns {number} Fitness médio do genoma
 */
function avaliarGenoma(genoma, rede) {
  rede.carregarDoGenoma(genoma);

  let fitnessTotal = 0;

  // Executa múltiplos episódios para obter fitness mais confiável
  for (let ep = 0; ep < EPISODIOS_POR_GENOMA; ep++) {
    const ambiente = new AmbientePong(LARGURA_PONG, ALTURA_PONG);
    let terminado = false;
    let passos = 0;

    // Executa o episódio até terminar ou atingir limite de passos
    while (!terminado && passos < MAX_PASSOS_POR_EPISODIO) {
      const estado = ambiente._obterEstado();
      const { saida } = rede.propagar(estado);
      const acao = saida[0]; // já está em [-1,1] pelo tanh

      const resultado = ambiente.passo(acao);
      terminado = resultado.terminado;
      passos++;
    }

    // Fitness = tempo de sobrevivência + bônus por rebatidas
    const fitness = passos + ambiente.rebatidas * 200;
    fitnessTotal += fitness;
  }

  // Retorna fitness médio entre todos os episódios
  return fitnessTotal / EPISODIOS_POR_GENOMA;
}

/**
 * Classe que implementa o Algoritmo Genético
 */
class AlgoritmoGenetico {
  /**
   * Constrói um novo algoritmo genético
   * @param {number} tamanhoPopulacao - Número de indivíduos na população
   * @param {number} tamanhoGenoma - Tamanho do genoma (número de genes)
   */
  constructor(tamanhoPopulacao, tamanhoGenoma) {
    this.tamanhoPopulacao = tamanhoPopulacao;
    this.tamanhoGenoma = tamanhoGenoma;

    this.populacao = [];
    this.fitnesses = [];
    this.geracao = 0;

    // Inicializa população com genomas aleatórios
    for (let i = 0; i < tamanhoPopulacao; i++) {
      const genoma = new Float64Array(tamanhoGenoma);
      for (let g = 0; g < tamanhoGenoma; g++) {
        genoma[g] = aleatorioIntervalo(-1, 1);
      }
      this.populacao.push(genoma);
      this.fitnesses.push(0);
    }
  }

  /**
   * Avalia toda a população usando a função de avaliação fornecida
   * @param {Function} avaliador - Função que avalia um genoma e retorna seu fitness
   * @returns {Object} Objeto com melhor fitness, índice do melhor e fitness médio
   */
  avaliarPopulacao(avaliador) {
    let melhorFitness = -Infinity;
    let melhorIndice = 0;
    let fitnessMedio = 0;

    // Avalia cada indivíduo da população
    for (let i = 0; i < this.tamanhoPopulacao; i++) {
      const fit = avaliador(this.populacao[i]);
      this.fitnesses[i] = fit;
      fitnessMedio += fit;

      // Atualiza melhor indivíduo
      if (fit > melhorFitness) {
        melhorFitness = fit;
        melhorIndice = i;
      }
    }

    fitnessMedio /= this.tamanhoPopulacao;
    return { melhorFitness, melhorIndice, fitnessMedio };
  }

  /**
   * Seleção por torneio
   * Seleciona k indivíduos aleatórios e retorna o de maior fitness
   * @param {number} k - Tamanho do torneio (padrão: 3)
   * @returns {Float64Array} Genoma selecionado
   */
  _selecaoTorneio(k = 3) {
    let melhor = -1;
    let melhorFit = -Infinity;
    // Seleciona k indivíduos aleatórios
    for (let i = 0; i < k; i++) {
      const indice = Math.floor(Math.random() * this.tamanhoPopulacao);
      if (this.fitnesses[indice] > melhorFit) {
        melhorFit = this.fitnesses[indice];
        melhor = indice;
      }
    }
    return this.populacao[melhor];
  }

  /**
   * Crossover de um ponto
   * Combina dois genomas pais escolhendo um ponto aleatório de corte
   * @param {Float64Array} pai1 - Primeiro genoma pai
   * @param {Float64Array} pai2 - Segundo genoma pai
   * @returns {Float64Array} Genoma filho resultante
   */
  _crossover(pai1, pai2) {
    const filho = new Float64Array(this.tamanhoGenoma);
    const ponto = Math.floor(Math.random() * this.tamanhoGenoma);
    // Genes antes do ponto vêm do pai1, depois do ponto vêm do pai2
    for (let i = 0; i < this.tamanhoGenoma; i++) {
      if (i < ponto) filho[i] = pai1[i];
      else filho[i] = pai2[i];
    }
    return filho;
  }

  /**
   * Mutação gaussiana
   * Cada gene tem uma probabilidade de ser modificado
   * @param {Float64Array} genoma - Genoma a ser mutado (modificado in-place)
   */
  _mutar(genoma) {
    for (let i = 0; i < this.tamanhoGenoma; i++) {
      if (Math.random() < TAXA_MUTACAO) {
        // Adiciona ruído gaussiano ao gene
        genoma[i] += aleatorioNormal() * DESVIO_PADRAO_MUTACAO;
      }
    }
  }

  /**
   * Gera a próxima geração usando seleção, crossover e mutação
   * Preserva os melhores indivíduos (elitismo)
   */
  proximaGeracao() {
    // Ordena população por fitness (melhor primeiro)
    const indices = Array.from(this.populacao.keys());
    indices.sort((a, b) => this.fitnesses[b] - this.fitnesses[a]);

    const novaPop = [];

    // Elitismo: preserva os N melhores indivíduos intactos
    for (let i = 0; i < NUMERO_ELITES; i++) {
      const genomaElite = new Float64Array(this.populacao[indices[i]]);
      novaPop.push(genomaElite);
    }

    // Reproduz até preencher a população
    while (novaPop.length < this.tamanhoPopulacao) {
      // Seleciona dois pais
      const pai1 = this._selecaoTorneio();
      const pai2 = this._selecaoTorneio();
      // Gera filho através de crossover
      let filho = this._crossover(pai1, pai2);
      // Aplica mutação
      this._mutar(filho);
      novaPop.push(filho);
    }

    this.populacao = novaPop;
    this.geracao++;
  }

  /**
   * Reinicia a população com novos genomas aleatórios
   */
  reiniciar() {
    this.populacao = [];
    this.fitnesses = [];
    this.geracao = 0;

    // Cria nova população aleatória
    for (let i = 0; i < this.tamanhoPopulacao; i++) {
      const genoma = new Float64Array(this.tamanhoGenoma);
      for (let g = 0; g < this.tamanhoGenoma; g++) {
        genoma[g] = aleatorioIntervalo(-1, 1);
      }
      this.populacao.push(genoma);
      this.fitnesses.push(0);
    }
  }
}

