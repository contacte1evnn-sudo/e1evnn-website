const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

const closeMenu = () => {
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  navLinks.classList.remove("open");
  document.body.classList.remove("menu-open");
};

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

  if (isOpen) {
    closeMenu();
    return;
  }

  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close navigation menu");
  navLinks.classList.add("open");
  document.body.classList.add("menu-open");
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

window.addEventListener(
  "scroll",
  () => {
    header.classList.toggle("scrolled", window.scrollY > 24);
  },
  { passive: true },
);

/*
 * SPOTIFY PREVIEW COORDINATOR
 * Spotify embeds are controlled through the official iFrame API so only one
 * preview can play at a time. Starting a player rewinds that preview and pauses
 * and rewinds the last active preview.
 */
const spotifyEmbedTargets = document.querySelectorAll(".spotify-embed-target");
let activeSpotifyController = null;
let activeSpotifyContainer = null;
const spotifyPlaybackStates = new WeakMap();

if (spotifyEmbedTargets.length) {
  window.onSpotifyIframeApiReady = (IFrameAPI) => {
    spotifyEmbedTargets.forEach((target) => {
      const embedContainer = target.parentElement;
      const options = {
        uri: target.dataset.spotifyUri,
        width: "100%",
        height: target.dataset.height,
        theme: "dark",
      };

      IFrameAPI.createController(target, options, (controller) => {
        spotifyPlaybackStates.set(controller, { wasPlaying: false });

        const resetController = () => {
          [0, 120, 360].forEach((delay) => {
            window.setTimeout(() => controller.seek(0), delay);
          });
        };

        const activateController = ({ restart = false } = {}) => {
          const previousController = activeSpotifyController;
          const previousContainer = activeSpotifyContainer;
          const isSameController = previousController === controller;

          activeSpotifyController = controller;
          activeSpotifyContainer = embedContainer;
          embedContainer.dataset.playbackState = "playing";

          if (previousController && !isSameController) {
            if (previousContainer) previousContainer.dataset.playbackState = "paused";
            spotifyPlaybackStates.set(previousController, { wasPlaying: false });
            previousController.pause();
            [0, 120, 360].forEach((delay) => {
              window.setTimeout(() => previousController.seek(0), delay);
            });
          }

          if (restart) resetController();
        };

        controller.addListener("playback_started", () => activateController({ restart: true }));

        controller.addListener("playback_update", (event) => {
          const isPlaying = !event.data.isPaused && !event.data.isBuffering;
          const playbackState = spotifyPlaybackStates.get(controller) || { wasPlaying: false };

          // Compact track previews may report playback here before playback_started.
          if (isPlaying) {
            activateController({ restart: !playbackState.wasPlaying });
          }

          if (event.data.isPaused && activeSpotifyController === controller) {
            activeSpotifyController = null;
            activeSpotifyContainer = null;
            embedContainer.dataset.playbackState = "paused";
          }

          playbackState.wasPlaying = isPlaying;
          spotifyPlaybackStates.set(controller, playbackState);
        });
      });
    });
  };

  const spotifyApiScript = document.createElement("script");
  spotifyApiScript.src = "https://open.spotify.com/embed/iframe-api/v1";
  spotifyApiScript.async = true;
  document.body.appendChild(spotifyApiScript);
}

/*
 * MUSIC DATABASE
 * Add future releases or credits by copying one object below and replacing
 * its text and links. The matching cards/rows are rendered automatically.
 */
