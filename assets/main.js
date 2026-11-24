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
})();
