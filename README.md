# 🛡️ Abuse-Prevention – Paso de Verificación de Datos

> Frontend Challenge - POC.

---

## 🚀 TL;DR (lo rápido)

```bash
# 1. Instalar deps
npm install

# 2. Levantar TODO (frontend + backend) en modo dev
npm run dev:full
```

Abre:
* SPA (JS habilitado): <http://localhost:5173/?referrer=/checkout&token=abc123>
* SSR (JS deshabilitado): el propio navegador te redirigirá a <http://localhost:3000/verify-data-ssr?referrer=/checkout&token=abc123>

---

## 📂 Estructura mínima

```text
poc-abuse-prevention-challenge/
├─ client/  (src/)      # React + Vite
├─ server/              # Express + SSR + APIs mock
└─ shared/              # Tipos & reglas comunes
```

![flow](https://raw.githubusercontent.com/mermaid-js/mermaid-live-editor/master/public/img/docs/flow-h.png)

---

## 🖥️ Scripts principales

| Comando | Hace… |
|---------|-------|
| `npm run dev` | Frontend (Vite) en <http://localhost:5173> |
| `npm run dev:server` | Backend + SSR en <http://localhost:3000> |
| `npm run dev:full` | Ambos procesos en paralelo |
| `npm run build` | Compila FE + BE (dist/) |
| `npm run preview` | Sirve el build de frontend |
| `npm run lint` | Linter ESLint |

---

## 🤖 Probar sin y con JavaScript

1. **Modo SPA (JS on)**  
   Visita `http://localhost:5173/?referrer=/checkout&token=abc123` y utiliza el formulario interactivo.

2. **Modo SSR (JS off)**  
   – Desactiva JavaScript en DevTools → Settings → _Disable JavaScript_.  
   – Refresca la misma URL.  
   – Verás una redirección automática al SSR (`/verify-data-ssr`) servida por Express/EJS.  
   – El formulario funciona y envía datos con POST clásico.

> El bloque `<noscript>` en `index.html` maneja la redirección.

---

## 🔌 Endpoints mock

| Método | URL | Descripción |
|--------|-----|-------------|
| GET | `/api/meli-countries` | Lista de países (mock JSON) |
| GET | `/api/meli-users?token=abc` | Datos del usuario por token |

Todos los mocks usan archivos en `server/data/` y tipados en `server/types/`.

---

## 🧩 Stack

* **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Google reCAPTCHA v2 (lazy)
* **Backend**: Node 22, Express 4, SSR streaming con React 18, EJS (fallback no-JS)
* **Dev Tools**: Nodemon, ts-node, ESLint, Concurrently

---

## 📝 Notas útiles

* Reglas de validación compartidas en `src/config/validationRules.ts` (re-usadas por BE).  
* Archivo `architecture-proposal.md` detalla decisiones clave.  
