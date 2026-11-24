/* No dependencies, network requests, analytics, or form submissions. */
(() => {
  "use strict";

  document.querySelector("#year").textContent = new Date().getFullYear();

  const diagram = document.querySelector(".signal-figure");
  const motionButton = diagram.querySelector(".motion-toggle");
  let diagramVisible = true;

  function updatePlayback() {
    const playing = diagramVisible && !document.hidden && !diagram.hasAttribute("data-paused");
    diagram.classList.toggle("is-playing", playing);
  }

  motionButton.addEventListener("click", () => {
    const paused = diagram.toggleAttribute("data-paused");
    const label = paused ? "Resume diagram animation" : "Pause diagram animation";
    motionButton.setAttribute("aria-label", label);
    motionButton.title = label;
    updatePlayback();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      diagramVisible = entry.isIntersecting;
      updatePlayback();
    }).observe(diagram);
  }
  document.addEventListener("visibilitychange", updatePlayback);
  diagram.classList.add("motion-ready");
  motionButton.hidden = false;
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
})();
