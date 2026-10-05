// You never need to edit this file. Edit games.js instead.

function readBlock(text, keys) {
  var result = {}, last = null;
  text.replace(/\r/g, "").split("\n").forEach(function (raw) {
    var line = raw.trim();
    if (!line) return;
    var m = line.match(/^([A-Za-z]+)\s*:\s*(.*)$/);
    if (m && keys.indexOf(m[1].toLowerCase()) !== -1) {
      last = m[1].toLowerCase();
      result[last] = m[2];
    } else if (last) {
      result[last] += "\n" + line;
    }
  });
  return result;
}

function readGames(text) {
  if (typeof text !== "string") return null;
  return text.replace(/\r/g, "").split(/\n\s*\n/)
    .map(function (b) { return readBlock(b, ["name", "description", "file", "link"]); })
    .filter(function (g) { return g.name; });
}

function fileType(path) {
  var ext = path.split(".").pop().toUpperCase();
  return ext && ext !== path.toUpperCase() && ext.length <= 5 ? " (" + ext + " file)" : "";
}

function el(tag, className, text) {
  var e = document.createElement(tag);
  if (className) e.className = className;
  if (text) e.textContent = text;
  return e;
}

function gameCount(n) { return n === 1 ? "1 game" : n + " games"; }

function showGames(games, area, count) {
  if (!games) {
    area.appendChild(el("p", "notice", "The game list could not be loaded. Check that games.js is in the same folder as this page."));
    return;
  }
  count.textContent = gameCount(games.length);
  if (!games.length) {
    area.appendChild(el("p", "notice", "No games here yet. Check back soon!"));
    return;
  }
  var list = el("ul", "games");
  games.forEach(function (g) {
    var li = el("li");
    var card = el("article", "game");
    card.appendChild(el("h2", "", g.name));
    if (g.description) card.appendChild(el("p", "desc", g.description));
    var actions = el("div", "actions");
    if (g.file) {
      var dl = el("a", "btn", "Download " + g.name + fileType(g.file));
      dl.href = g.file;
      dl.setAttribute("download", "");
      actions.appendChild(dl);
    }
    if (g.link) {
      var play = el("a", "btn play", "Play " + g.name + " online");
      play.href = g.link;
      actions.appendChild(play);
    }
    if (actions.children.length) card.appendChild(actions);
    li.appendChild(card);
    list.appendChild(li);
  });
  area.appendChild(list);
}

// Expandable menu
(function () {
  var button = document.getElementById("menu-button");
  var list = document.getElementById("menu-list");
  var page = document.body.getAttribute("data-page");
  var current = page === "experimental" ? "games" : page;
  list.querySelectorAll("a").forEach(function (a) {
    if (a.getAttribute("data-for") === current) a.setAttribute("aria-current", "page");
  });
  function setOpen(open) {
    button.setAttribute("aria-expanded", open ? "true" : "false");
    list.hidden = !open;
  }
  button.addEventListener("click", function () {
    setOpen(button.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !list.hidden) { setOpen(false); button.focus(); }
  });
  document.addEventListener("click", function (e) {
    if (!list.hidden && !e.target.closest("nav")) setOpen(false);
  });
})();

// Page content
(function () {
  var site = readBlock(typeof SITE === "string" ? SITE : "", ["title", "welcome", "about"]);
  var exp = readBlock(typeof EXPERIMENTAL === "string" ? EXPERIMENTAL : "", ["title", "about"]);
  var siteTitle = site.title || "My Games";
  var expTitle = exp.title || "Experimental games";
  var expGames = readGames(typeof EXPERIMENTAL_GAMES === "string" ? EXPERIMENTAL_GAMES : undefined);
  var page = document.body.getAttribute("data-page");
  var titleEl = document.getElementById("page-title");
  var aboutEl = document.getElementById("page-about");
  var area = document.getElementById("game-area");
  var count = document.getElementById("game-count");

  document.getElementById("site-name").textContent = siteTitle;
  document.getElementById("footer-text").textContent =
    "\u00A9 " + new Date().getFullYear() + " " + siteTitle;

  if (page === "home") {
    document.title = siteTitle;
    titleEl.textContent = site.welcome || "Welcome";
    aboutEl.textContent = site.about || "";
  } else if (page === "games") {
    document.title = "Games - " + siteTitle;
    showGames(readGames(typeof GAMES === "string" ? GAMES : undefined), area, count);
    if (expGames && expGames.length) {
      document.getElementById("experimental-button").textContent =
        expTitle + " (" + expGames.length + ")";
      document.getElementById("experimental-link").hidden = false;
    }
  } else if (page === "experimental") {
    document.title = expTitle + " - " + siteTitle;
    titleEl.textContent = expTitle;
    aboutEl.textContent = exp.about || "";
    showGames(expGames, area, count);
  }
})();
