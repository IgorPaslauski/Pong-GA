/*************************************************
 * AMBIENTE PONG
 * Simula o jogo Pong para treinamento do agente
 * - Agente controla a raquete esquerda
 * - Raquete direita é uma IA simples que segue a bola
 *************************************************/

class AmbientePong {
  /**
   * Constrói um novo ambiente Pong
   * @param {number} largura - Largura do campo
   * @param {number} altura - Altura do campo
   */
  constructor(largura, altura) {
    this.largura = largura;
    this.altura = altura;

    // Propriedades das raquetes
    this.alturaRaquete = 50;
    this.larguraRaquete = 8;
    this.velocidadeRaquete = 3; // Reduzida para movimento mais suave

    // Propriedades da bola
    this.raioBola = 5;
    this.velocidadeBola = 5.0;

    this.reiniciar();
  }

  /**
   * Reinicia o ambiente para um novo episódio
   * Posiciona raquetes e bola em posições iniciais aleatórias
   * @returns {Array<number>} Estado inicial normalizado
   */
  reiniciar() {
    // Raquete esquerda (agente) - centralizada
    this.posYRaquete = this.altura / 2;

    // Raquete direita (inimigo simples) - centralizada
    this.posYRaqueteInimiga = this.altura / 2;

    // Bola - posição central com direção aleatória
    this.posXBola = this.largura / 2;
    this.posYBola = this.altura / 2;
    const angulo = aleatorioIntervalo(-0.4 * Math.PI, 0.4 * Math.PI);
    const direcao = Math.random() < 0.5 ? -1 : 1;
    this.velXBola = Math.cos(angulo) * this.velocidadeBola * direcao;
    this.velYBola = Math.sin(angulo) * this.velocidadeBola;

    // Contadores
    this.rebatidas = 0;
    this.passos = 0;

    return this._obterEstado();
  }

  /**
   * Obtém o estado atual do ambiente normalizado para a rede neural
   * Normaliza todos os valores para o intervalo [-1, 1]
   * @returns {Array<number>} Estado normalizado [posX, posY, velX, velY, posRaquete, difY]
   */
  _obterEstado() {
    return [
      (this.posXBola / this.largura) * 2 - 1,      // pos X bola [-1,1]
      (this.posYBola / this.altura) * 2 - 1,       // pos Y bola [-1,1]
      this.velXBola / this.velocidadeBola,         // vel X bola [-1,1]
      this.velYBola / this.velocidadeBola,         // vel Y bola [-1,1]
      (this.posYRaquete / this.altura) * 2 - 1,    // pos Y raquete [-1,1]
      ((this.posYBola - this.posYRaquete) / this.altura) // diferença de Y
    ];
  }

  /**
   * Executa um passo do ambiente
   * @param {number} acao - Ação do agente no intervalo [-1,1] (negativo: sobe, positivo: desce)
   * @returns {Object} Objeto com novo estado e flag de término
   */
  passo(acao) {
    this.passos++;

    // Zona morta: só move se a ação for significativa (reduz movimento desnecessário)
    const zonaMorta = 0.15; // Só move se |acao| > 0.15
    let dy = 0;
    if (Math.abs(acao) > zonaMorta) {
      // Suaviza o movimento: quanto maior a ação, mais rápido move, mas com limite
      const acaoSuavizada = Math.sign(acao) * Math.min(Math.abs(acao), 0.7);
      dy = acaoSuavizada * this.velocidadeRaquete;
    }
    
    // Atualiza raquete do agente
    this.posYRaquete += dy;
    const metadeAlturaRaquete = this.alturaRaquete / 2;
    // Limita movimento dentro dos bounds
    if (this.posYRaquete < metadeAlturaRaquete) this.posYRaquete = metadeAlturaRaquete;
    if (this.posYRaquete > this.altura - metadeAlturaRaquete) this.posYRaquete = this.altura - metadeAlturaRaquete;

    // Atualiza raquete inimiga (segue bola com velocidade reduzida)
    if (this.posYBola < this.posYRaqueteInimiga - 5) this.posYRaqueteInimiga -= this.velocidadeRaquete * 0.9;
    if (this.posYBola > this.posYRaqueteInimiga + 5) this.posYRaqueteInimiga += this.velocidadeRaquete * 0.9;
    // Limita movimento dentro dos bounds
    if (this.posYRaqueteInimiga < metadeAlturaRaquete) this.posYRaqueteInimiga = metadeAlturaRaquete;
    if (this.posYRaqueteInimiga > this.altura - metadeAlturaRaquete) this.posYRaqueteInimiga = this.altura - metadeAlturaRaquete;

    // Atualiza posição da bola
    this.posXBola += this.velXBola;
    this.posYBola += this.velYBola;

    // Colisão com topo/base
    if (this.posYBola < this.raioBola) {
      this.posYBola = this.raioBola;
      this.velYBola *= -1;
    }
    if (this.posYBola > this.altura - this.raioBola) {
      this.posYBola = this.altura - this.raioBola;
      this.velYBola *= -1;
    }

    let terminado = false;

    // Colisão com raquete esquerda (agente)
    if (this.posXBola - this.raioBola < this.larguraRaquete) {
      const minY = this.posYRaquete - metadeAlturaRaquete;
      const maxY = this.posYRaquete + metadeAlturaRaquete;
      if (this.posYBola >= minY && this.posYBola <= maxY) {
        // Rebatida bem-sucedida
        this.posXBola = this.larguraRaquete + this.raioBola;
        this.velXBola *= -1;
        this.rebatidas++;

        // Pequena aceleração a cada rebatida (aumenta dificuldade)
        this.velXBola *= 1.03;
        this.velYBola *= 1.03;
      } else {
        // Bola passou da raquete (derrota)
        terminado = true;
      }
    }

    // Colisão com raquete direita
    if (this.posXBola + this.raioBola > this.largura - this.larguraRaquete) {
      const minY = this.posYRaqueteInimiga - metadeAlturaRaquete;
      const maxY = this.posYRaqueteInimiga + metadeAlturaRaquete;
      if (this.posYBola >= minY && this.posYBola <= maxY) {
        // Rebatida do inimigo
        this.posXBola = this.largura - this.larguraRaquete - this.raioBola;
        this.velXBola *= -1;
        this.velXBola *= 1.03;
        this.velYBola *= 1.03;
      } else {
        // Se passar da direita, apenas rebate na parede
        if (this.posXBola > this.largura - this.raioBola) {
          this.posXBola = this.largura - this.raioBola;
          this.velXBola *= -1;
        }
      }
    }

    const estado = this._obterEstado();
    return { estado, terminado };
  }
}

