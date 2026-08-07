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

export function calculateReadingStreak(sessions, today = new Date()) {
  const days = new Set(sessions.map((session) => session.occurred_on));
  let cursor = new Date(today); cursor.setHours(12, 0, 0, 0);
  const todayKey = cursor.toISOString().slice(0, 10);
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

export function summarizeSessions(sessions) {
  return sessions.reduce((summary, session) => ({
    pages: summary.pages + (session.pages_read || 0),
    minutes: summary.minutes + (session.minutes_read || 0),
    days: summary.days.add(session.occurred_on),
  }), { pages: 0, minutes: 0, days: new Set() });
}
