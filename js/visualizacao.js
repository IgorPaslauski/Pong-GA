/*************************************************
 * FUNÇÕES DE VISUALIZAÇÃO
 * Responsáveis por desenhar a rede neural, o jogo Pong e o gráfico de evolução
 *************************************************/

/**
 * Desenha a rede neural no canvas
 * Mostra a arquitetura, pesos das conexões e ativações dos neurônios
 * @param {Float64Array} genoma - Genoma da rede a ser visualizada
 * @param {Object} ativacoes - Ativações atuais dos neurônios (opcional)
 */
function desenharRedeNeural(genoma, ativacoes = null) {
  redeVisualizacao.carregarDoGenoma(genoma);

  const ctx = ctxRede;
  ctx.clearRect(0, 0, canvasRede.width, canvasRede.height);

  const marginX = 150;
  const marginY = 80;

  // Posições X das camadas
  const posicoesX = [
    marginX,
    canvasRede.width / 2,
    canvasRede.width - marginX
  ];

  /**
   * Calcula posições dos nós de uma camada
   * @param {number} tamanhoCamada - Número de neurônios na camada
   * @param {number} indiceCamada - Índice da camada (0=entrada, 1=oculta, 2=saída)
   * @returns {Array<Object>} Array de objetos {x, y} com posições dos nós
   */
  function posicoesNos(tamanhoCamada, indiceCamada) {
    const x = posicoesX[indiceCamada];
    const posicoes = [];
    const alturaTotal = canvasRede.height - 2 * marginY;
    const passo = alturaTotal / (tamanhoCamada + 1);
    for (let i = 0; i < tamanhoCamada; i++) {
      const y = marginY + (i + 1) * passo;
      posicoes.push({ x, y });
    }
    return posicoes;
  }

  const nosEntrada = posicoesNos(TAMANHO_ENTRADA, 0);
  const nosOculto = posicoesNos(TAMANHO_OCULTO, 1);
  const nosSaida = posicoesNos(TAMANHO_SAIDA, 2);

  /**
   * Obtém cor baseada na ativação do neurônio
   * Negativo: azul/roxo, Positivo: amarelo/verde
   * @param {number} ativacao - Valor de ativação no intervalo [-1, 1]
   * @returns {string} Cor RGB
   */
  function obterCorAtivacao(ativacao) {
    const ativacaoLimitada = Math.max(-1, Math.min(1, ativacao));
    const intensidade = Math.abs(ativacaoLimitada);
    
    if (ativacaoLimitada < 0) {
      // Negativo: azul/roxo
      const r = Math.floor(Math.min(100, intensidade * 100));
      const g = Math.floor(Math.min(50, intensidade * 50));
      const b = Math.floor(100 + Math.min(155, intensidade * 155));
      return `rgb(${r}, ${g}, ${b})`;
    } else {
      // Positivo: amarelo/verde
      const r = Math.floor(200 + Math.min(55, intensidade * 55));
      const g = Math.floor(200 + Math.min(55, intensidade * 55));
      const b = Math.floor(Math.min(100, intensidade * 100));
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  /**
   * Obtém tamanho do nó baseado na ativação
   * @param {number} ativacao - Valor de ativação
   * @returns {number} Tamanho do nó em pixels
   */
  function obterTamanhoNo(ativacao) {
    const ativacaoLimitada = Math.max(-1, Math.min(1, ativacao));
    const intensidade = Math.abs(ativacaoLimitada);
    const variacao = Math.sqrt(intensidade) * 10;
    return 18 + variacao; // Tamanho entre 18 e 28
  }

  // Desenha conexões entre entrada -> oculto
  ctx.lineWidth = 1.5;
  for (let i = 0; i < TAMANHO_ENTRADA; i++) {
    for (let h = 0; h < TAMANHO_OCULTO; h++) {
      const peso = redeVisualizacao.pesos1[h * TAMANHO_ENTRADA + i];
      const pesoNormalizado = Math.max(-2, Math.min(2, peso)) / 2;
      const intensidade = Math.abs(pesoNormalizado);
      const opacidade = Math.min(0.5, intensidade * 0.5);
      ctx.strokeStyle = peso > 0 ? `rgba(0, 255, 0, ${opacidade})` : `rgba(255, 0, 0, ${opacidade})`;
      ctx.beginPath();
      ctx.moveTo(nosEntrada[i].x, nosEntrada[i].y);
      ctx.lineTo(nosOculto[h].x, nosOculto[h].y);
      ctx.stroke();
    }
  }

  // Desenha conexões entre oculto -> saída
  for (let h = 0; h < TAMANHO_OCULTO; h++) {
    for (let o = 0; o < TAMANHO_SAIDA; o++) {
      const peso = redeVisualizacao.pesos2[o * TAMANHO_OCULTO + h];
      const pesoNormalizado = Math.max(-2, Math.min(2, peso)) / 2;
      const intensidade = Math.abs(pesoNormalizado);
      const opacidade = Math.min(0.5, intensidade * 0.5);
      ctx.strokeStyle = peso > 0 ? `rgba(0, 255, 0, ${opacidade})` : `rgba(255, 0, 0, ${opacidade})`;
      ctx.beginPath();
      ctx.moveTo(nosOculto[h].x, nosOculto[h].y);
      ctx.lineTo(nosSaida[o].x, nosSaida[o].y);
      ctx.stroke();
    }
  }

  // Nomes das entradas
  const nomesEntradas = [
    "Pos X Bola",
    "Pos Y Bola",
    "Vel X Bola",
    "Vel Y Bola",
    "Pos Y Raquete",
    "Dif Y"
  ];

  // Desenha nós de entrada
  for (let i = 0; i < TAMANHO_ENTRADA; i++) {
    const no = nosEntrada[i];
    const ativacao = ativacoes ? Math.max(-1, Math.min(1, ativacoes.entrada[i])) : 0;
    const cor = ativacoes ? obterCorAtivacao(ativacao) : "#4CAF50";
    const tamanho = ativacoes ? obterTamanhoNo(ativacao) : 20;
    
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(no.x, no.y, tamanho, 0, Math.PI * 2);
    ctx.fill();
    
    // Borda
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label do neurônio
    ctx.fillStyle = "#ddd";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "right";
    const labelX = no.x - 30;
    const offsetY = tamanho + 5;
    ctx.fillText(nomesEntradas[i], labelX, no.y - offsetY);
    
    // Valor da ativação (se disponível)
    if (ativacoes) {
      ctx.fillStyle = "#aaa";
      ctx.font = "12px Arial";
      ctx.fillText(ativacao.toFixed(2), labelX, no.y + offsetY);
    }
  }

  // Desenha nós ocultos
  for (let h = 0; h < TAMANHO_OCULTO; h++) {
    const no = nosOculto[h];
    const ativacao = ativacoes ? Math.max(-1, Math.min(1, ativacoes.oculto[h])) : 0;
    const cor = ativacoes ? obterCorAtivacao(ativacao) : "#FFC107";
    const tamanho = ativacoes ? obterTamanhoNo(ativacao) : 20;
    
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(no.x, no.y, tamanho, 0, Math.PI * 2);
    ctx.fill();
    
    // Borda
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label do neurônio oculto
    ctx.fillStyle = "#ddd";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    const offsetYH = tamanho + 8;
    ctx.fillText(`H${h + 1}`, no.x, no.y - offsetYH);
    
    // Valor da ativação (se disponível)
    if (ativacoes) {
      ctx.fillStyle = "#aaa";
      ctx.font = "12px Arial";
      ctx.fillText(ativacao.toFixed(2), no.x, no.y + offsetYH);
    }
  }

  // Nomes das saídas
  const nomesSaidas = ["Movimento"];

  // Desenha nós de saída
  for (let o = 0; o < TAMANHO_SAIDA; o++) {
    const no = nosSaida[o];
    const ativacao = ativacoes ? Math.max(-1, Math.min(1, ativacoes.saida[o])) : 0;
    const cor = ativacoes ? obterCorAtivacao(ativacao) : "#03A9F4";
    const tamanho = ativacoes ? obterTamanhoNo(ativacao) : 20;
    
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(no.x, no.y, tamanho, 0, Math.PI * 2);
    ctx.fill();
    
    // Borda
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Label do neurônio de saída
    ctx.fillStyle = "#ddd";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "left";
    const offsetYS = tamanho + 8;
    ctx.fillText(nomesSaidas[o], no.x + offsetYS, no.y - 10);
    
    // Valor da ativação e ação
    if (ativacoes) {
      ctx.fillStyle = "#aaa";
      ctx.font = "13px Arial";
      ctx.fillText(ativacao.toFixed(2), no.x + offsetYS, no.y + 12);
      
      // Indicação da ação (sobe/desce)
      const acao = ativacao < 0 ? "↑ Sobe" : ativacao > 0 ? "↓ Desce" : "—";
      ctx.fillStyle = ativacao < 0 ? "#4CAF50" : ativacao > 0 ? "#FF9800" : "#888";
      ctx.font = "bold 14px Arial";
      ctx.fillText(acao, no.x + offsetYS, no.y + 28);
    }
  }

  // Títulos das camadas
  ctx.fillStyle = "#4CAF50";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Entradas", nosEntrada[0].x, 35);
  ctx.fillText("Oculta", nosOculto[0].x, 35);
  ctx.fillText("Saída", nosSaida[0].x, 35);
  
  // Resetar alinhamento
  ctx.textAlign = "left";
}

/**
 * Desenha o jogo Pong no canvas
 * @param {AmbientePong} ambiente - Ambiente Pong a ser desenhado
 * @param {CanvasRenderingContext2D} ctx - Contexto do canvas
 * @param {number} largura - Largura do canvas
 * @param {number} altura - Altura do canvas
 */
function desenharPong(ambiente, ctx, largura, altura) {
  ctx.clearRect(0, 0, largura, altura);

  // Fundo
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, largura, altura);

  // Linha central
  ctx.strokeStyle = "#333";
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(largura / 2, 0);
  ctx.lineTo(largura / 2, altura);
  ctx.stroke();
  ctx.setLineDash([]);

  // Raquete esquerda (agente)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(
    0,
    ambiente.posYRaquete - ambiente.alturaRaquete / 2,
    ambiente.larguraRaquete,
    ambiente.alturaRaquete
  );

  // Raquete direita (inimigo)
  ctx.fillStyle = "#aaaaaa";
  ctx.fillRect(
    largura - ambiente.larguraRaquete,
    ambiente.posYRaqueteInimiga - ambiente.alturaRaquete / 2,
    ambiente.larguraRaquete,
    ambiente.alturaRaquete
  );

  // Bola
  ctx.beginPath();
  ctx.arc(ambiente.posXBola, ambiente.posYBola, ambiente.raioBola, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // Info no canvas
  ctx.fillStyle = "#0f0";
  ctx.font = "10px Arial";
  ctx.fillText("Rebatidas: " + ambiente.rebatidas, 5, 12);
}

/**
 * Desenha o gráfico de evolução do fitness
 * Mostra a evolução do melhor fitness e fitness médio ao longo das gerações
 */
function desenharGraficoFitness() {
  const ctx = ctxGrafico;
  const w = canvasGrafico.width;
  const h = canvasGrafico.height;

  ctx.clearRect(0, 0, w, h);

  // Fundo com gradiente
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, "#1a1a1a");
  gradient.addColorStop(1, "#000");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);

  const marginLeft = 50;
  const marginRight = 10;
  const marginTop = 20;
  const marginBottom = 35;
  const plotWidth = w - marginLeft - marginRight;
  const plotHeight = h - marginTop - marginBottom;
  const plotX = marginLeft;
  const plotY = marginTop;

  // Grade de fundo
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 1;
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = plotY + (i / gridLines) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(plotX, y);
    ctx.lineTo(plotX + plotWidth, y);
    ctx.stroke();
  }
  for (let i = 0; i <= gridLines; i++) {
    const x = plotX + (i / gridLines) * plotWidth;
    ctx.beginPath();
    ctx.moveTo(x, plotY);
    ctx.lineTo(x, plotY + plotHeight);
    ctx.stroke();
  }

  // Eixos principais
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(plotX, plotY);
  ctx.lineTo(plotX, plotY + plotHeight);
  ctx.lineTo(plotX + plotWidth, plotY + plotHeight);
  ctx.stroke();

  if (historicoMelhorFitness.length === 0) {
    // Mostra mensagem quando não há dados
    ctx.fillStyle = "#666";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Aguardando dados...", w / 2, h / 2);
    ctx.textAlign = "left";
    return;
  }

  const maxGen = historicoMelhorFitness.length - 1;
  const allFitness = [...historicoMelhorFitness, ...historicoFitnessMedio];
  const maxFit = Math.max(...allFitness);
  const minFit = Math.min(...allFitness);
  const fitRange = Math.max(1, maxFit - minFit);
  const padding = fitRange * 0.1; // 10% de padding

  function xFromGen(gen) {
    if (maxGen === 0) return plotX;
    return plotX + (gen / maxGen) * plotWidth;
  }

  function yFromFit(f) {
    const norm = (f - (minFit - padding)) / (fitRange + 2 * padding);
    return plotY + plotHeight - norm * plotHeight;
  }

  // Área preenchida sob a curva do melhor fitness
  if (historicoMelhorFitness.length > 1) {
    const gradientBest = ctx.createLinearGradient(0, plotY, 0, plotY + plotHeight);
    gradientBest.addColorStop(0, "rgba(0, 255, 0, 0.3)");
    gradientBest.addColorStop(1, "rgba(0, 255, 0, 0.05)");
    ctx.fillStyle = gradientBest;
    ctx.beginPath();
    ctx.moveTo(xFromGen(0), plotY + plotHeight);
    for (let i = 0; i < historicoMelhorFitness.length; i++) {
      const x = xFromGen(i);
      const y = yFromFit(historicoMelhorFitness[i]);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(xFromGen(maxGen), plotY + plotHeight);
    ctx.closePath();
    ctx.fill();
  }

  // Área preenchida sob a curva do fitness médio
  if (historicoFitnessMedio.length > 1) {
    const gradientAvg = ctx.createLinearGradient(0, plotY, 0, plotY + plotHeight);
    gradientAvg.addColorStop(0, "rgba(255, 255, 0, 0.2)");
    gradientAvg.addColorStop(1, "rgba(255, 255, 0, 0.05)");
    ctx.fillStyle = gradientAvg;
    ctx.beginPath();
    ctx.moveTo(xFromGen(0), plotY + plotHeight);
    for (let i = 0; i < historicoFitnessMedio.length; i++) {
      const x = xFromGen(i);
      const y = yFromFit(historicoFitnessMedio[i]);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(xFromGen(maxGen), plotY + plotHeight);
    ctx.closePath();
    ctx.fill();
  }

  // Curva do melhor fitness (verde brilhante)
  ctx.strokeStyle = "#00FF00";
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 5;
  ctx.shadowColor = "rgba(0, 255, 0, 0.5)";
  ctx.beginPath();
  for (let i = 0; i < historicoMelhorFitness.length; i++) {
    const x = xFromGen(i);
    const y = yFromFit(historicoMelhorFitness[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Curva do fitness médio (amarelo)
  ctx.strokeStyle = "#FFD700";
  ctx.lineWidth = 2;
  ctx.shadowBlur = 3;
  ctx.shadowColor = "rgba(255, 215, 0, 0.3)";
  ctx.beginPath();
  for (let i = 0; i < historicoFitnessMedio.length; i++) {
    const x = xFromGen(i);
    const y = yFromFit(historicoFitnessMedio[i]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Pontos nos últimos valores
  if (historicoMelhorFitness.length > 0) {
    const lastX = xFromGen(maxGen);
    const lastY = yFromFit(historicoMelhorFitness[historicoMelhorFitness.length - 1]);
    ctx.fillStyle = "#00FF00";
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  if (historicoFitnessMedio.length > 0) {
    const lastX = xFromGen(maxGen);
    const lastY = yFromFit(historicoFitnessMedio[historicoFitnessMedio.length - 1]);
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Marcadores no eixo Y
  ctx.fillStyle = "#888";
  ctx.font = "10px Arial";
  ctx.textAlign = "right";
  for (let i = 0; i <= gridLines; i++) {
    const value = minFit - padding + (fitRange + 2 * padding) * (1 - i / gridLines);
    const y = plotY + (i / gridLines) * plotHeight;
    ctx.fillText(value.toFixed(0), plotX - 5, y + 3);
  }

  // Marcadores no eixo X
  ctx.textAlign = "center";
  const xLabels = Math.min(5, maxGen + 1);
  for (let i = 0; i < xLabels; i++) {
    const gen = Math.floor((i / (xLabels - 1)) * maxGen);
    const x = xFromGen(gen);
    ctx.fillText(gen.toString(), x, plotY + plotHeight + 15);
  }

  // Títulos dos eixos
  ctx.fillStyle = "#fff";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Gerações", w / 2, h - 5);
  ctx.save();
  ctx.translate(15, h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText("Fitness", 0, 0);
  ctx.restore();
  ctx.textAlign = "left";

  // Legenda melhorada
  const legendX = w - 130;
  const legendY = 15;
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(legendX - 5, legendY - 5, 125, 45);

  ctx.fillStyle = "#00FF00";
  ctx.fillRect(legendX, legendY, 10, 10);
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  ctx.strokeRect(legendX, legendY, 10, 10);
  ctx.fillStyle = "#fff";
  ctx.font = "11px Arial";
  ctx.fillText("Melhor", legendX + 15, legendY + 8);
  if (historicoMelhorFitness.length > 0) {
    ctx.fillStyle = "#aaa";
    ctx.font = "9px Arial";
    ctx.fillText(historicoMelhorFitness[historicoMelhorFitness.length - 1].toFixed(1), legendX + 15, legendY + 18);
  }

  ctx.fillStyle = "#FFD700";
  ctx.fillRect(legendX, legendY + 20, 10, 10);
  ctx.strokeStyle = "#fff";
  ctx.strokeRect(legendX, legendY + 20, 10, 10);
  ctx.fillStyle = "#fff";
  ctx.font = "11px Arial";
  ctx.fillText("Média", legendX + 15, legendY + 28);
  if (historicoFitnessMedio.length > 0) {
    ctx.fillStyle = "#aaa";
    ctx.font = "9px Arial";
    ctx.fillText(historicoFitnessMedio[historicoFitnessMedio.length - 1].toFixed(1), legendX + 15, legendY + 38);
  }

  // Valores min/max
  ctx.fillStyle = "#666";
  ctx.font = "9px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Max: ${maxFit.toFixed(1)}`, plotX, 12);
  ctx.fillText(`Min: ${minFit.toFixed(1)}`, plotX, 22);
}

