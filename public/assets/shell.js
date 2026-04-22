// Shared shell: renders top bar, header, nav, ticker, footer, back-to-top, cookies.
(function () {
  const CURRENT = document.body.dataset.page || "home";
  const dateFr = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  const navItems = [
    { id: "actualites", label: "Actualités", href: "actualites.html" },
    { id: "resultats", label: "Résultats", href: "resultats.html" },
    { id: "classements", label: "Classements", href: "classements.html" },
    { id: "coaching", label: "Coaching", href: "coaching.html" },
    { id: "portraits", label: "Portraits", href: "portraits.html" },
    { id: "international", label: "International", href: "international.html" },
    { id: "live", label: "Live", href: "live.html", live: true },
    { id: "videos", label: "Vidéos", href: "videos.html" },
  ];

  const tickerItems = [
    "Open Dakar 2026 : Diallo et Sow sacrés champions devant 300 spectateurs",
    "WPT Africa Series Dakar officialisé pour le 7-8 juin 2026 à la TGS Arena",
    "Aminata Ba reste N°1 sénégalaise avec 1 380 points",
    "Ibou Ndiaye, DTN : « Dans cinq ans, nous serons top 20 africain »",
    "Classement WPT : Galán et Lebrón conservent la tête après Mexique Open",
    "Championnat National U18 : Oumar Diallo survole la compétition",
    "Le Saly Padel Club ouvre officiellement ses 6 nouvelles pistes",
  ];

  const topbar = `
    <div class="topbar">
      <div class="container">
        <div class="topbar-left">
          <span><span class="dot"></span> ${dateFr}</span>
          <span>📍 Dakar, Sénégal</span>
        </div>
        <div class="topbar-right">
          <div class="socials" aria-label="Réseaux sociaux">
            <a href="#" aria-label="Facebook">f</a>
            <a href="#" aria-label="Instagram">◉</a>
            <a href="#" aria-label="YouTube">▶</a>
            <a href="#" aria-label="TikTok">♪</a>
          </div>
          <a href="#newsletter">Newsletter</a>
          <div class="lang-switch"><span class="active">FR</span> / <span>EN</span></div>
        </div>
      </div>
    </div>`;

  const header = `
    <header class="header" id="siteHeader">
      <div class="header-inner">
        <a class="logo" href="index.html" aria-label="Padel Magazine — Accueil">
          <img src="${(window.__resources&&window.__resources.logoLight)||'assets/logo-light.png'}" alt="Padel Magazine">
        </a>
        <div class="leaderboard">728 × 90 — Sponsor Leaderboard</div>
        <div class="header-right">
          <button class="icon-btn" aria-label="Recherche" id="searchBtn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <button class="icon-btn hamburger" aria-label="Menu" id="hamburgerBtn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          </button>
        </div>
      </div>
    </header>`;

  const nav = `
    <nav class="nav">
      <div class="nav-inner">
        <ul class="nav-links" id="navLinks">
          ${navItems.map(i => `
            <li><a href="${i.href}" class="${i.id === CURRENT ? "active" : ""}">
              ${i.label}${i.live ? `<span class="nav-live-dot"></span>` : ""}
            </a></li>`).join("")}
        </ul>
        <div style="display:flex;gap:10px;align-items:center;">
          <a href="apropos.html" style="font-size:12px;color:var(--gray);font-family:var(--f-cond);text-transform:uppercase;letter-spacing:.06em;">À propos</a>
        </div>
      </div>
    </nav>`;

  const ticker = `
    <div class="ticker">
      <div class="ticker-label">Breaking News</div>
      <div class="ticker-track">
        <div class="ticker-move">
          ${tickerItems.map(t => `<span>${t}</span>`).join("")}
          ${tickerItems.map(t => `<span>${t}</span>`).join("")}
        </div>
      </div>
    </div>`;

  const footer = `
    <footer class="footer">
      <div class="foot-grid">
        <div>
          <div class="foot-logo"><img src="${(window.__resources&&window.__resources.logoDark)||'assets/logo-dark.png'}" alt="Padel Magazine"></div>
          <p class="tagline">Le premier magazine en ligne dédié au padel au Sénégal et en Afrique francophone.</p>
          <div class="socials" style="margin-top:14px;">
            <a href="#">f</a><a href="#">◉</a><a href="#">▶</a><a href="#">♪</a>
          </div>
        </div>
        <div>
          <h4>Rubriques</h4>
          ${navItems.map(i => `<a href="${i.href}">${i.label}</a>`).join("")}
        </div>
        <div>
          <h4>Informations</h4>
          <a href="apropos.html">À propos</a>
          <a href="apropos.html#contact">Contact</a>
          <a href="apropos.html#pub">Publicité</a>
          <a href="#">Mentions légales</a>
          <a href="#">CGU</a>
        </div>
        <div>
          <h4>Contact</h4>
          <p style="margin:0;line-height:1.7;">
            <a href="mailto:redaction@padelmagazine.sn">redaction@padelmagazine.sn</a><br>
            TGS Arena, Almadies<br>
            Dakar, Sénégal 🇸🇳
          </p>
        </div>
      </div>
      <div class="sub-foot">
        <span>© 2026 Padel Magazine Sénégal — Tous droits réservés.</span>
        <form class="mini-news" onsubmit="event.preventDefault();this.querySelector('input').value='';alert('Merci ! Vous recevrez notre prochaine newsletter très bientôt.');">
          <input type="email" placeholder="votre@email.com" required>
          <button type="submit">S'abonner</button>
        </form>
      </div>
    </footer>`;

  const extras = `
    <button class="back-top" id="backTop" aria-label="Retour en haut">↑</button>
    <div class="cookie" id="cookie">
      <p>Nous utilisons des cookies pour améliorer votre expérience sur Padel Magazine.</p>
      <div class="cookie-btns">
        <button class="btn btn-primary" onclick="document.getElementById('cookie').classList.add('hidden')">Accepter</button>
        <button class="btn btn-outline" onclick="document.getElementById('cookie').classList.add('hidden')">Refuser</button>
        <button class="btn btn-outline" onclick="alert('Politique cookies — démo')">En savoir plus</button>
      </div>
    </div>`;

  // Mount shells
  const shellTop = document.getElementById("shell-top");
  if (shellTop) shellTop.innerHTML = topbar + header + nav + ticker;
  const shellBottom = document.getElementById("shell-bottom");
  if (shellBottom) shellBottom.innerHTML = footer + extras;

  // Hamburger
  const hb = document.getElementById("hamburgerBtn");
  if (hb) hb.addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

  // Header scroll shadow
  const header_el = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    if (header_el) header_el.classList.toggle("scrolled", window.scrollY > 10);
    const bt = document.getElementById("backTop");
    if (bt) bt.classList.toggle("show", window.scrollY > 400);
  });

  const bt = document.getElementById("backTop");
  if (bt) bt.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Search modal stub
  const sb = document.getElementById("searchBtn");
  if (sb) sb.addEventListener("click", () => {
    const q = prompt("Rechercher dans Padel Magazine :");
    if (q) alert("Résultats pour « " + q + " » — (démo)");
  });
})();
