/*************************************************
 * CLASSE DA REDE NEURAL ARTIFICIAL
 * Implementa uma rede neural feedforward com:
 * - Camada de entrada
 * - Camada oculta
 * - Camada de saída
 * - Função de ativação tanh
 *************************************************/

class RedeNeural {
  /**
   * Constrói uma nova rede neural
   * @param {number} tamanhoEntrada - Número de neurônios de entrada
   * @param {number} tamanhoOculto - Número de neurônios na camada oculta
   * @param {number} tamanhoSaida - Número de neurônios de saída
   */
  constructor(tamanhoEntrada, tamanhoOculto, tamanhoSaida) {
    this.tamanhoEntrada = tamanhoEntrada;
    this.tamanhoOculto = tamanhoOculto;
    this.tamanhoSaida = tamanhoSaida;

    // Pesos e vieses (bias) - usando Float64Array para melhor performance
    this.pesos1 = new Float64Array(tamanhoEntrada * tamanhoOculto); // Entrada -> Oculto
    this.vies1 = new Float64Array(tamanhoOculto); // Bias da camada oculta
    this.pesos2 = new Float64Array(tamanhoOculto * tamanhoSaida); // Oculto -> Saída
    this.vies2 = new Float64Array(tamanhoSaida); // Bias da camada de saída
  }

  /**
   * Retorna o tamanho total do genoma (todos os pesos e vieses)
   * @returns {number} Tamanho do genoma
   */
  get tamanhoGenoma() {
    return this.pesos1.length + this.vies1.length + this.pesos2.length + this.vies2.length;
  }

  /**
   * Carrega os pesos e vieses a partir de um vetor genoma
   * O genoma deve conter todos os parâmetros em ordem:
   * [pesos1, vies1, pesos2, vies2]
   * @param {Float64Array} genoma - Vetor com todos os parâmetros da rede
   */
  carregarDoGenoma(genoma) {
    let indice = 0;
    // Carrega pesos da camada entrada -> oculta
    for (let i = 0; i < this.pesos1.length; i++) this.pesos1[i] = genoma[indice++];
    // Carrega vieses da camada oculta
    for (let i = 0; i < this.vies1.length; i++) this.vies1[i] = genoma[indice++];
    // Carrega pesos da camada oculta -> saída
    for (let i = 0; i < this.pesos2.length; i++) this.pesos2[i] = genoma[indice++];
    // Carrega vieses da camada de saída
    for (let i = 0; i < this.vies2.length; i++) this.vies2[i] = genoma[indice++];
  }

  /**
   * Função de ativação tangente hiperbólica
   * Normaliza valores para o intervalo [-1, 1]
   * @param {number} x - Valor de entrada
   * @returns {number} Valor ativado
   */
  tanh(x) {
    return Math.tanh(x);
  }

  /**
   * Propaga um sinal através da rede (forward pass)
   * @param {Array<number>} entrada - Vetor de entrada (normalizado)
   * @returns {Object} Objeto com as ativações das camadas oculta e saída
   */
  propagar(entrada) {
    const oculto = new Float64Array(this.tamanhoOculto);
    const saida = new Float64Array(this.tamanhoSaida);

    // Camada oculta: calcula ativação de cada neurônio
    for (let h = 0; h < this.tamanhoOculto; h++) {
      let soma = this.vies1[h]; // Inicia com o bias
      // Soma todas as entradas ponderadas
      for (let i = 0; i < this.tamanhoEntrada; i++) {
        soma += entrada[i] * this.pesos1[h * this.tamanhoEntrada + i];
      }
      oculto[h] = this.tanh(soma); // Aplica função de ativação
    }

    // Camada de saída: calcula ativação de cada neurônio
    for (let o = 0; o < this.tamanhoSaida; o++) {
      let soma = this.vies2[o]; // Inicia com o bias
      // Soma todas as ativações da camada oculta ponderadas
      for (let h = 0; h < this.tamanhoOculto; h++) {
        soma += oculto[h] * this.pesos2[o * this.tamanhoOculto + h];
      }
      saida[o] = this.tanh(soma); // Aplica função de ativação
    }

    return { oculto, saida };
  }
}

