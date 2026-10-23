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
