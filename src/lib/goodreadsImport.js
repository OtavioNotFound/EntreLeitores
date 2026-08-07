function parseCsvRows(text) {
  const rows = []; let row = []; let field = ''; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]; const next = text[index + 1];
    if (char === '"' && quoted && next === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(field); if (row.some((value) => value.trim())) rows.push(row); row = []; field = '';
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const shelfStatus = { read: 'lidos', 'currently-reading': 'lendo', 'to-read': 'quero-ler' };

export function parseGoodreadsCsv(text) {
  const rows = parseCsvRows(text.replace(/^\uFEFF/, ''));
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  const indexOf = (name) => headers.indexOf(name);
  if (indexOf('Title') < 0 || indexOf('Author') < 0) throw new Error('CSV do Goodreads sem as colunas Title e Author.');
  return rows.slice(1).map((row) => {
    const value = (name) => (row[indexOf(name)] || '').trim();
    const isbn = value('ISBN13').replace(/[^0-9X]/gi, '') || value('ISBN').replace(/[^0-9X]/gi, '') || null;
    const rating = Number(value('My Rating')) || null;
    return { title: value('Title'), author: value('Author'), isbn, rating, status: shelfStatus[value('Exclusive Shelf')] || 'quero-ler', finishedAt: value('Date Read') || null };
  }).filter((book) => book.title && book.author);
}
