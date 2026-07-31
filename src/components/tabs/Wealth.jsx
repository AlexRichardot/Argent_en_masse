import { useState, useRef, Fragment } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, sortedAccounts, accVal, acctRate, uid, newOwnerFor } from '../../lib/metrics';
import { eur0, pct, n, pctStr } from '../../lib/format';
import { TYPES, TIERS, BANKS, SECURITIES, isPosType, defaultRate } from '../../lib/catalogs';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../lib/supabaseClient';
import BankLogo from '../BankLogo';
import Confirm from '../Confirm';
import Icon from '../Icon';
import SwipeRow from '../SwipeRow';

const SAFE_TYPE_KEYS = Object.keys(TYPES).filter((k) => !isPosType(k));
const MARKET_TYPE_KEYS = Object.keys(TYPES).filter((k) => isPosType(k));

function matchSecurities(q) {
  const s = q.trim().toLowerCase();
  if (!s) return SECURITIES.slice(0, 8);
  return SECURITIES.filter((x) => x.n.toLowerCase().includes(s) || x.t.toLowerCase().includes(s)).slice(0, 8);
}

async function fetchQuote(pos, onUpdate) {
  if (!pos.ticker) { onUpdate({ ...pos, err: 'Indiquez un titre référencé (ticker)' }); return; }
  onUpdate({ ...pos, loading: true, err: '' });
  try {
    const params = new URLSearchParams({ symbol: pos.ticker });
    if (pos.x) params.set('exchange', pos.x);
    const res = await fetch(`${SUPABASE_URL}/functions/v1/quote?${params.toString()}`, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, apikey: SUPABASE_ANON_KEY },
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
    const price = Number(data.price_eur ?? data.price_native);
    if (!isFinite(price) || price <= 0) throw new Error('cours introuvable');
    onUpdate({ ...pos, price: Math.round(price * 100) / 100, cur: data.currency || 'EUR', native: Number(data.price_native) || price, asof: data.asof || new Date().toISOString().slice(0, 10), err: '', loading: false });
  } catch (e) {
    onUpdate({ ...pos, err: `Cours auto indisponible (${e.message || 'erreur'})`, loading: false });
  }
}

