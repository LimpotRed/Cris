# Entre Nós

Um catálogo de cartas de amor. A tela inicial tem o coração de entrada e um contador desde **12/09/2026, 00h00**, no horário de São Paulo. A nova série de cartas começa em **12/10/2026**.

## Temporadas e episódios

- **Temporada 1:** outubro de 2026, do dia 12 ao dia 31.
- **Temporada 2:** novembro de 2026, do dia 1º ao dia 30.
- Cada mês seguinte aparece automaticamente como uma nova temporada.
- Cada dia do mês tem um episódio. Ele só pode ser aberto depois da data e quando houver uma carta publicada.

Ao abrir o catálogo, os episódios ficam ocultos. Escolha uma opção no seletor de temporadas para ver as cartas daquele mês.

As oito cartas antigas foram removidas do site. A nova série começa com a carta **Piloto**, em 12/10/2026, no arquivo [`js/cartas.js`](js/cartas.js).

## Escrever uma carta

Edite `js/cartas.js` e adicione uma entrada com a data no formato `AAAA-MM-DD`. Exemplo de estrutura (substitua os textos pelos seus):

```js
window.CARTAS = {
  "2026-10-12": {
    titulo: "Título da carta",
    texto: "Primeiro parágrafo.\n\nSegundo parágrafo."
  },
  "2026-10-13": {
    titulo: "Outro título",
    texto: "O texto desta carta.",
    foto: "fotos/capa-casal.jpeg",
    legenda: "Legenda opcional"
  }
};
```

`titulo` é opcional; sem ele, o site usa “Carta do dia 12” ou a data correspondente. `texto` é necessário para a carta aparecer. `foto` e `legenda` são opcionais. Separe parágrafos com `\n\n`. Não coloque duas entradas para a mesma data.

Depois de editar, publique os arquivos atualizados no serviço onde o site estiver hospedado. Como o projeto é estático, as cartas só aparecem para outra pessoa **depois da publicação**. Cartas preparadas para datas futuras ficam indisponíveis até o respectivo dia no horário de São Paulo.

Para trocar a foto grande do catálogo, substitua `fotos/capa-casal.jpeg` mantendo exatamente esse nome e a extensão `.jpeg`.

## Trilha sonora

O seletor compacto fica no cabeçalho do catálogo e também dentro de cada carta, para trocar a faixa durante a leitura. Escolha uma música e aperte **Ouvir**; use o mesmo botão para pausar. Ao trocar de faixa, a reprodução continua apenas se a música anterior já estava tocando. A escolha é lembrada neste navegador.

As cinco faixas estão listadas em `js/music.js`. Para mudar o nome exibido, edite o campo `title` da faixa. Para acrescentar outra música, coloque o arquivo no projeto e adicione seu caminho à lista `tracks`.

## Visualizar localmente

Abra `index.html` no navegador. O botão no coração leva ao catálogo em `cartas.html`. A música começa somente após uma ação no controle de reprodução.

Para hospedar, envie `index.html`, `cartas.html`, as pastas `css`, `js`, `fotos`, `musicas antigas` e `musica.mp3` mantendo a estrutura de arquivos.
