const statusElement = document.querySelector("#status");
const detailsElement = document.querySelector("#details");
const sentryDsn = document.querySelector('meta[name="sentry-dsn"]')?.content;

if (window.Sentry && sentryDsn && !sentryDsn.startsWith("__")) {
  window.Sentry.init({ dsn: sentryDsn, environment: "production" });
}

async function checkHealth() {
  statusElement.className = "status";
  statusElement.textContent = "Controllo API...";

  if (window.location.hostname.endsWith("github.io")) {
    statusElement.className = "status ok";
    statusElement.textContent = "Frontend operativo";
    detailsElement.textContent =
      "GitHub Pages ospita il frontend; il backend locale usa docker compose.";
    return;
  }

  try {
    const response = await fetch("/api/health");
    if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
    const data = await response.json();
    statusElement.className = "status ok";
    statusElement.textContent = "API operativa";
    detailsElement.textContent = `Service: ${data.service} · Environment: ${data.environment}`;
  } catch (error) {
    statusElement.className = "status error";
    statusElement.textContent = "API non raggiungibile";
    detailsElement.textContent = error.message;
  }
}

document.querySelector("#health-button").addEventListener("click", checkHealth);
document.querySelector("#error-button").addEventListener("click", () => {
  throw new Error("Errore simulato dal pulsante DevOps Pulse");
});

checkHealth();
