// Customer reviews: only reviews with a stated source are shown or sent to Google.
// Placeholder rows without a source (left from the original template) are ignored.
const REVIEW_SOURCES = ['Shopee', 'Zalo', 'Facebook', 'Google', 'Website'];

const cleanReviewText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const normalizeReview = (review) => {
  if (!review || typeof review !== 'object') return null;
  const rating = Number(review.rating);
  const comment = cleanReviewText(review.comment ?? review.text);
  const name = cleanReviewText(review.name);
  const source = REVIEW_SOURCES.find((item) => item.toLowerCase() === String(review.source || '').trim().toLowerCase());
  if (!source || !name || comment.length < 5 || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(review.date || '')) ? String(review.date) : '';
  return { name, rating, comment, source, date };
};

const getGenuineReviews = (product) => (Array.isArray(product?.reviews) ? product.reviews : [])
  .map(normalizeReview)
  .filter(Boolean);

const getReviewStats = (reviews) => {
  if (!reviews.length) return { count: 0, average: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { count: reviews.length, average: Math.round((total / reviews.length) * 10) / 10 };
};

// Stars shown for an average: 4,5 is not rounded up to 5; 4,75 and above is.
const starsForAverage = (average) => Math.min(5, Math.floor(average) + (average - Math.floor(average) >= 0.75 ? 1 : 0));

// Names are shown as given; flag anything that looks like an unmasked phone number.
const looksLikeUnmaskedPhone = (name) => /\d{7,}/.test(String(name || '').replace(/[\s.-]/g, ''));

module.exports = { REVIEW_SOURCES, normalizeReview, getGenuineReviews, getReviewStats, starsForAverage, looksLikeUnmaskedPhone };