const officialCatalog = [
  { title: "from me, to you..", artist: "e1evnn", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/album/5iOqEer9Nmi5sgprUD0oHu", apple: "https://music.apple.com/us/album/from-me-to-you/1885517079" },
  { title: "somewhere stuck between death & sleep", artist: "e1evnn", roles: "Artist, Composer", spotify: "https://open.spotify.com/track/2pkFEHxI7LYtSRojGHPUWp", apple: "https://music.apple.com/us/album/somewhere-stuck-between-death-sleep/6772428942?i=6772428943" },
  { title: "Graceful Severance", artist: "e1evnn, sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/5e9bBdMIQOXaEOCeSOdl2P", apple: "https://music.apple.com/us/album/graceful-severance-feat-sos-og/1867726597?i=1867726598" },
  { title: "HIGH HIGH", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/5Efln4nFD2szBPU2ffWb7S", apple: "https://music.apple.com/us/album/high-high-feat-sos-og/1867726597?i=1867726600" },
  { title: "igotapoint", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/0rhNGsKg5KGKzxlluvfCeu", apple: "https://music.apple.com/us/album/igotapoint-feat-sos-og/1867726597?i=1867726781" },
  { title: "Forever (iive)", artist: "e1evnn, sos og, yung sai", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/0BmigmqdWxUREXeUJNRqYS", apple: "https://music.apple.com/us/album/forever-iive-feat-sos-og-yung-sai/1772718828?i=1772719010" },
  { title: "User", artist: "e1evnn & Zelly Ocho", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/1wPQAz5z4PID6Vnlcwt66n", apple: "https://music.apple.com/us/album/user-feat-zelly-ocho/1772718828?i=1772719011" },
  { title: "bad habits (bonus)", artist: "e1evnn", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/7sTQayKTMAtLO7HkSAh8bo", apple: "https://music.apple.com/us/album/bad-habits-bonus/1772718828?i=1772719019" },
  { title: "thefall", artist: "e1evnn & yung sai", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/0zjubmEEaPUAKzxXS8v7eY", apple: "https://music.apple.com/us/album/thefall-feat-yung-sai/1772718828?i=1772719017" },
  { title: "Sanctioned", artist: "e1evnn & Lil Perm", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/6vnnP0N3674n3cKxVLTEHO", apple: "https://music.apple.com/us/album/sanctioned-feat-lil-perm/1810993617?i=1810993618" },
  { title: "IFYKWK", artist: "e1evnn & lil perm", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/5zUx2a2BhVulRPobR5msND", apple: "https://music.apple.com/us/album/ifykwk-feat-lil-perm/1837514520?i=1837514521" },
  { title: "irregular", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/6mQ0yWejWnsPfc29u0fH0v", apple: "https://music.apple.com/us/album/irregular-feat-sos-og/1791380713?i=1791380714" },
  { title: "bedrock", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/1yJ4HpAuX6CWzIpjbGF5XR", apple: "https://music.apple.com/us/album/bedrock-feat-sos-og-single/1783679428" },
  { title: "iimitless", artist: "e1evnn & lil perm", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/2fSA6qwBXYYQdfBf9rTAH1", apple: "https://music.apple.com/us/album/iimitless-feat-lil-perm/1772718828?i=1772719016" },
  { title: "Champagne (again)", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/74xe5Lo2bFLI6K6xqol0XU", apple: "https://music.apple.com/us/album/champagne-again-feat-sos-og/1867726597?i=1867726599" },
  { title: "HAf", artist: "e1evnn & lil perm", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/2anFHlFSdbQY0MBkOoU2bm", apple: "https://music.apple.com/us/album/haf-bonus-track-feat-lil-perm/1867726597?i=1867726782" },
  { title: "starlink", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/3uNpKC5aVbpoQA5Bkdpin6", apple: "https://music.apple.com/us/album/starlink-feat-sos-og/1772718828?i=1772719009" },
  { title: "ZIMABLUU", artist: "e1evnn, J2Rude & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/5xMk3htyhUg6WjaenwPU2w", apple: "https://music.apple.com/us/album/zimabluu-feat-j2rude-sos-og/1772718828?i=1772719014" },
  { title: "Juno", artist: "e1evnn & elou", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/48BHnkRsw36EJFTmbQYjuG", apple: "https://music.apple.com/us/album/juno-feat-elou/1772718828?i=1772719013" },
  { title: "Retro", artist: "e1evnn & sos og", roles: "Artist, Composer, Producer", spotify: "https://open.spotify.com/track/2XZmx8Mi8pwXDqTklPFHPS", apple: "https://music.apple.com/us/album/retro-feat-sos-og/1772718828?i=1772719018" },
];

const productionCredits = [
  { title: "Sanctioned", artist: "E1evnn & Lil Perm", roles: "Producer, Engineer, Mix Engineer", spotify: "https://open.spotify.com/track/6vnnP0N3674n3cKxVLTEHO" },
  { title: "Waver (OG Flow)", artist: "SOS OG", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/6hlkMcjMxnSZdoy0lpIxfj" },
  { title: "Knowing", artist: "Kannon", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/0dNJG75e3kwLEdaL7w5Lym" },
  { title: "No Apologies", artist: "Bando Twin", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/3j0oL2Yh5pGU4ASZWWEqzu" },
  { title: "Squeeze wqqd", artist: "Shiitbagg", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/7E7EARxc9N7AqFObS63ZCQ" },
  { title: "2 Phones Dead", artist: "SOS OG", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/5BDuKNPIpwhtnjBjhWgHoZ" },
  { title: "Being Honest", artist: "Bando Twin", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/1bWjCu1IjWZuxtADCL3pxc" },
  { title: "Michelin Star", artist: "SOS OG", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/2Xe00145yftDsoHxPM6b0s" },
  { title: "BROKE", artist: "J2Rude", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/2cjg6agrTh6mCkhuSPjKTn" },
  { title: "Forever Bae", artist: "Kannon & Dira", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/71WWh59TvmBJHf938nshGB" },
  { title: "I DONT THINK SHE KNO", artist: "Shiitbagg", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/5ga7FzNoLdnIfKtaV29E0P" },
  { title: "T3am R0cket", artist: "Yung Sai", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/1PG7WaWareSQckabpHsYOE" },
  { title: "Crazy", artist: "Yung Sai", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/3RlYxWckMM5Z5wgyjOMX7n" },
  { title: "F’d Up", artist: "ihatejasai", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/1Dnsr9OefttjvFXW56otts" },
  { title: "X MAN", artist: "ihatejasai", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/3MVXgfSUv632m4jla4sbNv" },
  { title: "Double RR", artist: "Bando Twin", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/6O1rAJVGtwjRcydWil7W9f" },
  { title: "TALK FACTS", artist: "Bando Twin", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/0xS7iVP6VdIPLDO0IUd2zg" },
  { title: "Man Eater", artist: "ihatejasai", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/5L3c8Y1CZKELl8y6SH5jXn" },
  { title: "Love Lost Love Found", artist: "Kannon", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/3whIlCymlf0XR1gcznF5H1" },
  { title: "Solar Exchange", artist: "Kannon", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/3cwBBRZW5DMcC2chZogwyP" },
  { title: "Kryptonite", artist: "J2Rude", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/4GtJ76fE9BJvKkWzDsUPZv" },
  { title: "Love Lost", artist: "J2Rude & Lil Perm", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/1fhKICjdTtXAKXE7B7A5fO" },
  { title: "Wawa Run", artist: "J2Rude", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/6BvXsj4WzdT9GjWtSR5uXp" },
  { title: "Summertime Love", artist: "J2Rude & Sunny", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/2rbOU8ZlSspfB3bPipF1k1" },
  { title: "Writers Block", artist: "Bando Twin", roles: "Recording Engineer / Mixing / Mastering", spotify: "https://open.spotify.com/track/1U2qosDIaCQw94VZxvQnm2" },
];

const catalogGrid = document.querySelector("[data-catalog-grid]");
const creditsList = document.querySelector("[data-credits-list]");

if (catalogGrid) {
  catalogGrid.innerHTML = officialCatalog
    .map(
      (release) => `
        <article class="catalog-card">
          <h4>${release.title}</h4>
          <p class="catalog-artist">${release.artist}</p>
          <p class="catalog-role">${release.roles}</p>
          <div class="catalog-links">
            <a href="${release.spotify}" target="_blank" rel="noopener">Spotify <span aria-hidden="true">&nearr;</span></a>
            ${release.apple ? `<a href="${release.apple}" target="_blank" rel="noopener">Apple Music <span aria-hidden="true">&nearr;</span></a>` : ""}
          </div>
        </article>
      `,
    )
    .join("");
}

if (creditsList) {
  creditsList.innerHTML = productionCredits
    .map(
      (credit, index) => `
        <article class="credit-item">
          <span class="credit-number">${String(index + 1).padStart(2, "0")}</span>
          <h4>${credit.title}</h4>
          <p class="credit-artist">${credit.artist}</p>
          <p class="credit-role">${credit.roles}</p>
          <a class="credit-link" href="${credit.spotify}" target="_blank" rel="noopener" aria-label="Listen to ${credit.title} by ${credit.artist} on Spotify">Spotify <span aria-hidden="true">&nearr;</span></a>
        </article>
      `,
    )
    .join("");
}

// Open linked service/policy details when visitors arrive through a CTA or service row.
const openLinkedDetails = () => {
  if (!window.location.hash) return;

  const target = document.querySelector(window.location.hash);
  if (target instanceof HTMLDetailsElement) target.open = true;
};

window.addEventListener("hashchange", openLinkedDetails);
openLinkedDetails();

// Service CTAs carry their project type into the Contact inquiry form.
const projectSelect = document.querySelector("[data-project-select]");

document.querySelectorAll(".inquiry-cta").forEach((cta) => {
  cta.addEventListener("click", () => {
    const projectType = cta.dataset.projectType;

    if (projectSelect && projectType) {
      projectSelect.value = projectType;
    }
  });
});

/*
 * INQUIRY FORM
 * This mailto flow keeps the static site functional without a backend.
 * Remove this listener after connecting the form action to Formspree or another service.
 */
const inquiryForm = document.querySelector("[data-inquiry-form]");
const formStatus = document.querySelector("[data-form-status]");

if (inquiryForm) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!inquiryForm.reportValidity()) return;

    const formData = new FormData(inquiryForm);
    const projectType = formData.get("projectType");
    const subject = `Project Inquiry — ${projectType} — ${formData.get("name")}`;
    const body = [
      "11S IINFINITY LLC — New Project Inquiry",
      "",
      `Name: ${formData.get("name")}`,
      `Email: ${formData.get("email")}`,
      `Project Type: ${projectType}`,
      `Song / Project Name: ${formData.get("projectName")}`,
      `Desired Turnaround: ${formData.get("turnaround") || "Not specified"}`,
      "",
      "Message:",
      formData.get("message"),
    ].join("\n");

    if (formStatus) {
      formStatus.textContent = "Opening your email app with the inquiry prepared...";
    }

    window.location.href = `mailto:contact.e1evnn@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}
