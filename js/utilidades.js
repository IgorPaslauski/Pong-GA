/*************************************************
 * FUNÇÕES AUXILIARES
 * Funções utilitárias para cálculos e geração de números aleatórios
 *************************************************/

/**
 * Gera um número aleatório em um intervalo [min, max)
 * @param {number} min - Valor mínimo (inclusivo)
 * @param {number} max - Valor máximo (exclusivo)
 * @returns {number} Número aleatório no intervalo
 */
function aleatorioIntervalo(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Gera um número aleatório com distribuição normal (Gaussiana) ~ N(0,1)
 * Usa o método Box-Muller para transformação
 * @returns {number} Número aleatório com distribuição normal padrão
 */
function aleatorioNormal() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

