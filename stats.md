### Aba: General Stats (Estatísticas Gerais)

* **Advantage Analysis (Análise de Vantagens):** * *By First Pick:* Ajuda a descobrir se ter a primeira escolha (First Pick) no draft oferece uma vantagem real para o time. O sistema separa as partidas onde o time Azul ou Vermelho escolheu primeiro e calcula a porcentagem de vitórias de cada cenário.
    * *By Map Side:* Calcula a taxa de vitórias com base no lado do mapa (assumindo que o usuário da aplicação é sempre o Time Azul/Esquerda e o inimigo é o Vermelho/Direita).
* **Top Bans (Ban Rate) & Top Picks (Pick Rate):** * Estes cards medem a "Taxa de Presença" dos brawlers, indicando o quão "Meta" eles estão.
    * A métrica é calculada dividindo o total de vezes que o brawler foi escolhido ou banido pelo número total de partidas registradas.
* **True Win Rate (Overall):** * Mostra a porcentagem de vitórias reais do Brawler quando ele está em jogo.
    * Banimentos não entram neste cálculo; ele considera apenas as partidas em que o Brawler foi efetivamente escolhido por algum dos times.

### Aba: Synergies & Counters (Sinergias e Confrontos)

* **Best / Worst Synergies (Sinergias do Time):** * Mostra quais pares de Brawlers funcionam melhor (ou pior) quando jogam juntos no mesmo time.
    * O código forma todas as combinações possíveis de duplas dentro dos 3 brawlers do Time Azul e verifica a taxa de vitória dessa dupla. O sistema só exibe duplas que jogaram juntas no mínimo 2 vezes para evitar dados enviesados.
* **Best / Worst Matchups (Counters do Inimigo):** * Indica quais brawlers do seu time lidam melhor ou pior contra brawlers específicos do time inimigo.
    * O sistema cruza individualmente as escolhas do Time Azul com as escolhas do Time Vermelho (ex: "Brawler A vs Brawler B") e calcula a porcentagem de vitórias do seu brawler contra aquele adversário específico.

### Aba: Best by Mode (Melhores por Modo)

* **Agrupamento por Modo de Jogo:**
    * Este card filtra as taxas de vitória dos brawlers categorizando-as pelo modo de jogo específico (como Gem Grab, Brawl Ball, etc.).
    * A lógica aplica uma regra de segurança excelente: exige que o brawler tenha sido jogado no mínimo 2 vezes naquele modo específico para aparecer na lista, garantindo que estatísticas de "uma única partida sortuda" não poluam os dados.

### Aba: Auto Tier List (Lista de Tiers Automática)

* **Classificação S, A, B e C:** * Agrupa os personagens automaticamente em níveis de força com base em duas métricas simultâneas: Taxa de Vitória (Win Rate) e Relevância/Presença (Presence Rate).
    * **Tier S (Muito Forte):** Brawlers com Win Rate de 60% ou mais E presença em 20% ou mais das partidas.
    * **Tier A (Forte):** Brawlers com Win Rate de 50% ou mais E presença em 10% ou mais das partidas.
    * **Tier B (Mediano):** Brawlers com Win Rate a partir de 45%, independentemente da taxa de presença.
    * **Tier C (Fraco):** Qualquer brawler que tenha uma taxa de vitórias inferior a 45%.