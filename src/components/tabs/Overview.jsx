import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, sortedAccounts, sortedProjects, accVal } from '../../lib/metrics';
import { eur0, pct, fmtDate, whenLabel, n } from '../../lib/format';
import { ASSET_GROUPS, TIERS, OWNERS, TYPES } from '../../lib/catalogs';
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

function riskAnalysis(m) {
  if (m.patrimoine <= 0) return "Ajoutez des comptes dans « Épargne & patrimoine » pour voir votre profil de risque.";
  const shares = Object.entries(m.classTot).map(([k, v]) => [k, v / m.patrimoine]).sort((a, b) => b[1] - a[1]);
  const [topKey, topShare] = shares[0];
  const label = TIERS[topKey].label.toLowerCase();
  if (topShare > 0.6) {
    if (topKey === 'securise') return `Patrimoine très concentré sur le ${label} (${pct(topShare)}) : rassurant, mais le rendement à long terme sera limité. Si votre horizon le permet, envisagez de diversifier vers des supports plus dynamiques.`;
    if (topKey === 'immobilier') return `Patrimoine très concentré sur l'immobilier (${pct(topShare)}). Pensez à renforcer l'épargne financière à côté pour garder de la liquidité.`;
    if (topKey === 'dynamique') return `Patrimoine très exposé aux marchés (${pct(topShare)}), donc plus volatil. Assurez-vous d'avoir une épargne de précaution suffisante en parallèle.`;
    return `Patrimoine concentré sur « ${label} » (${pct(topShare)}).`;
  }
  return `Répartition plutôt équilibrée entre les classes d'actifs (${label} en tête avec ${pct(topShare)}) : un bon point pour lisser le risque.`;
}

export default function Overview({ ownerFilter }) {
  const { state } = useData();
  const m = computeMetrics(state, ownerFilter);
  const [sortKey, setSortKey] = useState('val');

  const assetItems = Object.entries(ASSET_GROUPS)
    .map(([k, g]) => ({ ...g, val: m.assetTot[k] || 0 }))
    .filter((c) => c.val > 0)
    .sort((a, b) => b.val - a.val);

  const rows = sortedAccounts(state, ownerFilter, sortKey).map((a) => ({
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
          <Bars items={assetItems} total={m.patrimoine} />
        </div>
        <div className="card">
          <div className="chart-head">
            <h3 style={{ margin: 0 }}>Détail du patrimoine</h3>
            <div className="sortsel">
              Trier
              <select className="inp" style={{ width: 'auto', padding: '6px 26px 6px 10px' }} value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                <option value="val">Montant</option>
                <option value="label">Nom</option>
                <option value="bank">Banque</option>
              </select>
            </div>
          </div>
          {rows.length ? (
            <>
              <div className="acc-lines">
                {rows.map((r, i) => (
                  <div className="acc-line" key={i}>
                    <span className="cellbank">
                      {r.bank && <BankLogo bankKey={r.bank} size={18} />}
                      <b>{r.label}</b>
                    </span>
                    <span className="amt">{eur0.format(r.val)}</span>
                  </div>
                ))}
              </div>
              <div className="section-total">
                <span className="lbl">Total</span>
                <span className="amt" style={{ color: 'var(--violet)' }}>{eur0.format(m.patrimoine)}</span>
              </div>
            </>
          ) : <div className="empty-note">Ajoutez vos comptes dans « Épargne & patrimoine ».</div>}
        </div>
      </div>

      <div className="row-2b">
        <div className="card">
          <h3>Échéances importantes</h3>
          {projs.length ? projs.map(({ p, nd }) => {
            const w = whenLabel(nd.date);
            const o = OWNERS[p.owner] || OWNERS.commun;
            return (
              <div className="ech-item" key={p.id}>
                <div className="ech-ic" style={{ background: p.kind === 'objectif' ? '#7C3AED' : '#3B82F6' }}>
                  <Icon name={p.kind === 'objectif' ? 'target' : 'calendar'} size={18} />
                </div>
                <div className="ech-mid">
                  <div className="ech-t">
                    <span className="ech-label">{p.label || 'Projet'}</span>
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
          <div className="donut-legend">
            {Object.entries(m.classTot).filter(([, v]) => v > 0).map(([k, v]) => (
              <div key={k}>
                <div className="pc" style={{ color: TIERS[k].color }}>{m.patrimoine > 0 ? pct(v / m.patrimoine) : '—'}</div>
                <div className="nm"><span className="dot" style={{ background: TIERS[k].color }} />{TIERS[k].label}</div>
              </div>
            ))}
          </div>
          <p className="hint" style={{ marginTop: 12 }}>{riskAnalysis(m)}</p>
        </div>
      </div>
    </>
  );
}
