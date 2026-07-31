import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, activeSet, uid, newOwnerFor } from '../../lib/metrics';
import { eur0, pct, n } from '../../lib/format';
import { EXPENSE_CATS, catInfo, TYPES, BANKS } from '../../lib/catalogs';
import BankLogo from '../BankLogo';
import Icon from '../Icon';
import Bars from '../Bars';

function flowAnalysis(m) {
  if (m.income <= 0) return "Ajoutez vos revenus et dépenses pour obtenir une analyse.";
  const parts = [];
  if (m.capacity < 0) {
    parts.push(`Vos dépenses dépassent vos revenus de ${eur0.format(-m.capacity)} par mois : il est urgent de réduire certains postes ou d'augmenter vos revenus.`);
  } else if (m.rate < 0.1) {
    parts.push(`Votre taux d'épargne est d'environ ${pct(m.rate)}, plutôt faible. Viser 15 à 20 % accélère la constitution de votre patrimoine.`);
  } else if (m.rate > 0.3) {
    parts.push(`Excellent taux d'épargne (${pct(m.rate)}). Vérifiez que votre épargne de précaution est suffisante avant d'investir le surplus.`);
  } else {
    parts.push(`Taux d'épargne correct (${pct(m.rate)}), dans la moyenne recommandée.`);
  }
  const catShares = Object.entries(m.expByCat).map(([k, v]) => [k, m.expense > 0 ? v / m.expense : 0]).sort((a, b) => b[1] - a[1]);
  const [topCat, topShare] = catShares[0] || [];
  if (topCat && topShare > 0.4) {
    parts.push(`« ${topCat} » représente ${pct(topShare)} de vos dépenses, une part importante à surveiller.`);
  }
  const unallocated = m.capacity - m.savingsTotal;
  if (unallocated > 0) {
    parts.push(`${eur0.format(unallocated)} de votre capacité d'épargne n'est pas encore affecté à un compte.`);
  }
  return parts.join(' ');
}

function AddIncomeForm({ ownerFilter, profiles, onAdd }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter, profiles));

  function submit() {
    if (!label || !amount) return;
    onAdd({ id: uid(), label, amount, owner });
  }

  return (
    <div className="card" style={{ marginBottom: 16, background: '#FBFAFF' }}>
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input className="inp" style={{ flex: '1 1 160px' }} placeholder="Source (salaire…)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="inp num" style={{ flex: '1 1 140px' }} placeholder="Montant / mois" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn primary" onClick={submit}>Ajouter</button>
      </div>
    </div>
  );
}

