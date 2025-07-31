import express, { Request, Response } from "express";
import cors from "cors";
import * as path from "path";
import * as fs from "fs";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import usersRouter from "./routes/users";
import countriesRouter from "./routes/countries";
import { SSRForm } from "./components/SSRForm";
import { SSRCheckout } from "./components/SSRCheckout";
import { detectLocaleMiddleware, getServerTranslations } from "./middleware/i18n";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para parsear form data

// Middleware de detección de locale
app.use(detectLocaleMiddleware);

app.use("/api/meli-users", usersRouter);
app.use("/api/meli-countries", countriesRouter);

// Configuración de archivos estáticos para el modo de desarrollo
app.use(express.static(path.join(__dirname, "../dist")));

app.get("/", (req: Request, res: Response) => {
  res.send("Servidor Express corriendo correctamente");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor Express en http://localhost:${PORT}`);
});

app.get("/verify-data-ssr", (req: Request, res: Response) => {
  const referrer = (req.query.referrer as string) || "/";
  const token = (req.query.token as string) || "";
  const locale = (req as any).locale;

  // Headers optimizados como sugiere el documento de arquitectura
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60"); // Cache corto para SSR
  res.setHeader("X-Content-Type-Options", "nosniff");

  try {
    const user = JSON.parse(fs.readFileSync(path.join(__dirname, "data/usersMock.json"), "utf-8"));
    const countries = JSON.parse(
      fs.readFileSync(path.join(__dirname, "data/countriesMock.json"), "utf-8")
    );
    const translations = getServerTranslations(locale);

    const reactElement = React.createElement(SSRForm, {
      user,
      countries,
      referrer,
      token,
      locale,
      translations,
    });

    const html = renderToStaticMarkup(reactElement);

    // HTML completo con meta tags optimizados
    const fullHtml = `<!DOCTYPE html>
<html lang="${locale.lang.split("-")[0]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${translations.subtitle}">
  <title>${translations.title} - Mercado Libre</title>
  <style>
    /* CSS crítico inline para First Contentful Paint < 500ms */
    body { margin: 0; font-family: system-ui, sans-serif; background: #f9fafb; }
    .loading { text-align: center; padding: 40px; color: #666; }
  </style>
</head>
<body>
  ${html}
  <script>
    // Preload datos de país para evitar flash de contenido
    window.__INITIAL_LOCALE__ = ${JSON.stringify(locale)};
  </script>
</body>
</html>`;

    res.send(fullHtml);
  } catch (error) {
    console.error("SSR Error:", error);

    // Fallback graceful
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verificación de Datos - Mercado Libre</title>
</head>
<body>
  <div class="loading">Cargando formulario...</div>
  <script>window.location.href = '/?${req.url.split("?")[1] || ""}';</script>
</body>
</html>`;

    res.status(500).send(fallbackHtml);
  }
});

app.post("/verify-data-ssr", (req: Request, res: Response) => {
  const { referrer, token } = req.body;
  console.log("referrer", referrer);
  console.log("token", token);

  // Redirigir al checkout SSR en lugar del cliente
  const checkoutUrl = `/checkout-ssr?referrer=${encodeURIComponent(
    referrer
  )}&token=${encodeURIComponent(token)}`;
  res.redirect(checkoutUrl);
});

// Ruta para el checkout SSR
app.get("/checkout-ssr", (req: Request, res: Response) => {
  const referrer = (req.query.referrer as string) || "/";
  const token = (req.query.token as string) || "";
  const locale = (req as any).locale;

  // Headers optimizados
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=60");
  res.setHeader("X-Content-Type-Options", "nosniff");

  try {
    const translations = getServerTranslations(locale);

    const reactElement = React.createElement(SSRCheckout, {
      referrer,
      token,
      locale,
      translations,
    });

    const html = renderToStaticMarkup(reactElement);

    // HTML completo con meta tags optimizados
    const fullHtml = `<!DOCTYPE html>
<html lang="${locale.lang.split("-")[0]}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Datos confirmados - Mercado Libre">
  <title>${translations.feedback?.title || "¡Datos confirmados!"} - Mercado Libre</title>
  <style>
    /* CSS crítico inline para First Contentful Paint < 500ms */
    body { margin: 0; font-family: system-ui, sans-serif; background: #f9fafb; }
    .loading { text-align: center; padding: 40px; color: #666; }
  </style>
</head>
<body>
  ${html}
  <script>
    // Preload datos para evitar flash de contenido
    window.__INITIAL_LOCALE__ = ${JSON.stringify(locale)};
  </script>
</body>
</html>`;

    res.send(fullHtml);
  } catch (error) {
    console.error("SSR Checkout Error:", error);

    // Fallback graceful
    const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Checkout - Mercado Libre</title>
</head>
<body>
  <div class="loading">Cargando checkout...</div>
  <script>window.location.href = '/?${req.url.split("?")[1] || ""}';</script>
</body>
</html>`;

    res.status(500).send(fallbackHtml);
  }
});
