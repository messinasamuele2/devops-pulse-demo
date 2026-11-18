import express from "express";
import { pathToFileURL } from "node:url";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  app.get("/api/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "devops-demo-api",
      environment: process.env.APP_ENVIRONMENT || "development"
    });
  });

  app.get("/api/error", (_request, _response, next) => {
    next(new Error("Errore simulato dall'API"));
  });

  app.use((error, _request, response, _next) => {
    console.error(error.message);
    response.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3000);
  createApp().listen(port, "0.0.0.0", () => {
    console.log(`API listening on port ${port}`);
  });
}
