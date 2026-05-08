// Локальная «адресная книга»: последний успешно использованный адрес доставки.
// Сохраняется при успешном checkout и подставляется в форму оформления.

const KEY = 'voltix-last-address';

export const lastAddressStore = {
  get() {
    try { return JSON.parse(localStorage.getItem(KEY)) || null; }
    catch { return null; }
  },

  set({ deliveryAddress, contactPhone, customerNotes }) {
    if (!deliveryAddress && !contactPhone) return;
    localStorage.setItem(KEY, JSON.stringify({
      deliveryAddress: deliveryAddress || '',
      contactPhone:    contactPhone    || '',
      customerNotes:   customerNotes   || '',
      savedAt:         new Date().toISOString(),
    }));
  },

  clear() {
    localStorage.removeItem(KEY);
  },
};
