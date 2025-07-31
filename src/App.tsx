import { Routes, Route } from 'react-router-dom';
import { FormStep } from './components/FormStep';
import { LocaleSwitcher } from './components/LocaleSwitcher';
import Checkout from './components/Checkout';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-yellow-300 w-full py-3 px-4">
        <div className="max-w-screen-lg mx-auto flex justify-center md:justify-start items-center">
          <img
            src="https://static.vscdn.net/images/careers/demo/mercadolibre/1641314597::New+PCS+logp"
            alt="Mercado Libre"
            className="h-8"
          />
        </div>
      </header>
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<FormStep />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
      
      {/* Componentes de desarrollo temporalmente deshabilitados */}
      <LocaleSwitcher />
    </div>
  );
}

export default App;
