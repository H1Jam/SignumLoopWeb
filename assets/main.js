/* No dependencies, network requests, analytics, or form submissions. */
(() => {
  "use strict";

  document.querySelector("#year").textContent = new Date().getFullYear();

  const diagram = document.querySelector(".signal-figure");
  const motionButton = diagram.querySelector(".motion-toggle");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const drawOrientation = createOrientationRenderer(diagram.querySelector(".motion-axes"));
  const cases = document.querySelectorAll(".use-case");
  const caseButton = document.querySelector(".case-playback");
  const canObserve = "IntersectionObserver" in window;
  const visibleCases = new Set(canObserve ? [] : cases);
  const frameInterval = 1000 / 30;
  let diagramVisible = !canObserve;
  let frameRequest = null;
  let lastTime = null;
  let elapsed = 0;
  let frameBudget = 0;

  function animateOrientation(now) {
    const delta = lastTime === null ? 0 : Math.min(now - lastTime, 100);
    lastTime = now;
    elapsed += delta;
    frameBudget += delta;
    if (frameBudget >= frameInterval) {
      drawOrientation(elapsed / 1000);
      frameBudget %= frameInterval;
    }
    frameRequest = requestAnimationFrame(animateOrientation);
  }

  function updatePlayback() {
    const motionAllowed = !document.hidden && !reduceMotion.matches;
    caseButton.hidden = reduceMotion.matches;
    const casesEnabled = motionAllowed && !caseButton.hasAttribute("data-paused");
    cases.forEach(card => card.classList.toggle("is-playing", casesEnabled && visibleCases.has(card)));
    const playing = diagramVisible && motionAllowed && !diagram.hasAttribute("data-paused");
    diagram.classList.toggle("is-playing", playing);
    if (playing && frameRequest === null) {
      frameRequest = requestAnimationFrame(animateOrientation);
    } else if (!playing && frameRequest !== null) {
      cancelAnimationFrame(frameRequest);
      frameRequest = null;
      lastTime = null;
    }
  }

  motionButton.addEventListener("click", () => {
    const paused = diagram.toggleAttribute("data-paused");
    const label = paused ? "Resume diagram animation" : "Pause diagram animation";
    motionButton.setAttribute("aria-label", label);
    motionButton.title = label;
    updatePlayback();
  });

  caseButton.addEventListener("click", () => {
    const paused = caseButton.toggleAttribute("data-paused");
    caseButton.querySelector("span").textContent = paused ? "Resume animations" : "Pause animations";
    updatePlayback();
  });

  if (canObserve) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === diagram) diagramVisible = entry.isIntersecting;
        else {
          const card = entry.target.closest(".use-case");
          if (entry.isIntersecting) visibleCases.add(card);
          else visibleCases.delete(card);
        }
      }
      updatePlayback();
    });
    observer.observe(diagram);
    cases.forEach(card => observer.observe(card.querySelector(".case-art")));
  }
  document.addEventListener("visibilitychange", updatePlayback);
  reduceMotion.addEventListener("change", updatePlayback);
  diagram.classList.add("motion-ready");
  document.querySelector(".use-cases").classList.add("motion-ready");
  motionButton.hidden = false;
  drawOrientation(0);
  updatePlayback();

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

  function createOrientationRenderer(svg) {
    const arrows = Array.from(svg.querySelectorAll(".axis-vectors > g"), group => ({
      shaft: group.querySelector("path"),
      label: group.querySelector("text")
    }));
    const faces = svg.querySelectorAll(".axis-cube path");
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    // Local +X, +Y, +Z faces, followed by their opposites.
    const faceCorners = [[1, 2, 6, 5], [2, 3, 7, 6], [4, 5, 6, 7],
                         [0, 3, 7, 4], [0, 1, 5, 4], [0, 1, 2, 3]];
    const halfEdge = 6.1;
    const cameraDistance = 165;
    const degrees = Math.PI / 180;
    const cameraCos = Math.cos(30 * degrees);
    const cameraSin = Math.sin(30 * degrees);
    const point = (x, y) => x.toFixed(2) + " " + y.toFixed(2);

    function project([right, up, depth], length) {
      const scale = length * cameraDistance / (cameraDistance - length * depth);
      return [52 + right * scale, 40 - up * scale];
    }

    return function draw(seconds) {
      const phase = seconds * 2 * Math.PI / 14;
      const fundamental = Math.sin(phase);
      const harmonic = Math.sin(2 * phase);
      const yaw = (-135 + 28 * fundamental) * degrees;
      const pitch = (14 * harmonic + 5 * fundamental) * degrees;
      const roll = (18 * fundamental - 8 * harmonic) * degrees;
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      const cp = Math.cos(pitch), sp = Math.sin(pitch);
      const cr = Math.cos(roll), sr = Math.sin(roll);

      // Body roll, pitch and yaw, followed by the fixed camera elevation.
      function toCamera(x, y, z) {
        const rolledY = cr * y - sr * z;
        const rolledZ = sr * y + cr * z;
        const pitchedX = cp * x + sp * rolledZ;
        const worldZ = cp * rolledZ - sp * x;
        const worldY = sy * pitchedX + cy * rolledY;
        return [cy * pitchedX - sy * rolledY,
                cameraSin * worldY + cameraCos * worldZ,
                cameraSin * worldZ - cameraCos * worldY];
      }

      const axes = [toCamera(1, 0, 0), toCamera(0, 1, 0), toCamera(0, 0, 1)];
      axes.forEach((axis, i) => {
        const [x, y] = project(axis, 28);
        const length = Math.hypot(x - 52, y - 40);
        const dx = (x - 52) / length, dy = (y - 40) / length;
        const baseX = x - 4 * dx, baseY = y - 4 * dy;
        const left = point(baseX - 2 * dy, baseY + 2 * dx);
        const right = point(baseX + 2 * dy, baseY - 2 * dx);
        const tip = point(x, y);
        arrows[i].shaft.setAttribute("d", `M52 40L${tip}M${left}L${tip} ${right}`);
        arrows[i].label.setAttribute("transform", `translate(${point(x + 7 * dx, y + 7 * dy)})`);
      });

      const vertices = corners.map(corner => point(...project(toCamera(...corner), halfEdge)));
      faceCorners.forEach((indices, i) => {
        const [nx, ny, nz] = axes[i % 3];
        const sign = i < 3 ? 1 : -1;
        // A convex face is visible when its normal points toward the camera.
        if (sign * nz * cameraDistance <= halfEdge) {
          faces[i].setAttribute("d", "");
          return;
        }
        const light = Math.max(0, sign * (-.35 * nx + .78 * ny + .52 * nz));
        faces[i].setAttribute("fill", `hsl(155 16% ${27 + 25 * light}%)`);
        faces[i].setAttribute("d", "M" + indices.map(index => vertices[index]).join(" ") + "Z");
      });
    };
  }
})();