function IncomeRow({ item, profiles, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label || '');
  const [amount, setAmount] = useState(item.amount ?? '');
  const [owner, setOwner] = useState(item.owner || 'commun');

  function startEdit() {
    setLabel(item.label || ''); setAmount(item.amount ?? ''); setOwner(item.owner || 'commun');
    setEditing(true);
  }
  function save() {
    onSave({ ...item, label, amount, owner });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={3}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0' }}>
            <input className="inp" style={{ flex: '1 1 160px' }} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Source" />
            <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="inp num" style={{ flex: '0 1 140px' }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant / mois" />
            <button className="btn primary" onClick={save}>Enregistrer</button>
            <button className="btn ghost" onClick={() => setEditing(false)}>Annuler</button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td data-label="Source" style={{ fontWeight: 600 }}>{item.label}</td>
      <td data-label="Montant / mois" className="r amt" style={{ color: 'var(--emerald)' }}>{eur0.format(n(item.amount))}</td>
      <td>
        <div className="rowact">
          <button className="iconbtn" title="Modifier" onClick={startEdit}><Icon name="edit" size={14} /></button>
          <button className="iconbtn danger" title="Supprimer" onClick={() => onDelete(item.id)}><Icon name="trash" size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function AddExpenseForm({ ownerFilter, profiles, onAdd }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Logement');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter, profiles));

  function submit() {
    if (!name || !amount) return;
    onAdd({ id: uid(), name, category, amount, owner });
  }

  return (
    <div className="card" style={{ marginBottom: 16, background: '#FBFAFF' }}>
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input className="inp" style={{ flex: '1 1 160px' }} placeholder="Nom (loyer, Netflix…)" value={name} onChange={(e) => setName(e.target.value)} />
        <select className="inp" style={{ flex: '0 0 160px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {EXPENSE_CATS.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
        </select>
        <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="inp num" style={{ flex: '1 1 140px' }} placeholder="Montant / mois" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn primary" onClick={submit}>Ajouter</button>
      </div>
    </div>
  );
}

function ExpenseRow({ item, profiles, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.name || '');
  const [amount, setAmount] = useState(item.amount ?? '');
  const [category, setCategory] = useState(item.category || 'Logement');
  const [owner, setOwner] = useState(item.owner || 'commun');

  function startEdit() {
    setName(item.name || ''); setAmount(item.amount ?? ''); setCategory(item.category || 'Logement'); setOwner(item.owner || 'commun');
    setEditing(true);
  }
  function save() {
    onSave({ ...item, name, amount, category, owner });
    setEditing(false);
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={4}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0' }}>
            <input className="inp" style={{ flex: '1 1 160px' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom" />
            <select className="inp" style={{ flex: '0 0 150px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
              {EXPENSE_CATS.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
            </select>
            <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="inp num" style={{ flex: '0 1 140px' }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant / mois" />
            <button className="btn primary" onClick={save}>Enregistrer</button>
            <button className="btn ghost" onClick={() => setEditing(false)}>Annuler</button>
          </div>
        </td>
      </tr>
    );
  }
  const ci = catInfo(item.category);
  return (
    <tr>
      <td data-label="Dépense" style={{ fontWeight: 600 }}>{item.name || item.category}</td>
      <td data-label="Catégorie"><span className="pill" style={{ background: ci.color + '1a', color: ci.color }}><span className="dot" style={{ background: ci.color }} />{ci.key}</span></td>
      <td data-label="Montant / mois" className="r amt" style={{ color: 'var(--rose)' }}>{eur0.format(n(item.amount))}</td>
      <td>
        <div className="rowact">
          <button className="iconbtn" title="Modifier" onClick={startEdit}><Icon name="edit" size={14} /></button>
          <button className="iconbtn danger" title="Supprimer" onClick={() => onDelete(item.id)}><Icon name="trash" size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

function AddSavingForm({ accounts, ownerFilter, profiles, onAdd }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter, profiles));

  function submit() {
    if (!accountId || !amount) return;
    onAdd({ id: uid(), accountId, amount, owner });
  }

  return (
    <div className="card" style={{ marginBottom: 16, background: '#FBFAFF' }}>
      <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10 }}>
        <select className="inp" style={{ flex: '1 1 200px' }} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.label || TYPES[a.type]?.label}{a.bank ? ` — ${BANKS[a.bank]?.name || a.bank}` : ''}</option>
          ))}
        </select>
        <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="inp num" style={{ flex: '1 1 140px' }} placeholder="Montant / mois" value={amount} onChange={(e) => setAmount(e.target.value)} />
        <button className="btn primary" onClick={submit}>Ajouter</button>
      </div>
    </div>
  );
}

function SavingRow({ item, accounts, profiles, onSave, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [accountId, setAccountId] = useState(item.accountId || '');
  const [amount, setAmount] = useState(item.amount ?? '');
  const [owner, setOwner] = useState(item.owner || 'commun');

  function startEdit() {
    setAccountId(item.accountId || ''); setAmount(item.amount ?? ''); setOwner(item.owner || 'commun');
    setEditing(true);
  }
  function save() {
    onSave({ ...item, accountId, amount, owner });
    setEditing(false);
  }

  const acc = accounts.find((a) => a.id === item.accountId);

  if (editing) {
    return (
      <tr>
        <td colSpan={3}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', padding: '6px 0' }}>
            <select className="inp" style={{ flex: '1 1 200px' }} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.label || TYPES[a.type]?.label}{a.bank ? ` — ${BANKS[a.bank]?.name || a.bank}` : ''}</option>
              ))}
            </select>
            <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="inp num" style={{ flex: '0 1 140px' }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Montant / mois" />
            <button className="btn primary" onClick={save}>Enregistrer</button>
            <button className="btn ghost" onClick={() => setEditing(false)}>Annuler</button>
          </div>
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td data-label="Destination" style={{ fontWeight: 600 }}>
        <span className="cellbank">
          {acc?.bank && <BankLogo bankKey={acc.bank} size={20} />}
          {acc ? (acc.label || TYPES[acc.type]?.label) : 'Compte supprimé'}
        </span>
      </td>
      <td data-label="Montant / mois" className="r amt" style={{ color: 'var(--violet)' }}>{eur0.format(n(item.amount))}</td>
      <td>
        <div className="rowact">
          <button className="iconbtn" title="Modifier" onClick={startEdit}><Icon name="edit" size={14} /></button>
          <button className="iconbtn danger" title="Supprimer" onClick={() => onDelete(item.id)}><Icon name="trash" size={14} /></button>
        </div>
      </td>
    </tr>
  );
}

export default function Flow({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const incomes = activeSet(state.incomes, ownerFilter);
  const expenses = activeSet(state.expenses, ownerFilter);
  const savings = activeSet(state.savings, ownerFilter);

  const [incFormOpen, setIncFormOpen] = useState(false);
  const [expFormOpen, setExpFormOpen] = useState(false);
  const [savFormOpen, setSavFormOpen] = useState(false);

  function addIncome(rec) { updateState((prev) => ({ ...prev, incomes: [...prev.incomes, rec] })); setIncFormOpen(false); }
  function saveIncome(rec) { updateState((prev) => ({ ...prev, incomes: prev.incomes.map((x) => (x.id === rec.id ? rec : x)) })); }
  function delIncome(id) { updateState((prev) => ({ ...prev, incomes: prev.incomes.filter((x) => x.id !== id) })); }

  function addExpense(rec) { updateState((prev) => ({ ...prev, expenses: [...prev.expenses, rec] })); setExpFormOpen(false); }
  function saveExpense(rec) { updateState((prev) => ({ ...prev, expenses: prev.expenses.map((x) => (x.id === rec.id ? rec : x)) })); }
  function delExpense(id) { updateState((prev) => ({ ...prev, expenses: prev.expenses.filter((x) => x.id !== id) })); }

  function addSaving(rec) { updateState((prev) => ({ ...prev, savings: [...prev.savings, rec] })); setSavFormOpen(false); }
  function saveSaving(rec) { updateState((prev) => ({ ...prev, savings: prev.savings.map((x) => (x.id === rec.id ? rec : x)) })); }
  function delSaving(id) { updateState((prev) => ({ ...prev, savings: prev.savings.filter((x) => x.id !== id) })); }

  const reste = m.capacity - m.savingsTotal;

  const revenueItems = [
    { label: 'Dépenses', val: m.expense, color: '#F43F5E', icon: 'tag' },
    { label: 'Épargne', val: m.savingsTotal, color: '#7C3AED', icon: 'wallet' },
    reste >= 0
      ? { label: 'Disponible', val: reste, color: '#10B981', icon: 'sparkles' }
      : { label: 'Dépassement', val: -reste, color: '#F43F5E', icon: 'sparkles' },
  ];
  const catItems = EXPENSE_CATS.map((c) => ({ ...c, label: c.key, val: m.expByCat[c.key] || 0 })).filter((c) => c.val > 0).sort((a, b) => b.val - a.val);

  return (
    <>
      <div className="row-2">
        <div className="card">
          <h3>Revenus mensuels</h3>
          <Bars items={revenueItems} total={m.income} />
        </div>
        <div className="card">
          <h3>Répartition des dépenses</h3>
          <Bars items={catItems} total={m.expense} />
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Revenus</h3>
          <div className="sp" />
          {!incFormOpen && <button className="btn primary" onClick={() => setIncFormOpen(true)}>+ Ajouter un revenu</button>}
        </div>
        {incFormOpen && <AddIncomeForm ownerFilter={ownerFilter} profiles={state.profiles} onAdd={addIncome} />}
        {incomes.length ? (
          <table className="ledger">
            <thead><tr><th>Source</th><th className="r">Montant / mois</th><th /></tr></thead>
            <tbody>
              {incomes.map((it) => (
                <IncomeRow key={it.id} item={it} profiles={state.profiles} onSave={saveIncome} onDelete={delIncome} />
              ))}
            </tbody>
          </table>
        ) : <div className="empty-note">Aucun revenu pour le moment.</div>}
        <div className="section-total">
          <span className="lbl">Total mensuel</span>
          <span className="amt" style={{ color: 'var(--emerald)' }}>{eur0.format(m.income)}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Dépenses</h3>
          <div className="sp" />
          {!expFormOpen && <button className="btn primary" onClick={() => setExpFormOpen(true)}>+ Ajouter une dépense</button>}
        </div>
        {expFormOpen && <AddExpenseForm ownerFilter={ownerFilter} profiles={state.profiles} onAdd={addExpense} />}
        {expenses.length ? (
          <table className="ledger">
            <thead><tr><th>Dépense</th><th>Catégorie</th><th className="r">Montant / mois</th><th /></tr></thead>
            <tbody>
              {expenses.map((it) => (
                <ExpenseRow key={it.id} item={it} profiles={state.profiles} onSave={saveExpense} onDelete={delExpense} />
              ))}
            </tbody>
          </table>
        ) : <div className="empty-note">Aucune dépense pour le moment.</div>}
        <div className="section-total">
          <span className="lbl">Total mensuel</span>
          <span className="amt" style={{ color: 'var(--rose)' }}>{eur0.format(m.expense)}</span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Épargne (affectation)</h3>
          <div className="sp" />
          {state.accounts.length > 0 && !savFormOpen && <button className="btn primary" onClick={() => setSavFormOpen(true)}>+ Affecter à l'épargne</button>}
        </div>
        {state.accounts.length ? (
          <>
            {savFormOpen && <AddSavingForm accounts={state.accounts} ownerFilter={ownerFilter} profiles={state.profiles} onAdd={addSaving} />}
            {savings.length ? (
              <table className="ledger">
                <thead><tr><th>Destination</th><th className="r">Montant / mois</th><th /></tr></thead>
                <tbody>
                  {savings.map((s) => (
                    <SavingRow key={s.id} item={s} accounts={state.accounts} profiles={state.profiles} onSave={saveSaving} onDelete={delSaving} />
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-note">Affectez le reste de votre revenu à vos comptes d'épargne.</div>}
            <div className="section-total">
              <span className="lbl">Capacité {eur0.format(m.capacity)} · Affecté {eur0.format(m.savingsTotal)}</span>
              <span className="amt" style={{ color: reste >= 0 ? 'var(--emerald)' : 'var(--rose)' }}>
                {reste >= 0 ? `Reste ${eur0.format(reste)}` : `Dépassé de ${eur0.format(-reste)}`}
              </span>
            </div>
          </>
        ) : (
          <div className="empty-note">
            Renseignez d'abord des comptes dans « Épargne & patrimoine » pour y affecter votre épargne.
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <h3>Analyse</h3>
        <p className="hint" style={{ margin: 0 }}>{flowAnalysis(m)}</p>
      </div>
    </>
  );
}
