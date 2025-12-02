# Pong + Algoritmo Genético

Um projeto interativo que demonstra a evolução de redes neurais usando algoritmos genéticos para aprender a jogar Pong.

## 🎮 Sobre o Projeto

Este projeto implementa um algoritmo genético que evolui uma população de redes neurais para jogar Pong. Cada rede neural controla uma raquete e aprende através de seleção, crossover e mutação.

## ✨ Funcionalidades

- **Algoritmo Genético**: Evolução de redes neurais através de seleção, crossover e mutação
- **Visualização em Tempo Real**: 
  - 4 jogos simultâneos mostrando diferentes indivíduos da população
  - Visualização da rede neural com ativações dinâmicas
  - Gráfico de evolução do fitness
- **Controles Interativos**: Ajuste de parâmetros do algoritmo em tempo real
- **Interface Moderna**: Design limpo e responsivo

## 🚀 Como Usar

### Opção 1: GitHub Pages (Recomendado)

1. Faça um fork deste repositório
2. Vá em **Settings** > **Pages**
3. Selecione a branch `main` como source
4. Acesse `https://seu-usuario.github.io/Pong-GA/`

### Opção 2: Localmente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/Pong-GA.git
cd Pong-GA
```

2. Abra o arquivo `index.html` em um navegador moderno

## ⚙️ Parâmetros Configuráveis

- **Tamanho da População**: Número de indivíduos na população (10-100)
- **Número de Elites**: Indivíduos preservados entre gerações (1-10)
- **Taxa de Mutação**: Probabilidade de mutação (0.05-0.5)
- **Desvio Padrão da Mutação**: Intensidade da mutação (0.1-1.0)
- **Episódios por Genoma**: Número de partidas por avaliação (1-5)
- **Máx. Passos por Episódio**: Limite de passos por partida (200-1000)

## 🧠 Como Funciona

1. **Inicialização**: Cria uma população aleatória de redes neurais
2. **Avaliação**: Cada rede joga Pong e recebe um score (fitness) baseado em:
   - Tempo de sobrevivência
   - Número de rebatidas
3. **Seleção**: Os melhores indivíduos são selecionados
4. **Reprodução**: Crossover e mutação criam uma nova geração
5. **Elitismo**: Os melhores indivíduos são preservados
6. **Repetição**: O processo continua até encontrar uma solução eficiente

## 📊 Visualizações

- **Jogos**: 4 instâncias do jogo mostrando diferentes estratégias
- **Rede Neural**: Visualização da arquitetura com ativações em tempo real
- **Gráfico de Fitness**: Evolução do melhor fitness e fitness médio ao longo das gerações

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (ES6+)
- Canvas API

## 📝 Licença

Este projeto é de código aberto e está disponível para uso educacional.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## 📧 Contato

Para dúvidas ou sugestões, abra uma issue no repositório.

---

**Divirta-se observando a evolução das redes neurais! 🎯**

