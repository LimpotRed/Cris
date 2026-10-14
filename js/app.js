(() => {
  "use strict";

  const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const fullDate = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
  const letters = window.CARTAS || {};
  const seasonSelect = document.getElementById("season-select");
  const episodesSection = document.getElementById("episodios");
  const episodesGrid = document.getElementById("episodes-grid");
  const dialog = document.getElementById("letter-dialog");
  let lastFocus = null;

  const saoPauloDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "numeric", day: "numeric"
  });
  const today = () => {
    const parts = Object.fromEntries(saoPauloDate.formatToParts(new Date())
      .filter(part => part.type !== "literal")
      .map(part => [part.type, Number(part.value)]));
    return new Date(parts.year, parts.month - 1, parts.day);
  };
  const dateKey = date => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const node = (tag, className, content) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content !== undefined) element.textContent = content;
    return element;
  };

  function getLetter(date) {
    const value = letters[dateKey(date)];
    return value && typeof value.texto === "string" && value.texto.trim() ? value : null;
  }
  function isAvailable(date) {
    return date <= today() ? getLetter(date) : null;
  }

  // Outubro de 2026 começa no dia 12. Cada mês seguinte é uma temporada inteira.
  const currentMonthIndex = Math.max(0, (today().getFullYear() - 2026) * 12 + today().getMonth() - 9);
  const seasons = Array.from({ length: currentMonthIndex + 2 }, (_, index) => {
    const first = new Date(2026, 9 + index, 1);
    return {
      index,
      year: first.getFullYear(),
      month: first.getMonth(),
      startDay: index === 0 ? 12 : 1,
      endDay: new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
    };
  });
  let selectedSeason = null;

  function publishedCount(season) {
    let count = 0;
    for (let day = season.startDay; day <= season.endDay; day += 1) {
      if (isAvailable(new Date(season.year, season.month, day))) count += 1;
    }
    return count;
  }

  function renderSeasons() {
    const placeholder = node("option", "", "Escolha uma temporada");
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    seasonSelect.replaceChildren(placeholder);

    for (const season of seasons) {
      const option = node("option", "", `Temporada ${season.index + 1} ${String.fromCharCode(8212)} ${MONTHS[season.month]} ${season.year}`);
      option.value = String(season.index);
      seasonSelect.append(option);
    }
  }

  function renderEpisodes() {
    const season = seasons[selectedSeason];
    const total = season.endDay - season.startDay + 1;
    document.getElementById("season-label").textContent = `TEMPORADA ${String(selectedSeason + 1).padStart(2, "0")}`;
    document.getElementById("episodes-title").replaceChildren(MONTHS[season.month] + " ", node("span", "", String(season.year)));
    document.getElementById("episodes-description").textContent = selectedSeason === 0
      ? "A partir de 12 de outubro: uma data, uma carta, um pedacinho de nós."
      : `Um episódio para cada dia de ${MONTHS[season.month].toLowerCase()}.`;
    document.getElementById("episode-count").textContent = `${publishedCount(season)} de ${total} cartas disponíveis`;
    episodesGrid.replaceChildren();

    for (let day = season.startDay; day <= season.endDay; day += 1) {
      const date = new Date(season.year, season.month, day);
      const letter = isAvailable(date);
      const future = date > today();
      const number = day - season.startDay + 1;
      const card = node("button", "episode-card");
      card.type = "button";
      card.disabled = !letter;
      if (letter) card.classList.add("is-available");
      if (future) card.classList.add("is-future");
      const art = node("span", "episode-art");
      art.append(node("span", "episode-art-label", "ENTRE NÓS"), node("span", "episode-art-number", String(number).padStart(2, "0")), node("span", "episode-art-heart", "♥"));
      const info = node("span", "episode-info");
      const upper = node("span", "episode-upper");
      upper.append(node("span", "episode-index", `EPISÓDIO ${String(number).padStart(2, "0")}`), node("span", "episode-date", shortDate.format(date).replace(".", "").toUpperCase()));
      const title = letter && typeof letter.titulo === "string" && letter.titulo.trim() ? letter.titulo.trim() : `Carta do dia ${day}`;
      info.append(
        upper,
        node("span", "episode-title", letter ? title : future ? "Um capítulo por vir" : "Uma carta por escrever"),
        node("span", `episode-status${letter ? " available" : ""}`, letter ? "Ler carta  →" : future ? "Em breve" : "Aguardando carta")
      );
      card.append(art, info);
      if (letter) {
        card.setAttribute("aria-label", `Ler episódio ${number}, ${title}, ${fullDate.format(date)}`);
        card.addEventListener("click", () => openLetter(date, number, letter));
      }
      episodesGrid.append(card);
    }
  }

  function selectSeason(index) {
    if (!Number.isInteger(index) || !seasons[index]) return;
    selectedSeason = index;
    renderEpisodes();
    episodesSection.hidden = false;
    episodesSection.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function openLetter(date, number, letter) {
    lastFocus = document.activeElement;
    document.getElementById("letter-overline").textContent = `TEMPORADA ${String(selectedSeason + 1).padStart(2, "0")}  ·  EPISÓDIO ${String(number).padStart(2, "0")}`;
    document.getElementById("letter-title").textContent = typeof letter.titulo === "string" && letter.titulo.trim() ? letter.titulo.trim() : `Carta do dia ${date.getDate()}`;
    document.getElementById("letter-date").textContent = fullDate.format(date);
    const body = document.getElementById("letter-body");
    body.replaceChildren();
    for (const paragraph of letter.texto.trim().split(/\n\s*\n/)) body.append(node("p", "", paragraph.trim()));
    const figure = document.getElementById("letter-figure");
    const image = document.getElementById("letter-image");
    if (typeof letter.foto === "string" && letter.foto.trim()) {
      image.src = letter.foto.trim();
      document.getElementById("letter-caption").textContent = typeof letter.legenda === "string" ? letter.legenda : "";
      figure.hidden = false;
    } else {
      figure.hidden = true;
      image.removeAttribute("src");
    }
    dialog.showModal();
    document.getElementById("dialog-close").focus();
  }

  document.getElementById("dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => { if (lastFocus?.focus) lastFocus.focus(); });

  episodesSection.hidden = true;
  renderSeasons();
  seasonSelect.addEventListener("change", () => {
    if (seasonSelect.value === "") {
      selectedSeason = null;
      episodesGrid.replaceChildren();
      episodesSection.hidden = true;
      return;
    }
    selectSeason(Number(seasonSelect.value));
  });
})();
