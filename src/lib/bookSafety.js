export const WARNING_CATEGORIES = [
  ['violencia','Violência'],['luto','Luto'],['abuso','Abuso'],['sexo','Conteúdo sexual'],
  ['saude_mental','Saúde mental'],['animais','Sofrimento animal'],['discriminacao','Discriminação'],
  ['drogas','Álcool ou drogas'],['outro','Outro'],
];

export const WARNING_LABELS = Object.fromEntries(WARNING_CATEGORIES);

export function matchingWarnings(warnings = [], preferences = {}) {
  const selected = new Set(preferences.categories || []);
  const threshold = Number(preferences.minimum_severity || 2);
  return warnings.filter((warning) => selected.has(warning.category) && Number(warning.severity) >= threshold);
}

export function warningConfidence(votes = 0) {
  if (votes >= 5) return 'alto consenso';
  if (votes >= 2) return 'confirmado por leitores';
  return 'relato individual';
}
