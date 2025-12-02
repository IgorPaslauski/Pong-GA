/*************************************************
 * CONFIGURAÇÕES GERAIS DO PROJETO
 * Define todas as constantes e parâmetros iniciais
 *************************************************/

// Dimensões do jogo Pong
const LARGURA_PONG = 400;
const ALTURA_PONG = 300;

// Parâmetros do Algoritmo Genético (podem ser alterados pelos controles)
let TAMANHO_POPULACAO = 30;
let NUMERO_ELITES = 4;
let TAXA_MUTACAO = 0.15;
let DESVIO_PADRAO_MUTACAO = 0.3;
let EPISODIOS_POR_GENOMA = 2;
let MAX_PASSOS_POR_EPISODIO = 600;

// Arquitetura da Rede Neural (entrada -> oculto -> saída)
const TAMANHO_ENTRADA = 6;
const TAMANHO_OCULTO = 8;
const TAMANHO_SAIDA = 1;

