import React from "react";

interface Locale {
  country: string;
  lang: string;
  region: string;
}

interface FeedbackTranslations {
  title: string;
  referrer: string;
  captcha: string;
  continue: string;
}

export interface SSRCheckoutProps {
  referrer: string;
  token: string;
  locale?: Locale;
  translations?: {
    feedback?: FeedbackTranslations;
  };
}

export function SSRCheckout({ referrer, token, locale, translations }: SSRCheckoutProps) {
  const lang = locale?.lang.split("-")[0] || "es";
  const t = translations?.feedback || {
    title: "¡Datos confirmados!",
    referrer: "Referrer:",
    captcha: "Captcha:",
    continue: "Continuar al Checkout",
  };

  return (
    <html lang={lang}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t.title} - Mercado Libre</title>
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body {
              margin: 0;
              background-color: #f9fafb;
              font-family: sans-serif;
              display: flex;
              flex-direction: column;
              min-height: 100vh;
            }

            header {
              background-color: #fde047;
              padding: 0.75rem 1rem;
            }

            header img {
              height: 32px;
              display: block;
              margin: 0 auto;
            }

            @media (min-width: 768px) {
              header div {
                display: flex;
                justify-content: flex-start;
                max-width: 1024px;
                margin: 0 auto;
              }

              header img {
                margin-left: 0;
              }
            }

            main {
              flex: 1;
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 3rem 1rem;
            }

            .checkout-container {
              width: 100%;
              max-width: 440px;
              background-color: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 0.75rem;
              padding: 1.5rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              text-align: center;
            }

            .success-icon {
              font-size: 3rem;
              margin-bottom: 1rem;
            }

            h3 {
              font-size: 1.5rem;
              font-weight: bold;
              color: #166534;
              margin-bottom: 1.5rem;
              margin-top: 0;
            }

            .info-section {
              width: 100%;
              text-align: left;
              font-size: 0.875rem;
              color: #374151;
              margin-bottom: 1.5rem;
            }

            .info-section p {
              margin: 0.25rem 0;
            }

            .info-section strong {
              font-weight: 600;
            }

            .break-all {
              word-break: break-all;
            }

            .continue-button {
              width: 100%;
              background-color: #166534;
              color: white;
              padding: 0.75rem;
              border-radius: 0.375rem;
              border: none;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s ease;
              text-decoration: none;
              display: inline-block;
              box-sizing: border-box;
            }

            .continue-button:hover {
              background-color: #15803d;
            }

            .token-preview {
              color: #6b7280;
              font-family: monospace;
              font-size: 0.75rem;
            }
          `,
          }}
        />
      </head>
      <body>
        <header>
          <div>
            <img
              src="https://static.vscdn.net/images/careers/demo/mercadolibre/1641314597::New+PCS+logp"
              alt="Mercado Libre"
            />
          </div>
        </header>

        <main>
          <div className="checkout-container">
            <div className="success-icon">✅</div>
            <h3>{t.title}</h3>
            <div className="info-section">
              <p>
                <strong>{t.referrer}</strong> <span className="break-all">{referrer}</span>
              </p>
              <p>
                <strong>{t.captcha}</strong>{" "}
                {token && (
                  <span className="token-preview" title={token}>
                    {token.slice(0, 20)}...
                  </span>
                )}
              </p>
            </div>
            <a href={`${referrer}?token=${encodeURIComponent(token)}`} className="continue-button">
              {t.continue}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
