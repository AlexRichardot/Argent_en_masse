import { useState, Fragment } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, sortedAccounts, accVal, acctRate, uid, newOwnerFor } from '../../lib/metrics';
import { eur0, pct } from '../../lib/format';
import { TYPES, TIERS, BANKS, OWNERS, isPosType, defaultRate } from '../../lib/catalogs';
import { n, pctStr } from '../../lib/format';

function PositionRow({ pos, onChange, onRemove }) {
  return (
    <div className="pos-row">
      <div className="kind-seg">
        {['action', 'etf'].map((k) => (
          <button key={k} type="button" className={(pos.kind || 'action') === k ? 'on' : ''}
            onClick={() => onChange({ ...pos, kind: k })}>
            {k === 'action' ? 'Action' : 'ETF'}
          </button>
        ))}
      </div>
      <div className="field">
        <label>Titre</label>
        <input className="inp" value={pos.name || ''} placeholder="Ex. Microsoft"
          onChange={(e) => onChange({ ...pos, name: e.target.value })} />
      </div>
      <div className="field">
        <label>Qté</label>
        <input className="inp num" inputMode="decimal" value={pos.shares ?? ''} placeholder="0"
          onChange={(e) => onChange({ ...pos, shares: e.target.value })} />
      </div>
      <div className="field">
        <label>Cours (€)</label>
        <input className="inp num" inputMode="decimal" value={pos.price ?? ''} placeholder="0"
          onChange={(e) => onChange({ ...pos, price: e.target.value })} />
      </div>
      <button className="remove" type="button" onClick={onRemove}>×</button>
    </div>
  );
}

function AccountPositions({ acc, updateAccount }) {
  const positions = acc.positions || [];
  const actions = positions.filter((p) => (p.kind || 'action') === 'action').reduce((s, p) => s + n(p.shares) * n(p.price), 0);
  const etfs = positions.filter((p) => p.kind === 'etf').reduce((s, p) => s + n(p.shares) * n(p.price), 0);

  function addPosition() {
    updateAccount({ ...acc, positions: [...positions, { id: uid(), kind: 'action', name: '', ticker: '', shares: '', price: '' }] });
  }
  function changePosition(pid, next) {
    updateAccount({ ...acc, positions: positions.map((p) => (p.id === pid ? next : p)) });
  }
  function removePosition(pid) {
    updateAccount({ ...acc, positions: positions.filter((p) => p.id !== pid) });
  }

  return (
    <div className="posbox">
      {positions.length
        ? positions.map((p) => (
            <PositionRow key={p.id} pos={p}
              onChange={(next) => changePosition(p.id, next)}
              onRemove={() => removePosition(p.id)} />
          ))
        : <div className="empty-note" style={{ padding: 12 }}>Aucun titre.</div>}
      <div style={{ marginTop: 8 }}>
        <button className="btn soft tiny" type="button" onClick={addPosition}>+ Ajouter un titre</button>
      </div>
      <div className="pos-sub">
        <span>Actions : <b>{eur0.format(actions)}</b></span>
        <span>ETF : <b>{eur0.format(etfs)}</b></span>
        <span>Total : <b>{eur0.format(actions + etfs)}</b></span>
      </div>
    </div>
  );
}

