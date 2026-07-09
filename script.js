const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      body.classList.remove("nav-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

document.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

document.querySelectorAll("[data-preview-image]").forEach((image) => {
  const media = image.closest(".project-media");

  const markLoaded = () => {
    image.classList.add("is-loaded");
    media?.classList.add("has-preview");
  };

  const markMissing = () => {
    image.hidden = true;
    media?.classList.remove("has-preview");
  };

  image.addEventListener("load", markLoaded);
  image.addEventListener("error", markMissing);

  if (image.complete) {
    if (image.naturalWidth > 0) {
      markLoaded();
    } else {
      markMissing();
    }
  }
});

const updateHeader = () => {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const canvas = document.querySelector("[data-hero-canvas]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canvas instanceof HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  const pointer = { x: 0.72, y: 0.35 };
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let points = [];

  const buildPoints = () => {
    const count = Math.max(32, Math.min(78, Math.floor(width / 18)));
    points = Array.from({ length: count }, (_, index) => {
      const column = index % 12;
      const row = Math.floor(index / 12);
      return {
        x: ((column + 0.45 + Math.random() * 0.28) / 12) * width,
        y: ((row + 0.45 + Math.random() * 0.36) / Math.ceil(count / 12)) * height,
        radius: 1.2 + Math.random() * 2.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.002 + Math.random() * 0.003,
      };
    });
  };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    buildPoints();
  };

  const draw = (time = 0) => {
    if (!context) return;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#0b0d12";
    context.fillRect(0, 0, width, height);

    const activeX = pointer.x * width;
    const activeY = pointer.y * height;

    points.forEach((point, index) => {
      const wave = prefersReducedMotion ? 0 : Math.sin(time * point.speed + point.phase) * 10;
      const x = point.x + wave;
      const y = point.y + Math.cos(time * point.speed + point.phase) * 8;

      for (let next = index + 1; next < points.length; next += 1) {
        const other = points[next];
        const ox = other.x + (prefersReducedMotion ? 0 : Math.sin(time * other.speed + other.phase) * 10);
        const oy = other.y + (prefersReducedMotion ? 0 : Math.cos(time * other.speed + other.phase) * 8);
        const distance = Math.hypot(x - ox, y - oy);

        if (distance < 132) {
          context.strokeStyle = `rgba(61, 219, 217, ${0.12 - distance / 1600})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(ox, oy);
          context.stroke();
        }
      }

      const pointerDistance = Math.hypot(x - activeX, y - activeY);
      const glow = Math.max(0, 1 - pointerDistance / 260);
      context.fillStyle = glow > 0.15 ? `rgba(244, 184, 96, ${0.25 + glow * 0.45})` : "rgba(244, 247, 251, 0.42)";
      context.beginPath();
      context.arc(x, y, point.radius + glow * 2.8, 0, Math.PI * 2);
      context.fill();
    });

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    }
  };

  const handlePointer = (event) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width;
    pointer.y = (event.clientY - rect.top) / rect.height;
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", handlePointer, { passive: true });
  resize();
  draw();

  window.addEventListener("beforeunload", () => {
    cancelAnimationFrame(animationFrame);
  });
}
