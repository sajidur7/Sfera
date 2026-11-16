import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SferaProvider } from './sfera';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SferaProvider defaultAccent="blue">
      <App />
    </SferaProvider>
  </StrictMode>,
);
