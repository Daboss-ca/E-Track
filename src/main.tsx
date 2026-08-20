import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeProvider'; //[cite: 6]
import { AppWrapper } from './components/common/PageMeta';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppWrapper>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AppWrapper>
  </React.StrictMode>
);