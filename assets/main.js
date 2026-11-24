/* No dependencies, network requests, analytics, or form submissions. */
(() => {
  "use strict";

  document.querySelector("#year").textContent = new Date().getFullYear();

  const email = "admin@signumloop.com";
  const copyButton = document.querySelector(".copy-email");
  const copyStatus = document.querySelector(".copy-status");
  let statusTimeout;

  if (navigator.clipboard?.writeText && window.isSecureContext) {
    copyButton.hidden = false;
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(email);
        copyStatus.textContent = "Email address copied.";
      } catch {
        copyStatus.textContent = "Please select and copy the email above.";
      }
      window.clearTimeout(statusTimeout);
      statusTimeout = window.setTimeout(() => { copyStatus.textContent = ""; }, 5000);
    });
  }

  const scenarios = {
    automotive: { label: "Braking & cornering", frequency: 1.4, pulse: .75 },
    robotics: { label: "Navigation & orientation", frequency: 2.8, pulse: .24 },
    aerospace: { label: "Attitude & flight", frequency: .85, pulse: .46 },
  };
  const canvas = document.querySelector("#signal-canvas");
  const context = canvas.getContext("2d");
  const figure = document.querySelector(".signal-figure");
  const toggle = document.querySelector(".animation-toggle");
  document.querySelector(".signal-preview").hidden = false;
  document.querySelector(".scenario-buttons").hidden = false;
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  let scenario = scenarios.automotive;
  let paused = motionPreference.matches;
  let inView = true;
  let width = 0;
  let height = 72;
  let frame = 0;
  let lastTime = 0;
  let phase = 0;

  function draw() {
    if (!context || !width) return;
    context.clearRect(0, 0, width, height);
    context.lineWidth = 1;
    context.strokeStyle = "#2a3930";
    context.beginPath();
    for (let x = 0; x <= width; x += width / 12) {
      context.moveTo(x, 5);
      context.lineTo(x, height - 5);
    }
    for (let y = 12; y < height; y += 24) {
      context.moveTo(0, y);
      context.lineTo(width, y);
    }
    context.stroke();

    const points = [];
    for (let x = 0; x <= width; x += 2) {
      const t = (x / width) * Math.PI * 6 + phase;
      const pulse = Math.pow(Math.max(0, Math.sin(t * .62)), 9) * scenario.pulse;
      const signal = Math.sin(t * scenario.frequency) * .33 + Math.sin(t * .42) * .16 + pulse;
      points.push([x, height / 2 - signal * 22]);
    }
    const fill = context.createLinearGradient(0, 8, 0, height);
    fill.addColorStop(0, "#b6ed9a25");
    fill.addColorStop(1, "#b6ed9a00");
    context.beginPath();
    context.moveTo(0, height);
    for (const [x, y] of points) context.lineTo(x, y);
    context.lineTo(width, height);
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    context.beginPath();
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.lineWidth = 1.6;
    context.strokeStyle = "#b6ed9a";
    context.stroke();
  }

  function tick(now) {
    if (lastTime) phase += Math.min(now - lastTime, 40) * .0005;
    lastTime = now;
    draw();
    frame = window.requestAnimationFrame(tick);
  }

  function syncAnimation() {
    window.cancelAnimationFrame(frame);
    lastTime = 0;
    figure.classList.toggle("is-paused", paused || document.hidden || !inView);
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", paused ? "Play signal animation" : "Pause signal animation");
    if (!paused && !document.hidden && inView && context) frame = window.requestAnimationFrame(tick);
    else draw();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context?.setTransform(scale, 0, 0, scale, 0, 0);
    draw();
  }

  document.querySelectorAll("[data-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      scenario = scenarios[button.dataset.scenario];
      document.querySelector("#scenario-name").textContent = scenario.label;
      document.querySelectorAll("[data-scenario]").forEach((item) => {
        item.setAttribute("aria-pressed", String(item === button));
      });
      draw();
    });
  });

  toggle.addEventListener("click", () => { paused = !paused; syncAnimation(); });
  document.addEventListener("visibilitychange", syncAnimation);
  motionPreference.addEventListener("change", (event) => { paused = event.matches; syncAnimation(); });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncAnimation(); }).observe(figure);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);

  resize();
  syncAnimation();
})();
