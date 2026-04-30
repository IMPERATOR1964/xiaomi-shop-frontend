import { createContext, useContext, useState } from 'react';

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [reviews, setReviews] = useState(() => {
    try {
      const raw = localStorage.getItem('voltix-reviews');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  const persist = (next) => {
    setReviews(next);
    localStorage.setItem('voltix-reviews', JSON.stringify(next));
  };

  const addReview = (productId, review) => {
    const list = reviews[productId] || [];
    const item = {
      id: Date.now(),
      author:  review.author || 'Аноним',
      rating:  Number(review.rating) || 5,
      text:    review.text || '',
      pros:    review.pros || '',
      cons:    review.cons || '',
      date:    new Date().toISOString(),
    };
    persist({ ...reviews, [productId]: [item, ...list] });
  };

  const getReviews = (productId) => reviews[productId] || [];

  const getAverageRating = (productId) => {
    const list = reviews[productId] || [];
    if (list.length === 0) return 0;
    return list.reduce((a, b) => a + b.rating, 0) / list.length;
  };

  return (
    <ReviewsContext.Provider value={{ addReview, getReviews, getAverageRating }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export const useReviews = () => useContext(ReviewsContext);
