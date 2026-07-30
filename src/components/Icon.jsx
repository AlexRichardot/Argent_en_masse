const PATHS = {
  building: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/><path d="M5 21h14"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="3"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.2"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>',
  landmark: '<path d="M3 21h18"/><path d="M4 10h16"/><path d="M12 3l8 4H4z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  flow: '<path d="M7 6v12"/><path d="M4 9l3-3 3 3"/><path d="M17 18V6"/><path d="M20 15l-3 3-3-3"/>',
  target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  sparkles: '<path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M18.5 14l.9 2.4 2.6.9-2.6.9-.9 2.4-.9-2.4-2.6-.9 2.6-.9z"/>',
  tag: '<path d="M3 12l8.6-8.6a2 2 0 0 1 1.4-.6H19a2 2 0 0 1 2 2v5a2 2 0 0 1-.6 1.4L12 20a2 2 0 0 1-2.8 0L3 14a2 2 0 0 1 0-2z"/><circle cx="16" cy="8" r="1.3"/>',
  calendar: '<rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9h18M8 3v3M16 3v3"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
  cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.4 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6"/>',
  car: '<path d="M5 12l1.5-4.5A2 2 0 0 1 8.4 6h7.2a2 2 0 0 1 1.9 1.5L19 12"/><path d="M4 12h16v5H4z"/><circle cx="7.5" cy="17" r="1.4"/><circle cx="16.5" cy="17" r="1.4"/>',
  ticket: '<path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/>',
  media: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8"/><path d="M10 9l4 2.5-4 2.5z" fill="currentColor" stroke="none"/>',
  heart: '<path d="M12 20s-7-4.4-9.3-8.6C1.2 8.7 2.6 5.5 5.6 5.1c1.8-.2 3.3.8 4.4 2.2 1.1-1.4 2.6-2.4 4.4-2.2 3 .4 4.4 3.6 2.9 6.3C19 15.6 12 20 12 20z"/>',
  refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4"/><path d="M21 3v6h-6"/>',
  trash: '<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12"/>',
  download: '<path d="M12 3v12"/><path d="M8 11l4 4 4-4"/><path d="M4 19h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  ext: '<path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};

export default function Icon({ name, size = 18 }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      width={size} height={size} dangerouslySetInnerHTML={{ __html: d }} />
  );
}
