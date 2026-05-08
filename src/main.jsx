import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CompareProvider } from './context/CompareContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { LocationProvider } from './context/LocationContext';
import { HistoryProvider } from './context/HistoryContext';
import { ToastProvider } from './context/ToastContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <LocationProvider>
            <AuthProvider>
              <HistoryProvider>
                <FavoritesProvider>
                  <CompareProvider>
                    <ReviewsProvider>
                      <CartProvider>
                        <App />
                      </CartProvider>
                    </ReviewsProvider>
                  </CompareProvider>
                </FavoritesProvider>
              </HistoryProvider>
            </AuthProvider>
          </LocationProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
