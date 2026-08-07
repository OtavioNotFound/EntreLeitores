export function calculateCompatibility(mine, theirs) {
  const theirBooks = new Map(theirs.map((item) => [item.book_id, item]));
  const common = mine.filter((item) => theirBooks.has(item.book_id));
  const ratingAgreement = common.length ? common.reduce((sum, item) => sum + Math.max(0, 1 - Math.abs((item.rating || 3) - (theirBooks.get(item.book_id).rating || 3)) / 4), 0) / common.length : 0;
  const myGenres = new Set(mine.map((item) => item.book?.genre).filter(Boolean));
  const theirGenres = new Set(theirs.map((item) => item.book?.genre).filter(Boolean));
  const sharedGenres = [...myGenres].filter((genre) => theirGenres.has(genre));
  const genreScore = sharedGenres.length / Math.max(1, new Set([...myGenres, ...theirGenres]).size);
  return { score: Math.round((ratingAgreement * .65 + genreScore * .35) * 100), commonBooks: common.length, sharedGenres };
}

export function calculateDailyPace(pageCount, targetDate, now = new Date()) {
  if (!targetDate) return null;
  const days = Math.max(1, Math.ceil((new Date(targetDate) - now) / 86400000));
  return { days, pagesPerDay: Math.ceil((pageCount || 100) / days) };
}
