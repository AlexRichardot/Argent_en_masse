export const eur0 = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

export const n = (v) => {
  const x = parseFloat(String(v).replace(',', '.'));
  return isFinite(x) ? x : 0;
};

export const pct = (v) =>
  (v * 100).toFixed(v * 100 >= 10 ? 0 : 1).replace('.', ',') + '\u00A0%';

export const pctStr = (dec) => String(+(dec * 100).toFixed(4));

export function eurC(v) {
  const a = Math.abs(v);
  if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace('.', ',') + '\u00A0M€';
  if (a >= 1e3) return Math.round(v / 1e3) + '\u00A0k€';
  return Math.round(v) + '\u00A0€';
}

export const fmtDate = (d) =>
  d ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(d) : '—';

export const fmtMonth = (d) =>
  d ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d) : '—';

export function whenLabel(d) {
  if (!d) return { txt: 'à définir', color: 'var(--muted)' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((d - today) / 864e5);
  if (days < 0) return { txt: 'en retard', color: 'var(--rose)' };
  if (days === 0) return { txt: "aujourd'hui", color: 'var(--rose)' };
  if (days < 31) return { txt: 'dans ' + days + ' j', color: 'var(--orange)' };
  const mo = Math.round(days / 30.44);
  if (mo < 12) return { txt: 'dans ' + mo + ' mois', color: 'var(--amber)' };
  const yr = (days / 365).toFixed(1).replace('.', ',');
  return { txt: 'dans ' + yr + ' an' + (days / 365 >= 2 ? 's' : ''), color: 'var(--emerald)' };
}
