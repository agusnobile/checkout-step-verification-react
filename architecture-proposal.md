# Propuesta de Arquitectura – Paso de Verificación de Datos (Abuse-Prevention)

> Versión 1.0 – Julio 2025  
> _Autores_: Equipo Front-End Legales / Full-Stack Checkout

---

## 1. Resumen Ejecutivo

• **Objetivo de negocio**: reducir errores de datos ingresados en checkout en **≥ 80 %** y garantizar que el paso adicional no incremente el _drop-off_ (< 3 %).  
• **Solución propuesta**: un paso de verificación ligero, renderizado **server-side** y pre-poblado con la información existente del usuario.  
• **Impacto estimado**: mejora en la calidad de datos, menor re-trabajo post-venta y experiencia consistente cross-device (JS habilitado o no).

---

## 2. Stack tecnologico y restricciones.

| Factor        | Restricción                                           |
| ------------- | ----------------------------------------------------- |
| Stack         | Node.js 22 + Express 4 + React 18 + Vite + TypeScript |
| APIs          | `meli-users`, `meli-countries` (ownership)            |
| Accesibilidad | Debe funcionar sin JavaScript (SSR puro)              |
| Multilenguaje | `pt-BR`, `es-AR`, `es-MX` según dominio               |

---

## 3. Arquitectura propuesta

### 3.1 Visión general

```
checkout-verification (monorepo)
├── server/        # Express + SSR
│   ├── routes/    # SSR + REST endpoints
│   ├── services/  # Adapters a APIs externas
│   └── middleware/# i18n, seguridad, caché
├── client/        # React + Vite
│   ├── components/# UI declarativa
│   ├── hooks/     # data & state
│   └── i18n/      # JSON translations
└── shared/        # tipos y validaciones comunes
```

🔑 _Single-module monolith_: un solo proceso Node sirve SSR y assets estáticos. Simplifica CI/CD y evita configuración de proxy interno.

### 3.2 Flujo high-level

1. **Request**: `/verify-data?token=abc&referrer=/checkout`
2. **Middleware**: detecta `locale` por dominio, valida query y aplica rate-limit.
3. **SSR streaming**: se envía HTML crítico en < 100 ms.
4. **Paralelo**: `meli-countries` (caché 1 h) + `meli-users` (no caché).
5. **Hydratation**: React recibe `initialProps` y levanta el formulario.
6. **Interacción**: validación en tiempo real, captcha lazy cuando el usuario toca el primer campo.
7. **Submit**: POST `/api/verify-submit` → validación server-side → redirect al `referrer`.

### 3.3 Enrutamiento (React Router)

**Frontend (CSR):**

- `/` → `FormStep` (formulario principal)
- `/checkout` → `Checkout` (página de confirmación)

**Backend (SSR):**

- `/verify-data-ssr` → Formulario SSR
- `/checkout-ssr` → Confirmación SSR

**Justificación**: Separación clara entre entrada de datos y confirmación, manteniendo consistencia entre CSR y SSR.

### 3.4 Testing de Internacionalización

**Componente LocaleSwitcher:**

- Solo visible en desarrollo (`import.meta.env.PROD`)
- Permite cambiar entre países: Argentina, Brasil, México
- Genera URLs con parámetros: `?country=AR&lang=es-AR`
- Facilita testing de traducciones y validaciones por región

**Justificación**: Herramienta de desarrollo para validar soporte multi-idioma sin necesidad de cambiar configuración del navegador.

---

## 4. Decisiones clave y justificación

| #   | Decisión                             | Justificación                                                                                                                                           |
| --- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Monolito organizado**              | • Un solo equipo mantiene todo el stack.<br>• Deploy y rollback atómicos.<br>• Latencia intra-service ≈ 0 ms.                                           |
| 2   | **SSR con streaming**                | • _First Contentful Paint_ < 500 ms incluso en 3G.<br>• Soporte completo _no-script_.                                                                   |
| 3   | **Lazy captcha**                     | • El script de reCAPTCHA pesa 250 KB: sólo se carga si el usuario realmente interactúa.                                                                 |
| 4   | **Reglas de validación compartidas** | • Se definieron en `shared/validationRules.ts`, garantizando consistencia FE/BE.                                                                        |
| 5   | **i18n por dominio + JSON**          | • Concatena menor overhead al bundle; se carga sólo el idioma activo.                                                                                   |
| 6   | **Caché selectivo**                  | • Países (poco cambio) → memoria 1 h.<br>• Datos de usuario (sensibles) → sin caché.                                                                    |
| 7   | **Seguridad y anti-abuso**           | • Helmet, rate-limit, captcha v3/v2, validación doble.                                                                                                  |
| 8   | **React Router para navegación**     | • Separación clara entre formulario (`/`) y confirmación (`/checkout`).<br>• Consistencia entre CSR y SSR.<br>• UX mejorada con navegación declarativa. |

---

## 5. Alternativas consideradas

1. **Micro-frontend separado** – descartado por sobrecarga de infra y latencia entre dominios.
2. **SPA pura** – descartado: sin JS rompería el flujo de pago y penaliza FCP.
3. **GraphQL gateway** – innecesario; sólo dos APIs con latencia baja.

---

## 6. Requisitos no funcionales ⇆ solución

| Requisito                | Solución                                                     |
| ------------------------ | ------------------------------------------------------------ |
| Performance < 100 ms FCP | SSR streaming + CSS crítico inline                           |
| TTI < 1 s                | Bundle inicial < 50 KB, captcha lazy                         |
| Accesibilidad            | SSR puro, labels ARIA, fallback no-JS                        |
| Seguridad                | Validación doble, captcha, headers Helmet                    |
| Observabilidad           | Logs JSON (pino), métricas Prometheus, tracing OpenTelemetry |

---

## 8. Próximos pasos solicitados

• Aprobación de la arquitectura por parte de _Leads_ y _Security_.  
• Confirmar _SLAs_ de `meli-users` y `meli-countries`.  
• Agendar _kick-off_.

---
