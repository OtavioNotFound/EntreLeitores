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

export function calculateReadingStreak(sessions, today = new Date(), protections = []) {
  const days = new Set([
    ...sessions.map((session) => session.occurred_on),
    ...protections.map((item) => item.protected_on),
  ]);
  let cursor = new Date(today); cursor.setHours(12, 0, 0, 0);
  const todayKey = localDateKey(cursor);
  if (!days.has(todayKey)) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDateKey(cursor))) { streak += 1; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}

export function buildMonthlyStreakCalendar(sessions, protections, monthDate = new Date(), today = new Date()) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();
  const todayKey = localDateKey(today);
  const readingDays = new Set(sessions.map((session) => session.occurred_on));
  const protectedDays = new Set(protections.map((item) => item.protected_on));
  const days = Array.from({ length: lastDay }, (_, index) => {
    const date = new Date(year, month, index + 1, 12);
    const key = localDateKey(date);
    const future = key > todayKey;
    return {
      day: index + 1,
      date: key,
      future,
      today: key === todayKey,
      status: future ? 'future' : readingDays.has(key) ? 'read' : protectedDays.has(key) ? 'protected' : 'missed',
    };
  });
  return { year, month, firstWeekday, days };
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function summarizeSessions(sessions) {
  return sessions.reduce((summary, session) => ({
    pages: summary.pages + (session.pages_read || 0),
    minutes: summary.minutes + (session.minutes_read || 0),
    days: summary.days.add(session.occurred_on),
  }), { pages: 0, minutes: 0, days: new Set() });
}

export function buildWeeklyActivity(sessions, today = new Date()) {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today); date.setHours(12,0,0,0); date.setDate(date.getDate() - (6 - offset));
    const key = date.toISOString().slice(0,10);
    const daily = sessions.filter((session) => session.occurred_on === key);
    return { date:key, label:new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(date).replace('.',''), pages:daily.reduce((sum,item)=>sum+(item.pages_read||0),0), minutes:daily.reduce((sum,item)=>sum+(item.minutes_read||0),0) };
  });
}

export function calculateGentleGoal(goal, sessions, today = new Date()) {
  const relevant = sessions.filter((session) => session.occurred_on >= goal.starts_on && session.occurred_on <= goal.ends_on);
  const progress = goal.metric === 'pages' ? relevant.reduce((sum,item)=>sum+(item.pages_read||0),0) : goal.metric === 'minutes' ? relevant.reduce((sum,item)=>sum+(item.minutes_read||0),0) : new Set(relevant.map((item)=>item.occurred_on)).size;
  const remaining = Math.max(0, goal.target - progress);
  const daysLeft = Math.max(1, Math.ceil((new Date(`${goal.ends_on}T12:00:00`) - today) / 86400000) + 1);
  return { progress, remaining, percent:Math.min(100,Math.round((progress/goal.target)*100)), dailySuggestion:Math.ceil(remaining/daysLeft), daysLeft };
}
