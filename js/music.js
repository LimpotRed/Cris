(() => {
  "use strict";

  // Os nomes exibidos no seletor seguem a ordem desta lista.
  const tracks = [
    { title: "Música 1", src: "musica.mp3" },
    { title: "Música 2", src: "musicas antigas/musica.mp3" },
    { title: "Música 3", src: "musicas antigas/musica2.mp3" },
    { title: "Música 4", src: "musicas antigas/musica3.mp3" },
    { title: "Música 5", src: "musicas antigas/musica4.m4a" }
  ];
  const audio = document.getElementById("bg-music");
  if (!audio) return;

  const selectors = [...document.querySelectorAll("[data-music-select]")];
  const buttons = [...document.querySelectorAll("[data-music-toggle], #music-button")];
  const statusFields = [...document.querySelectorAll("[data-music-status]")];
  let selected = tracks[0];
  let playRequest = 0;

  try {
    selected = tracks.find(track => track.src === localStorage.getItem("entre-nos-music")) || selected;
  } catch { /* O seletor continua funcionando sem armazenamento local. */ }

  audio.volume = .2;
  audio.src = selected.src;
  for (const select of selectors) {
    for (const track of tracks) select.add(new Option(track.title, track.src));
    select.value = selected.src;
    select.addEventListener("change", () => {
      const next = tracks.find(track => track.src === select.value);
      if (!next) return;
      const wasPlaying = !audio.paused;
      playRequest += 1;
      audio.pause();
      selected = next;
      for (const other of selectors) other.value = next.src;
      audio.src = next.src;
      audio.load();
      try { localStorage.setItem("entre-nos-music", next.src); } catch { /* A escolha vale nesta visita. */ }
      setStatus(wasPlaying ? "" : "Música selecionada. Aperte Ouvir para começar.");
      if (wasPlaying) playSelected();
    });
  }

  function setStatus(message) {
    for (const field of statusFields) field.textContent = message;
  }

  function updateButtons() {
    const playing = !audio.paused;
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(playing));
      button.setAttribute("aria-label", playing ? "Pausar música" : "Tocar música selecionada");
      const label = button.querySelector("[data-music-label]") || button.querySelector("#music-label");
      if (label) label.textContent = playing ? "Pausar" : "Ouvir";
    }
  }

  async function playSelected() {
    const request = ++playRequest;
    setStatus("Preparando música...");
    try {
      await audio.play();
      if (request === playRequest) setStatus(`Tocando: ${selected.title}`);
    } catch {
      if (request === playRequest) setStatus("Não foi possível tocar esta música. Escolha outra faixa ou toque em Ouvir.");
    }
    updateButtons();
  }

  for (const button of buttons) {
    button.addEventListener("click", () => {
      if (audio.paused) {
        playSelected();
      } else {
        playRequest += 1;
        audio.pause();
        setStatus("Música pausada.");
      }
    });
  }

  audio.addEventListener("play", updateButtons);
  audio.addEventListener("pause", updateButtons);
  audio.addEventListener("error", () => setStatus("Esta faixa não pôde ser reproduzida. Escolha outra música."));
  updateButtons();
})();
