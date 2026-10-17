/* =========================================================
   CeFoPExD – Interactions du site
   ========================================================= */
(function () {
  "use strict";

  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

  /* ---------- Données des filières ---------- */
  const FILIERES = {
    informatique: {
      titre: "Informatique appliquée", icon: "fa-solid fa-desktop", color: "var(--blue)",
      desc: "Une formation complète pour maîtriser les outils numériques et devenir un technicien recherché par les entreprises.",
      skills: ["Programmation (Python, JavaScript, PHP)", "Administration réseaux et systèmes", "Conception de bases de données", "Maintenance informatique et sécurité", "Création de sites web et d'applications"],
      jobs: ["Développeur web", "Technicien réseau", "Administrateur système", "Support informatique", "Infographiste"],
      duree: "2 ans", diplome: "Certificat de qualification professionnelle"
    },
    mecatronique: {
      titre: "Mécatronique", icon: "fa-solid fa-gear", color: "var(--red)",
      desc: "Au croisement de la mécanique, de l'électronique et de l'informatique, la mécatronique forme des techniciens polyvalents de l'industrie.",
      skills: ["Mécanique et lecture de plans", "Électronique et électrotechnique", "Automatismes et automates programmables", "Robotique de base", "Maintenance industrielle"],
      jobs: ["Technicien de maintenance", "Automaticien", "Électromécanicien", "Technicien de production"],
      duree: "2 ans", diplome: "Certificat de qualification professionnelle"
    },
    agro: {
      titre: "Agro-alimentaire", icon: "fa-solid fa-leaf", color: "var(--green)",
      desc: "Apprenez à transformer, conserver et valoriser les produits agricoles locaux selon les normes d'hygiène et de qualité.",
      skills: ["Techniques de transformation des produits", "Hygiène, qualité et sécurité alimentaire (HACCP)", "Conditionnement et conservation", "Gestion d'une unité de production", "Entrepreneuriat agricole"],
      jobs: ["Technicien agro-alimentaire", "Agent qualité", "Opérateur de production", "Entrepreneur agro-industriel"],
      duree: "18 mois", diplome: "Certificat de qualification professionnelle"
    },
    energie: {
      titre: "Énergie renouvelable", icon: "fa-solid fa-sun", color: "var(--orange)",
      desc: "Formez-vous à l'installation et à la maintenance des systèmes solaires et éoliens pour accompagner la transition énergétique.",
      skills: ["Dimensionnement d'installations photovoltaïques", "Installation et câblage solaire", "Électricité du bâtiment", "Maintenance des systèmes énergétiques", "Efficacité énergétique"],
      jobs: ["Installateur solaire", "Technicien en énergies renouvelables", "Électricien", "Auditeur énergétique"],
      duree: "18 mois", diplome: "Certificat de qualification professionnelle"
    }
  };

  /* ---------- En-tête ---------- */
  const header = $("#header");
  const toTop = $("#toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);
    toTop.classList.toggle("is-visible", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* Menu mobile */
  const burger = $("#burger");
  const nav = $("#nav");
  const closeNav = () => {
    nav.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  $$("a", nav).forEach(a => a.addEventListener("click", closeNav));

  /* Lien actif selon la section visible */
  const links = $$(".nav__link");
  const sections = links.map(l => $(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach(s => spy.observe(s));

  /* ---------- Recherche ---------- */
  const searchBar = $("#searchBar");
  const searchInput = $("#searchInput");
  $("#searchBtn").addEventListener("click", () => {
    searchBar.classList.toggle("is-open");
    if (searchBar.classList.contains("is-open")) setTimeout(() => searchInput.focus(), 250);
  });
  $("#searchForm").addEventListener("submit", e => {
    e.preventDefault();
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;
    const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    const target = $$(".card, .news__item, .faq__item, .contact-card")
      .find(el => norm(el.textContent).includes(norm(q)));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      if (target.matches("details")) target.open = true;
      target.classList.remove("is-highlight");
      void target.offsetWidth;
      target.classList.add("is-highlight");
      searchBar.classList.remove("is-open");
    } else {
      searchInput.value = "";
      searchInput.placeholder = `Aucun résultat pour « ${q} »`;
    }
  });

  /* ---------- Slider héro ---------- */
  const SLIDES = [
    { title: 'Votre avenir professionnel <span>commence ici !</span>', text: "Le Centre de Formation Professionnelle d'Excellence de Dévikimè vous offre une formation de qualité, adaptée aux besoins du marché de l'emploi et aux défis de demain." },
    { title: 'Apprendre un métier, <span>bâtir son avenir</span>', text: "Des formations pratiques dans des ateliers équipés, encadrées par des professionnels du secteur." },
    { title: "L'énergie de demain <span>se prépare aujourd'hui</span>", text: "Rejoignez nos filières d'avenir et devenez acteur du développement durable au Togo et en Afrique." }
  ];
  const slides = $$(".hero__slide");
  const dotsWrap = $("#heroDots");
  const heroTitle = $("#heroTitle");
  const heroText = $("#heroText");
  let current = 0, timer;

  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", `Diapositive ${i + 1}`);
    b.addEventListener("click", () => { goTo(i); restart(); });
    dotsWrap.appendChild(b);
  });
  const dots = $$("button", dotsWrap);

  function goTo(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === current));
    dots.forEach((d, k) => d.classList.toggle("is-active", k === current));
    heroTitle.innerHTML = SLIDES[current].title;
    heroText.textContent = SLIDES[current].text;
    [heroTitle, heroText].forEach(el => { el.classList.remove("hero__fade"); void el.offsetWidth; el.classList.add("hero__fade"); });
  }
  const restart = () => { clearInterval(timer); timer = setInterval(() => goTo(current + 1), 6000); };
  $("#prevSlide").addEventListener("click", () => { goTo(current - 1); restart(); });
  $("#nextSlide").addEventListener("click", () => { goTo(current + 1); restart(); });
  dots[0].classList.add("is-active");
  restart();

  /* ---------- Modale filière ---------- */
  const modal = $("#modal");
  let lastFocus;
  function openModal(id) {
    const f = FILIERES[id];
    if (!f) return;
    lastFocus = document.activeElement;
    modal.style.setProperty("--mc", f.color);
    $("#modalIcon").className = f.icon;
    $("#modalTitle").textContent = f.titre;
    $("#modalDesc").textContent = f.desc;
    $("#modalSkills").innerHTML = f.skills.map(s => `<li>${s}</li>`).join("");
    $("#modalJobs").innerHTML = f.jobs.map(s => `<li>${s}</li>`).join("");
    $("#modalDuree").textContent = f.duree;
    $("#modalDiplome").textContent = f.diplome;
    $("#modalCta").dataset.filiere = id;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-open]").forEach(b => b.addEventListener("click", () => openModal(b.dataset.open)));
  $$("[data-close]", modal).forEach(el => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

  /* Pré-sélection de la filière dans le formulaire */
  const selectFiliere = $("#filiere");
  $("#modalCta").addEventListener("click", e => { selectFiliere.value = e.currentTarget.dataset.filiere; });
  $$(".dropdown [data-filiere]").forEach(a => a.addEventListener("click", () => {
    const card = $(`.card[data-id="${a.dataset.filiere}"]`);
    if (card) setTimeout(() => { card.classList.remove("is-highlight"); void card.offsetWidth; card.classList.add("is-highlight"); }, 400);
  }));

  /* ---------- Formulaire d'inscription ---------- */
  const form = $("#signupForm");
  const success = $("#formSuccess");
  const rules = {
    nom: v => v.trim().length >= 2 || "Veuillez indiquer votre nom.",
    prenom: v => v.trim().length >= 2 || "Veuillez indiquer votre prénom.",
    tel: v => /^\+?[\d\s.-]{8,}$/.test(v.trim()) || "Numéro de téléphone invalide.",
    email: v => !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || "Adresse e-mail invalide.",
    filiere: v => !!v || "Veuillez choisir une filière.",
    niveau: v => !!v || "Veuillez choisir votre niveau."
  };
  function validateField(name) {
    const input = form.elements[name];
    const res = rules[name](input.value);
    const field = input.closest(".field");
    field.classList.toggle("is-invalid", res !== true);
    $("small", field).textContent = res === true ? "" : res;
    return res === true;
  }
  Object.keys(rules).forEach(n => {
    form.elements[n].addEventListener("blur", () => validateField(n));
    form.elements[n].addEventListener("input", () => {
      if (form.elements[n].closest(".field").classList.contains("is-invalid")) validateField(n);
    });
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = Object.keys(rules).map(validateField).every(Boolean);
    const consent = $("#consent").checked;
    $("#consentErr").textContent = consent ? "" : "Veuillez cocher cette case pour continuer.";
    if (!ok || !consent) {
      const first = $(".is-invalid input, .is-invalid select", form);
      if (first) first.focus();
      return;
    }
    const prenom = form.elements.prenom.value.trim();
    const fil = FILIERES[form.elements.filiere.value].titre;
    $("span", success).textContent = `Merci ${prenom} ! Votre pré-inscription en « ${fil} » a bien été enregistrée. Nous vous recontactons très vite.`;
    success.hidden = false;
    form.reset();
  });

  /* ---------- Compteurs ---------- */
  const counters = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || "";
      const start = performance.now(), dur = 1600;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counters.unobserve(el);
    });
  }, { threshold: .5 });
  $$("[data-count]").forEach(el => counters.observe(el));

  /* ---------- Apparition au défilement ---------- */
  const revealEls = $$(".section__head, .card, .about, .news, .stat, .signup__info, .form, .faq__item, .contact-card");
  revealEls.forEach(el => el.classList.add("reveal"));
  const revealer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add("is-visible");
      revealer.unobserve(el);
      // une fois affiché, on rend la main aux transitions propres à l'élément (survol…)
      setTimeout(() => { el.classList.remove("reveal", "is-visible"); el.style.transitionDelay = ""; }, 1100);
    });
  }, { threshold: .12 });
  revealEls.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 80 + "ms"; revealer.observe(el); });

  $("#year").textContent = new Date().getFullYear();
})();
