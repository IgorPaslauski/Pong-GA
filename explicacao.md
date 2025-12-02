Analisando os arquivos principais para entender a lógica do sistema.


[4 tools called]


Verificando como tudo se conecta no arquivo principal:


[1 tool called]


## Resumo da lógica do sistema

### 1. Arquitetura da rede neural

A rede neural tem 3 camadas:
- Entrada: 6 neurônios (posição X e Y da bola, velocidade X e Y, posição Y da raquete, diferença Y entre bola e raquete)
- Oculta: 8 neurônios com função de ativação `tanh`
- Saída: 1 neurônio (ação: valor entre -1 e 1, onde negativo = subir, positivo = descer)

O genoma é um vetor `Float64Array` que contém todos os pesos e vieses da rede na ordem: `[pesos1, vies1, pesos2, vies2]`.

### 2. Sistema de avaliação (fitness)

A função `avaliarGenoma()` avalia cada genoma:

```14:43:js/algoritmoGenetico.js
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
```

- Cada genoma é testado em múltiplos episódios (padrão: 2)
- Em cada episódio, a rede joga até perder ou atingir o limite de passos
- Cálculo do fitness: `fitness = passos + rebatidas * 200`
- Retorna a média do fitness entre os episódios

### 3. Geração de algoritmos (algoritmo genético)

#### Inicialização
A população começa com genomas aleatórios (valores entre -1 e 1):

```54:71:js/algoritmoGenetico.js
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
```

#### Ciclo evolutivo

A cada geração:

1. Avaliação: todos os genomas são avaliados e recebem um fitness.

2. Elitismo: os N melhores genomas (padrão: 4) são preservados intactos na próxima geração:

```163:167:js/algoritmoGenetico.js
    // Elitismo: preserva os N melhores indivíduos intactos
    for (let i = 0; i < NUMERO_ELITES; i++) {
      const genomaElite = new Float64Array(this.populacao[indices[i]]);
      novaPop.push(genomaElite);
    }
```

3. Reprodução: para preencher o restante da população:
   - Seleção por torneio: escolhe k indivíduos aleatórios (padrão: 3) e seleciona o de maior fitness
   - Crossover de um ponto: combina dois pais escolhendo um ponto aleatório de corte
   - Mutação gaussiana: cada gene tem probabilidade (padrão: 15%) de receber ruído gaussiano

```106:118:js/algoritmoGenetico.js
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
```

```127:136:js/algoritmoGenetico.js
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
```

```143:150:js/algoritmoGenetico.js
  _mutar(genoma) {
    for (let i = 0; i < this.tamanhoGenoma; i++) {
      if (Math.random() < TAXA_MUTACAO) {
        // Adiciona ruído gaussiano ao gene
        genoma[i] += aleatorioNormal() * DESVIO_PADRAO_MUTACAO;
      }
    }
  }
```

### 4. Fluxo do processo

1. Inicialização: cria população de genomas aleatórios
2. Loop de treinamento (a cada ~30ms):
   - Avalia toda a população
   - Identifica o melhor genoma
   - Gera a próxima geração (elitismo + reprodução)
   - Incrementa o contador de geração
3. Evolução: ao longo das gerações, os genomas melhoram em jogar Pong, aumentando o fitness médio e o melhor fitness.

### 5. Parâmetros configuráveis

- `TAMANHO_POPULACAO`: número de indivíduos (padrão: 30)
- `NUMERO_ELITES`: quantos melhores são preservados (padrão: 4)
- `TAXA_MUTACAO`: probabilidade de mutação por gene (padrão: 0.15)
- `DESVIO_PADRAO_MUTACAO`: intensidade da mutação (padrão: 0.3)
- `EPISODIOS_POR_GENOMA`: quantos testes por genoma (padrão: 2)
- `MAX_PASSOS_POR_EPISODIO`: limite de passos por episódio (padrão: 600)

O sistema evolui redes neurais que aprendem a jogar Pong através de seleção, crossover e mutação, sem usar aprendizado supervisionado ou backpropagation.