function AccountForm({ ownerFilter, onAdd }) {
  const [label, setLabel] = useState('');
  const [type, setType] = useState('livret_a');
  const [bank, setBank] = useState('');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter));
  const [balance, setBalance] = useState('');
  const [ratePct, setRatePct] = useState(pctStr(defaultRate('livret_a')));
  const [mortgage, setMortgage] = useState('');
  const [shareOwn, setShareOwn] = useState('100');
  const [shareDebt, setShareDebt] = useState('100');

  function changeType(t) {
    setType(t);
    setRatePct(pctStr(defaultRate(t)));
  }

  function submit() {
    if (!type) return;
    const acc = { id: uid(), label, type, bank, owner };
    if (type === 'immobilier') {
      acc.balance = balance; acc.mortgage = mortgage; acc.shareOwn = shareOwn; acc.shareDebt = shareDebt;
    } else if (isPosType(type)) {
      acc.positions = [];
    } else {
      acc.balance = balance; acc.ratePct = ratePct;
    }
    onAdd(acc);
    setLabel(''); setBalance(''); setMortgage('');
  }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3>Ajouter un compte</h3>
      <p className="hint">Livret, PEA, assurance-vie, immobilier…</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Intitulé</label>
        <input className="inp" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={TYPES[type].label} />
      </div>
      <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="field">
          <label>Type</label>
          <select className="inp" value={type} onChange={(e) => changeType(e.target.value)}>
            {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Banque</label>
          <select className="inp" value={bank} onChange={(e) => setBank(e.target.value)}>
            <option value="">— Banque —</option>
            {Object.entries(BANKS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
          </select>
        </div>
      </div>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Détenteur</label>
        <select className="inp" value={owner} onChange={(e) => setOwner(e.target.value)}>
          {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {type === 'immobilier' ? (
        <>
          <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="field">
              <label>Valeur du bien</label>
              <div className="suffix"><input className="inp num" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" /><span className="u">€</span></div>
            </div>
            <div className="field">
              <label>Crédit restant dû</label>
              <div className="suffix"><input className="inp num" inputMode="decimal" value={mortgage} onChange={(e) => setMortgage(e.target.value)} placeholder="0" /><span className="u">€</span></div>
            </div>
          </div>
          <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div className="field">
              <label>Part de détention</label>
              <div className="suffix"><input className="inp num" inputMode="decimal" value={shareOwn} onChange={(e) => setShareOwn(e.target.value)} placeholder="100" /><span className="u">%</span></div>
            </div>
            <div className="field">
              <label>Part du remboursement</label>
              <div className="suffix"><input className="inp num" inputMode="decimal" value={shareDebt} onChange={(e) => setShareDebt(e.target.value)} placeholder="100" /><span className="u">%</span></div>
            </div>
          </div>
          <p className="hint" style={{ margin: '2px 0 12px' }}>Valeur nette = valeur × détention − crédit × remboursement.</p>
        </>
      ) : isPosType(type) ? (
        <p className="hint" style={{ margin: '0 0 12px' }}>Enregistrez, puis dépliez la ligne du compte (flèche) pour ajouter vos actions/ETF.</p>
      ) : (
        <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="field">
            <label>Montant</label>
            <div className="suffix"><input className="inp num" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" /><span className="u">€</span></div>
          </div>
          <div className="field">
            <label>Rendement annuel</label>
            <div className="suffix"><input className="inp num" inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)} placeholder="0" /><span className="u">%</span></div>
          </div>
        </div>
      )}
      <button className="btn primary" onClick={submit}>Ajouter</button>
    </div>
  );
}

export default function Wealth({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const accounts = sortedAccounts(state, ownerFilter, 'val');
  const [expanded, setExpanded] = useState(() => new Set());

  function addAccount(acc) {
    updateState((prev) => ({ ...prev, accounts: [...prev.accounts, acc] }));
  }
  function delAccount(id) {
    updateState((prev) => ({ ...prev, accounts: prev.accounts.filter((a) => a.id !== id) }));
  }
  function updateAccount(next) {
    updateState((prev) => ({ ...prev, accounts: prev.accounts.map((a) => (a.id === next.id ? next : a)) }));
  }
  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <>
      <AccountForm ownerFilter={ownerFilter} onAdd={addAccount} />
      <div className="card">
        <div className="toolbar"><h3 style={{ margin: 0 }}>Comptes & enveloppes</h3></div>
        <p className="hint" style={{ margin: '4px 0 14px' }}>La flèche déplie les titres d'un PEA/CTO.</p>
        {accounts.length ? (
          <table className="ledger">
            <thead>
              <tr>
                <th>Intitulé</th><th>Banque</th><th>Type</th><th className="r">Montant</th><th className="r">Taux</th><th />
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const t = TYPES[a.type] || TYPES.autre;
                const isP = isPosType(a.type);
                const open = expanded.has(a.id);
                const tier = t.tier;
                return (
                  <Fragment key={a.id}>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        {isP && (
                          <button className={`caret ${open ? 'open' : ''}`} onClick={() => toggleExpand(a.id)}>›</button>
                        )}
                        {a.label || t.label}
                      </td>
                      <td>{a.bank ? (BANKS[a.bank]?.name || a.bank) : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                      <td>
                        <span className="pill" style={{ background: TIERS[tier].color + '1a', color: TIERS[tier].color }}>
                          <span className="dot" style={{ background: TIERS[tier].color }} />{t.label}
                        </span>
                      </td>
                      <td className="r amt">{eur0.format(accVal(a))}</td>
                      <td className="r" style={{ color: 'var(--muted)' }}>{a.type === 'immobilier' ? '—' : (acctRate(a) ? pct(acctRate(a)) : '—')}</td>
                      <td><div className="rowact"><button className="iconbtn danger" onClick={() => delAccount(a.id)}>×</button></div></td>
                    </tr>
                    {isP && open && (
                      <tr className="posdetail">
                        <td colSpan={6}>
                          <AccountPositions acc={a} updateAccount={updateAccount} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        ) : <div className="empty-note">Aucun compte. Ajoutez un compte (livret, PEA, assurance-vie, immobilier…).</div>}
        <div className="section-total">
          <span className="lbl">Patrimoine total{m.yieldTotal > 0 ? <> · rendement estimé <b style={{ color: 'var(--emerald)' }}>{eur0.format(m.yieldTotal)}</b> / an</> : null}</span>
          <span className="amt" style={{ color: 'var(--violet)' }}>{eur0.format(m.patrimoine)}</span>
        </div>
      </div>
    </>
  );
}
