import { eur0, pct } from '../lib/format';
import Icon from './Icon';

export default function Bars({ items, total }) {
  if (!items.length) return <div className="empty-note">Aucune donnée à afficher.</div>;
  return (
    <div className="bars">
      {items.map((c) => {
        const share = total > 0 ? c.val / total : 0;
        return (
          <div className="bar-row" key={c.label}>
            <div className="bar-lab">
              <span className="bar-ic" style={{ background: c.color }}><Icon name={c.icon} size={15} /></span>
              {c.label}
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: Math.max(share * 100, 2).toFixed(1) + '%', background: c.color }} />
            </div>
            <div className="bar-val">{eur0.format(c.val)} <span>{pct(share)}</span></div>
          </div>
        );
      })}
    </div>
  );
}
