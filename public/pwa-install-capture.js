window.__pwaInstallPromptEvent = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.__pwaInstallPromptEvent = e;
});
