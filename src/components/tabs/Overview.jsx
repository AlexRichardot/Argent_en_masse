import { useData } from '../../context/DataContext';
import { computeMetrics, sortedAccounts, sortedProjects, accVal } from '../../lib/metrics';
import { eur0, pct, fmtDate, whenLabel, n } from '../../lib/format';
import { ASSET_GROUPS, TIERS, OWNERS, TYPES, BANKS } from '../../lib/catalogs';
import BankLogo from '../BankLogo';
import Icon from '../Icon';

function Bars({ items, total }) {
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

export default function Overview({ ownerFilter }) {
  const { state } = useData();
  const m = computeMetrics(state, ownerFilter);

  const assetItems = Object.entries(ASSET_GROUPS)
    .map(([k, g]) => ({ ...g, val: m.assetTot[k] || 0 }))
    .filter((c) => c.val > 0)
    .sort((a, b) => b.val - a.val);

  const rows = sortedAccounts(state, ownerFilter, 'val').map((a) => ({
    label: a.label || TYPES[a.type]?.label || a.type,
    bank: a.bank,
    val: accVal(a),
  }));

  const projs = sortedProjects(state, ownerFilter, m.capacity).filter((x) => x.nd.date).slice(0, 5);

  return (
    <>
      <div className="kpis">
        <div className="kpi v1">
          <div className="title">Patrimoine total</div>
          <div className="cv">Valeur nette</div>
          <div className="val">{m.patrimoine !== 0 ? eur0.format(m.patrimoine) : '—'}</div>
          {m.yieldTotal > 0 && <div className="sub">≈ {eur0.format(m.yieldTotal)} d'intérêts / an</div>}
        </div>
        <div className="kpi v2">
          <div className="title">Montant disponible</div>
          <div className="cv">Mobilisable (hors immo & retraite)</div>
          <div className="val">{eur0.format(m.dispo)}</div>
        </div>
        <div className="kpi v3">
          <div className="title">Revenu mensuel</div>
          <div className="cv">Net par mois</div>
          <div className="val">{eur0.format(m.income)}</div>
        </div>
        <div className="kpi v4">
          <div className="title">Capacité d'épargne</div>
          <div className="cv">Reste chaque mois</div>
          <div className="val">{eur0.format(m.capacity)}</div>
          <div className="sub">Taux {m.income > 0 ? pct(m.rate) : '—'}</div>
        </div>
      </div>

      <div className="row-2">
        <div className="card">
          <h3>Répartition du patrimoine</h3>
          <p className="hint">Par type d'actif.</p>
          <Bars items={assetItems} total={m.patrimoine} />
        </div>
        <div className="card">
          <h3>Détail du patrimoine</h3>
          <p className="hint">Par compte.</p>
          {rows.length ? (
            <table className="ledger">
              <thead><tr><th>Compte</th><th>Banque</th><th className="r">Montant</th></tr></thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.label}</td>
                    <td>{r.bank ? (
                      <span className="cellbank"><BankLogo bankKey={r.bank} size={20} />{BANKS[r.bank]?.name || r.bank}</span>
                    ) : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                    <td className="r amt">{eur0.format(r.val)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="empty-note">Ajoutez vos comptes dans « Épargne & patrimoine ».</div>}
        </div>
      </div>

      <div className="row-2b">
        <div className="card">
          <h3>Échéances importantes</h3>
          <p className="hint">Qui épargne pour quoi, et pour quand.</p>
          {projs.length ? projs.map(({ p, nd }) => {
            const w = whenLabel(nd.date);
            const o = OWNERS[p.owner] || OWNERS.commun;
            return (
              <div className="ech-item" key={p.id}>
                <div className="ech-ic" style={{ background: p.kind === 'objectif' ? '#7C3AED' : '#3B82F6' }}>
                  <Icon name={p.kind === 'objectif' ? 'target' : 'calendar'} size={18} />
                </div>
                <div>
                  <div className="ech-t">
                    {p.label || 'Projet'}
                    <span className="owner-chip" style={{ background: o.color + '18', color: o.color }}>
                      <span className="dot" style={{ background: o.color }} />{o.label}
                    </span>
                  </div>
                  <div className="ech-s">{(nd.estimated ? 'estimée ' : '') + fmtDate(nd.date)}</div>
                </div>
                <div className="ech-r">
                  <div className="ech-amt">{eur0.format(n(p.amount))}</div>
                  <div className="ech-when" style={{ color: w.color }}>{w.txt}</div>
                </div>
              </div>
            );
          }) : <div className="empty-note">Aucune échéance pour le moment.</div>}
        </div>
        <div className="card">
          <h3>Profil de risque</h3>
          <p className="hint">Sécurité, diversification, dynamisme, immobilier.</p>
          <div className="donut-legend">
            {Object.entries(m.classTot).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k}>
                <div className="pc" style={{ color: TIERS[k].color }}>{m.patrimoine > 0 ? pct(v / m.patrimoine) : '—'}</div>
                <div className="nm"><span className="dot" style={{ background: TIERS[k].color }} />{TIERS[k].label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
