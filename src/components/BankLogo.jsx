import { useState } from 'react';
import { BANKS } from '../lib/catalogs';

function initialsOf(name) {
  return name
    .replace(/[^A-Za-zÀ-ÿ ]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function BankLogo({ bankKey, size = 34 }) {
  const b = BANKS[bankKey];
  const [stage, setStage] = useState(0); // 0 = clearbit, 1 = google favicon, 2 = give up

  if (!b) {
    return (
      <span className="blogo" style={{ width: size, height: size, background: '#9A97B4' }}>
        <span className="bm" style={{ fontSize: size * 0.38 }}>–</span>
      </span>
    );
  }

  const src = b.domain && stage === 0
    ? `https://logo.clearbit.com/${b.domain}?size=${size * 2}`
    : b.domain && stage === 1
      ? `https://www.google.com/s2/favicons?domain=${b.domain}&sz=64`
      : null;

  return (
    <span className="blogo" style={{ width: size, height: size, background: b.color }}>
      <span className="bm" style={{ fontSize: size * 0.36 }}>{initialsOf(b.name)}</span>
      {src && <img src={src} alt={b.name} onError={() => setStage((s) => s + 1)} />}
    </span>
  );
}
