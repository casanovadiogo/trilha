const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

const closeMenu = (returnFocus = false) => {
  if (!menuToggle || !mainNav) return;
  const wasOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  mainNav.classList.remove("is-open");
  if (returnFocus && wasOpen) menuToggle.focus();
};

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu(true);
  });

  document.addEventListener("click", (event) => {
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    if (mainNav.contains(event.target) || menuToggle.contains(event.target)) return;
    closeMenu(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu(false);
  });
}

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const form = document.querySelector(".contact-form");
const status = document.querySelector(".form-status");

if (form && status) {
  const submitButton = form.querySelector(".form-submit");
  const contactEmail = form.dataset.contactEmail || "";
  const endpoint = form.dataset.endpoint || "";

  const readValue = (data, name) => String(data.get(name) || "").trim();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = new FormData(form);
    const employeesSelect = form.querySelector("#funcionarios");
    const employees = employeesSelect && employeesSelect.selectedIndex >= 0
      ? employeesSelect.options[employeesSelect.selectedIndex].text
      : "";

    if (!endpoint) {
      const subject = `Novo contato pelo site — ${readValue(data, "empresa") || readValue(data, "nome")}`;
      const body = [
        `Nome: ${readValue(data, "nome")}`,
        `Empresa: ${readValue(data, "empresa")}`,
        `Cargo: ${readValue(data, "cargo")}`,
        `E-mail: ${readValue(data, "email")}`,
        `Telefone: ${readValue(data, "telefone") || "Não informado"}`,
        `Número de funcionários: ${employees}`,
        "",
        "Processo que quer documentar primeiro:",
        readValue(data, "processo")
      ].join("\n");

      window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.hidden = false;
      status.classList.remove("is-error");
      status.textContent = `Abrimos seu aplicativo de e-mail com os dados preenchidos. Se ele não abrir, envie a mensagem para ${contactEmail}.`;
      return;
    }

    status.hidden = false;
    status.classList.remove("is-error");
    status.textContent = "Enviando seus dados…";
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) throw new Error("Não foi possível enviar.");

      form.reset();
      status.textContent = "Recebemos seus dados. Vamos entrar em contato para entender seu contexto.";
    } catch (error) {
      status.classList.add("is-error");
      status.textContent = `Não foi possível enviar agora. Tente novamente ou escreva para ${contactEmail}.`;
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

const videoModal = document.getElementById("video-modal");
const modalVideo = videoModal ? videoModal.querySelector(".video-modal-player") : null;
const videoTriggers = document.querySelectorAll("[data-video-open]");
const videoClosers = videoModal ? videoModal.querySelectorAll("[data-video-close]") : [];
const pageChrome = document.querySelectorAll(".site-header, main, .site-footer");
const inlineVideo = document.querySelector(".how-video-player");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastVideoTrigger = null;
let inlineVideoInView = false;

const openVideoModal = (event) => {
  if (!videoModal || !modalVideo) return;
  event.preventDefault();
  lastVideoTrigger = event.currentTarget;
  videoModal.hidden = false;
  document.body.classList.add("video-modal-open");
  pageChrome.forEach((element) => {
    element.inert = true;
  });
  if (inlineVideo) inlineVideo.pause();
  modalVideo.currentTime = 0;
  const playPromise = modalVideo.play();
  if (playPromise) playPromise.catch(() => {});
  const closeButton = videoModal.querySelector(".video-modal-close");
  if (closeButton) closeButton.focus();
};

const closeVideoModal = () => {
  if (!videoModal || videoModal.hidden) return;
  if (modalVideo) modalVideo.pause();
  videoModal.hidden = true;
  document.body.classList.remove("video-modal-open");
  pageChrome.forEach((element) => {
    element.inert = false;
  });
  if (lastVideoTrigger && typeof lastVideoTrigger.focus === "function") {
    lastVideoTrigger.focus();
  }
  if (inlineVideo && inlineVideoInView && !reduceMotion) {
    const playPromise = inlineVideo.play();
    if (playPromise) playPromise.catch(() => {});
  }
};

if (videoModal && modalVideo) {
  videoTriggers.forEach((trigger) => {
    trigger.addEventListener("click", openVideoModal);
  });
  videoClosers.forEach((closer) => {
    closer.addEventListener("click", closeVideoModal);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !videoModal.hidden) closeVideoModal();
  });
}

if (inlineVideo && "IntersectionObserver" in window) {
  inlineVideo.muted = true;
  const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      inlineVideoInView = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      if (videoModal && !videoModal.hidden) {
        inlineVideo.pause();
        return;
      }
      if (inlineVideoInView && !reduceMotion) {
        const playPromise = inlineVideo.play();
        if (playPromise) playPromise.catch(() => {});
      } else {
        inlineVideo.pause();
      }
    });
  }, { threshold: [0, 0.5, 0.75] });
  videoObserver.observe(inlineVideo);
}
