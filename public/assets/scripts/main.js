document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initRevealAnimations();
  initTranscriptToggles();
  initForms();
});

function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navActions = document.querySelector(".nav-actions");
  const links = document.querySelectorAll(".nav-link, .nav-actions a");

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.classList.toggle("open");
    navActions?.classList.toggle("open", Boolean(isOpen));
    navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  links.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("open");
      navActions?.classList.remove("open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function initRevealAnimations() {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));
}

function initTranscriptToggles() {
  document.querySelectorAll("[data-toggle-transcript]").forEach((button) => {
    button.addEventListener("click", () => {
      const transcript = document.getElementById(button.dataset.toggleTranscript);
      if (!transcript) return;
      const isHidden = transcript.hasAttribute("hidden");
      transcript.toggleAttribute("hidden", !isHidden);
      button.setAttribute("aria-expanded", String(isHidden));
      button.textContent = isHidden
        ? button.textContent.replace("Show", "Hide")
        : button.textContent.replace("Hide", "Show");
    });
  });
}

function initForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Signed in successfully. Returning to the landing page...");
    setTimeout(() => { window.location.href = "index.html#home"; }, 900);
  });

  registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    showToast("Account created. Returning to the landing page...");
    setTimeout(() => { window.location.href = "index.html#home"; }, 900);
  });
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3200);
}