function SecurityField({ pos, onChange }) {
  const [open, setOpen] = useState(false);
  const blurTimer = useRef(null);
  const matches = matchSecurities(pos.name || '');

  function pick(sec) {
    const next = { ...pos, name: sec.n, ticker: sec.t, kind: sec.k, x: sec.x };
    onChange(next);
    setOpen(false);
    fetchQuote(next, onChange);
  }

  return (
    <div className="field" style={{ position: 'relative' }}>
      <label>Titre</label>
      <input className="inp" value={pos.name || ''} placeholder="Ex. Microsoft" autoComplete="off"
        onChange={(e) => { onChange({ ...pos, name: e.target.value, ticker: '' }); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimer.current = setTimeout(() => setOpen(false), 150); }} />
      {open && matches.length > 0 && (
        <div className="ac-pop on" style={{ position: 'absolute', top: '100%', left: 0, width: 280 }}>
          {matches.map((sec) => (
            <div key={sec.t} className="ac-item" onPointerDown={(e) => { e.preventDefault(); clearTimeout(blurTimer.current); pick(sec); }}>
              <span className="tk">{sec.t}</span>
              <span><span className="nm">{sec.n}</span> <span className="mx">{sec.x}</span></span>
              {sec.pea && <span className="pe">PEA</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PositionRow({ pos, onChange, onRemove }) {
  let meta = [];
  if (pos.ticker) meta.push(<b key="tk" style={{ color: 'var(--ink2)' }}>{pos.ticker}</b>);
  if (pos.x) meta.push(pos.x);
  if (pos.asof) meta.push(`cours au ${pos.asof}`);
  const metaText = meta.length > 0;
  const searchTerm = pos.name || pos.ticker;
  const searchUrl = searchTerm
    ? `https://www.google.com/search?q=${encodeURIComponent(searchTerm + ' cours bourse')}`
    : null;

  return (
    <>
      <div className="pos-row">
        <div className="kind-seg">
          {['action', 'etf'].map((k) => (
            <button key={k} type="button" className={(pos.kind || 'action') === k ? 'on' : ''}
              onClick={() => onChange({ ...pos, kind: k })}>
              {k === 'action' ? 'Action' : 'ETF'}
            </button>
          ))}
        </div>
        <SecurityField pos={pos} onChange={onChange} />
        <div className="field">
          <label>Qté</label>
          <input className="inp num" inputMode="decimal" value={pos.shares ?? ''} placeholder="0"
            onChange={(e) => onChange({ ...pos, shares: e.target.value })} />
        </div>
        <div className="field">
          <label>Cours (€)</label>
          <input className="inp num" inputMode="decimal" value={pos.price ?? ''} placeholder="0" disabled={pos.loading}
            onChange={(e) => onChange({ ...pos, price: e.target.value })} />
        </div>
        <div className="pos-actions">
          {pos.loading ? (
            <button className="refresh" disabled type="button"><span className="spin" /></button>
          ) : (
            <button className="refresh" type="button" title="Récupérer le cours" onClick={() => fetchQuote(pos, onChange)}>↻</button>
          )}
          <button className="remove" type="button" onClick={onRemove}>×</button>
        </div>
      </div>
      {(metaText || pos.err || searchUrl) && (
        <div className="pos-meta">
          {meta.reduce((acc, cur, i) => (i === 0 ? [cur] : [...acc, ' · ', cur]), [])}
          {pos.err && <span className="err">{meta.length ? ' · ' : ''}{pos.err}</span>}
          {searchUrl && (
            <a className="link-out" href={searchUrl} target="_blank" rel="noopener" style={{ marginLeft: 6 }}>
              <Icon name="ext" size={12} /> voir le cours
            </a>
          )}
        </div>
      )}
    </>
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

function AccountForm({ ownerFilter, profiles, editing, typeKeys, onSave, onCancel }) {
  const rec = editing || {};
  const availableTypes = typeKeys || Object.keys(TYPES);
  const [label, setLabel] = useState(rec.label || '');
  const [type, setType] = useState(rec.type || availableTypes[0]);
  const [bank, setBank] = useState(rec.bank || '');
  const [owner, setOwner] = useState(rec.owner || newOwnerFor(ownerFilter, profiles));
  const [balance, setBalance] = useState(rec.balance ?? '');
  const [ratePct, setRatePct] = useState(rec.ratePct ?? pctStr(defaultRate(rec.type || 'livret_a')));
  const [mortgage, setMortgage] = useState(rec.mortgage ?? '');
  const [shareOwn, setShareOwn] = useState(rec.shareOwn ?? '100');
  const [shareDebt, setShareDebt] = useState(rec.shareDebt ?? '100');

  function changeType(t) {
    setType(t);
    setRatePct(pctStr(defaultRate(t)));
  }

  function submit() {
    if (!type) return;
    const acc = { id: editing ? editing.id : uid(), label, type, bank, owner };
    if (type === 'immobilier') {
      acc.balance = balance; acc.mortgage = mortgage; acc.shareOwn = shareOwn; acc.shareDebt = shareDebt;
    } else if (isPosType(type)) {
      acc.positions = editing?.positions || [];
    } else {
      acc.balance = balance; acc.ratePct = ratePct;
    }
    onSave(acc);
  }

  return (
    <div className="card" style={{ marginBottom: 18, background: '#FBFAFF' }}>
      <h3>{editing ? 'Modifier le compte' : 'Ajouter une épargne'}</h3>
      <p className="hint">Livret, PEA, assurance-vie, immobilier…</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Intitulé</label>
        <input className="inp" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={TYPES[type].label} />
      </div>
      <div className="two">
        <div className="field">
          <label>Type</label>
          <select className="inp" value={type} onChange={(e) => changeType(e.target.value)}>
            {availableTypes.map((k) => <option key={k} value={k}>{TYPES[k].label}</option>)}
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
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {type === 'immobilier' ? (
        <>
          <div className="two">
            <div className="field">
              <label>Valeur du bien</label>
              <div className="suffix"><input className="inp num" inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0" /><span className="u">€</span></div>
            </div>
            <div className="field">
              <label>Crédit restant dû</label>
              <div className="suffix"><input className="inp num" inputMode="decimal" value={mortgage} onChange={(e) => setMortgage(e.target.value)} placeholder="0" /><span className="u">€</span></div>
            </div>
          </div>
          <div className="two">
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
        <div className="two">
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
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn primary" onClick={submit}>{editing ? 'Enregistrer' : 'Ajouter'}</button>
        <button className="btn ghost" onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

function AccountRow({ a, isP, open, onEdit, onDelete, onToggle }) {
  const t = TYPES[a.type] || TYPES.autre;
  const tier = t.tier;
  const showRate = a.type !== 'immobilier' && !isP && acctRate(a) > 0;

  return (
    <div className="acc-row">
      <div className="acc-d">
        <div className="acc-row-main">
          {isP && <button className={`caret ${open ? 'open' : ''}`} onClick={onToggle}>›</button>}
          {a.bank && <BankLogo bankKey={a.bank} size={20} />}
          <span className="acc-name">{a.label || t.label}</span>
          <span className="acc-amt">{eur0.format(accVal(a))}</span>
        </div>
        <div className="acc-row-meta">
          <span className="pill" style={{ background: TIERS[tier].color + '1a', color: TIERS[tier].color }}>
            <span className="dot" style={{ background: TIERS[tier].color }} />{t.label}
          </span>
          {showRate && <span className="acc-rate">{pct(acctRate(a))}</span>}
          <div className="rowact">
            <button className="iconbtn" title="Modifier" onClick={onEdit}><Icon name="edit" size={14} /></button>
            <button className="iconbtn danger" title="Supprimer" onClick={onDelete}><Icon name="trash" size={14} /></button>
          </div>
        </div>
      </div>
      <div className="acc-m">
        <SwipeRow onEdit={onEdit} onDelete={onDelete}>
          <div className="acc-row-main">
            {isP && <button className={`caret ${open ? 'open' : ''}`} onClick={onToggle}>›</button>}
            {a.bank && <BankLogo bankKey={a.bank} size={20} />}
            <span className="acc-name">{a.label || t.label}</span>
            <span className="acc-amt">{eur0.format(accVal(a))}</span>
          </div>
          <div className="acc-row-meta">
            <span className="pill" style={{ background: TIERS[tier].color + '1a', color: TIERS[tier].color }}>
              <span className="dot" style={{ background: TIERS[tier].color }} />{t.label}
            </span>
            {showRate && <span className="acc-rate">{pct(acctRate(a))}</span>}
          </div>
        </SwipeRow>
      </div>
    </div>
  );
}

export default function Wealth({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const accounts = sortedAccounts(state, ownerFilter, 'val');
  const safeAccounts = accounts.filter((a) => !isPosType(a.type));
  const marketAccounts = accounts.filter((a) => isPosType(a.type));
  const safeTotal = safeAccounts.reduce((s, a) => s + accVal(a), 0);
  const safeYield = safeAccounts.reduce((s, a) => s + (a.type === 'immobilier' ? 0 : accVal(a) * acctRate(a)), 0);
  const marketTotal = marketAccounts.reduce((s, a) => s + accVal(a), 0);

  const [expanded, setExpanded] = useState(() => new Set());
  const [formMode, setFormMode] = useState(null); // null | 'new' | accountId
  const [confirmDelId, setConfirmDelId] = useState(null);

  function saveAccount(acc) {
    updateState((prev) => {
      const exists = prev.accounts.some((a) => a.id === acc.id);
      return { ...prev, accounts: exists ? prev.accounts.map((a) => (a.id === acc.id ? acc : a)) : [...prev.accounts, acc] };
    });
    setFormMode(null);
  }
  function delAccount(id) {
    updateState((prev) => ({ ...prev, accounts: prev.accounts.filter((a) => a.id !== id) }));
    setConfirmDelId(null);
    if (formMode === id) setFormMode(null);
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

  function renderSection(list, typeKeys) {
    return list.map((a) => {
      if (formMode === a.id) {
        return (
          <AccountForm key={a.id} ownerFilter={ownerFilter} profiles={state.profiles} editing={a} typeKeys={typeKeys}
            onSave={saveAccount} onCancel={() => setFormMode(null)} />
        );
      }
      const isP = isPosType(a.type);
      const open = expanded.has(a.id);
      return (
        <Fragment key={a.id}>
          <AccountRow a={a} isP={isP} open={open}
            onEdit={() => setFormMode(a.id)}
            onDelete={() => setConfirmDelId(a.id)}
            onToggle={() => toggleExpand(a.id)} />
          {isP && open && <AccountPositions acc={a} updateAccount={updateAccount} />}
        </Fragment>
      );
    });
  }

  return (
    <>
      <div className="card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Comptes</h3>
          <div className="sp" />
          {!formMode && <button className="iconbtn add" title="Ajouter un compte" onClick={() => setFormMode('new-safe')}><Icon name="plus" size={16} /></button>}
        </div>
        {formMode === 'new-safe' && (
          <AccountForm ownerFilter={ownerFilter} profiles={state.profiles} editing={null} typeKeys={SAFE_TYPE_KEYS}
            onSave={saveAccount} onCancel={() => setFormMode(null)} />
        )}
        {safeAccounts.length ? (
          <>
            <div className="acc-lines-wealth">{renderSection(safeAccounts, SAFE_TYPE_KEYS)}</div>
            <div className="section-total">
              <span className="lbl">Sous-total{safeYield > 0 ? <> · rendement estimé <b style={{ color: 'var(--emerald)' }}>{eur0.format(safeYield)}</b> / an</> : null}</span>
              <span className="amt">{eur0.format(safeTotal)}</span>
            </div>
          </>
        ) : <div className="empty-note">Aucun compte. Ajoutez un livret, une assurance-vie, un bien immobilier…</div>}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Investissements boursiers</h3>
          <div className="sp" />
          {!formMode && <button className="iconbtn add" title="Ajouter un investissement" onClick={() => setFormMode('new-market')}><Icon name="plus" size={16} /></button>}
        </div>
        {formMode === 'new-market' && (
          <AccountForm ownerFilter={ownerFilter} profiles={state.profiles} editing={null} typeKeys={MARKET_TYPE_KEYS}
            onSave={saveAccount} onCancel={() => setFormMode(null)} />
        )}
        {marketAccounts.length ? (
          <>
            <p className="hint" style={{ margin: '0 0 8px' }}>Pas de rendement estimé : la valeur dépend des cours du jour.</p>
            <div className="acc-lines-wealth">{renderSection(marketAccounts, MARKET_TYPE_KEYS)}</div>
            <div className="section-total">
              <span className="lbl">Sous-total</span>
              <span className="amt">{eur0.format(marketTotal)}</span>
            </div>
          </>
        ) : <div className="empty-note">Aucun compte-titres ou PEA. Ajoutez-en un pour suivre vos actions et ETF.</div>}
      </div>

      {accounts.length > 0 && (
        <div className="card" style={{ marginTop: 18 }}>
          <div className="section-total" style={{ margin: 0, padding: 0, border: 'none' }}>
            <span className="lbl">Patrimoine total</span>
            <span className="amt" style={{ color: 'var(--violet)' }}>{eur0.format(m.patrimoine)}</span>
          </div>
        </div>
      )}
      {confirmDelId && (
        <Confirm
          title="Supprimer ce compte ?"
          message="Cette action est définitive."
          onConfirm={() => delAccount(confirmDelId)}
          onCancel={() => setConfirmDelId(null)}
        />
      )}
    </>
  );
}
