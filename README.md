## ROSE - Reactive Organisms Simulation Ecosystem

Este projeto é um simulador de ecossistema que visa reproduzir a interação entre diferentes tipos de entidades em um ambiente virtual. O ecossistema é composto por animais (ovelhas e lobos), plantas (grama) e água, todos interagindo e competindo por recursos como alimento, água e espaço.

### Visão Geral

O simulador é executado em uma grade, onde cada célula representa um espaço no ambiente. Os principais elementos são:

-   Ovelhas: Animais herbívoros que se movem em busca de comida (grama) e água. Elas podem se reproduzir quando em contato com um parceiro do sexo oposto.

-   Lobos: Animais carnívoros que caçam ovelhas para obter alimento. Eles também precisam encontrar água para sobreviver.

-   Grama: Plantas que servem de alimento para as ovelhas.

-   Água: Recurso essencial para a sobrevivência de todos os seres vivos.

## Entidades e Comportamentos

### Ovelhas

-   As ovelhas têm uma vida útil e devem encontrar comida (grama) e água para sobreviver.

-   Elas se movem aleatoriamente em busca de recursos, como grama e água.

-   Ovelhas têm diferentes necessidades, como fome e sede, e devem encontrar recursos para supri-las.

-   O ecossistema simulado inclui ovelhas, sendo as fêmeas capazes de engravidar ao entrar em contato com machos. Após a gestação, as ovelhas fêmeas podem dar à luz a filhotes. Os machos das ovelhas também buscam ativamente as fêmeas para a reprodução.

-   A população de ovelhas é limitada, e novas ovelhas só podem nascer se houver espaço disponível no ecossistema.

### Lobos

-   Os lobos são predadores que caçam as ovelhas para obter alimento.

-   Assim como as ovelhas, os lobos também precisam de água para sobreviver.

-   Lobos se movem de forma aleatória em busca de ovelhas e água.

-   No ecossistema simulado, os lobos também seguem uma dinâmica reprodutiva. As fêmeas dos lobos têm a capacidade de reproduzir e dar à luz a filhotes após um período de gestação. Os machos dos lobos também demonstram comportamento de busca por fêmeas para o acasalamento.

-   O número de lobos também é limitado, e novos lobos só podem nascer se houver espaço disponível no ecossistema.

### Grama

-   A grama é uma planta que cresce em locais específicos do ecossistema.

-   As ovelhas se alimentam da grama para se manterem vivas.

### Água

-   A água é um recurso essencial para todas as entidades do ecossistema.

-   Tanto ovelhas quanto lobos precisam encontrar água para saciar sua sede.

## Funcionamento do Jogo

O jogo é executado em uma grade, onde cada célula representa um espaço no ambiente. A cada iteração, as entidades (ovelhas e lobos) se movem de acordo com suas necessidades e comportamentos. Elas buscam alimento e água, se reproduzem e interagem entre si.

No jogo, foi adicionada uma restrição adicional ao processo de reprodução das entidades (ovelhas e lobos). Agora, as entidades não podem se reproduzir com parentes próximos, como filhos ou irmãos. Essa medida visa evitar a consanguinidade excessiva e garantir uma maior diversidade genética na população.

O jogo continua até que a população alcance seu limite ou até que todas as ovelhas ou lobos morram devido a falta de recursos ou ataques de predadores.

## Configurações

Aqui, você pode personalizar diversos aspectos que afetam o funcionamento do ambiente do jogo. As configurações abaixo influenciam o comportamento das entidades (ovelhas e lobos) e os parâmetros do mundo em que elas interagem.

## Seed para Reprodutibilidade

Além das configurações, você também pode definir uma "seed" para gerar simulações identificadas e reproduzíveis. A seed é um número ou valor que influencia a geração de eventos aleatórios no jogo. Ao utilizar a mesma seed, você pode recriar exatamente a mesma simulação, o que é útil para fins de depuração, comparação ou compartilhamento de resultados com outras pessoas.

## Legenda do Projeto

Neste projeto, representamos diferentes animais usando códigos de cores RGB.

-   Lobos: Cinza Medio #808080.
-   Ovelhas: Cinza Claro #F5F5F5.
-   Água: Azul #3366CC.
-   Grama: Verde #019608.

## Considerações Finais

Este projeto é apenas um simulador básico de ecossistema, com comportamentos e regras simplificadas. É possível aprimorá-lo adicionando novas características, melhorando a inteligência artificial das entidades e expandindo o ambiente.
