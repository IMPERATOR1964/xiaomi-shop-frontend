import { createContext, useContext, useState } from 'react';

export const CITIES = [
  { id: 'msk', label: 'Москва',          short: 'МСК' },
  { id: 'spb', label: 'Санкт-Петербург', short: 'СПб' },
];

const LocationContext = createContext();

export function LocationProvider({ children }) {
  const [cityId, setCityId] = useState(() => localStorage.getItem('voltix-city') || 'msk');

  const city = CITIES.find(c => c.id === cityId) || CITIES[0];

  const changeCity = (id) => {
    setCityId(id);
    localStorage.setItem('voltix-city', id);
  };

  return (
    <LocationContext.Provider value={{ city, cityId, changeCity, cities: CITIES }}>
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
