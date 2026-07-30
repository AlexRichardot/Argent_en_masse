import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, activeSet, uid, newOwnerFor } from '../../lib/metrics';
import { eur0, pct, n } from '../../lib/format';
import { EXPENSE_CATS, catInfo, OWNERS, TYPES, BANKS } from '../../lib/catalogs';
import BankLogo from '../BankLogo';

function AddIncomeForm({ ownerFilter, onAdd }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter));

  function submit() {
    if (!label || !amount) return;
    onAdd({ id: uid(), label, amount, owner });
    setLabel(''); setAmount('');
  }

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
      <input className="inp" style={{ flex: '1 1 160px' }} placeholder="Source (salaire…)" value={label} onChange={(e) => setLabel(e.target.value)} />
      <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
        {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <input className="inp num" style={{ flex: '1 1 140px' }} placeholder="Montant / mois" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn primary" onClick={submit}>Ajouter</button>
    </div>
  );
}

function IncomeRow({ item, onSave, onDelete }) {
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
              {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
    <tr className="clickable" onClick={startEdit}>
      <td data-label="Source" style={{ fontWeight: 600 }}>{item.label}</td>
      <td data-label="Montant / mois" className="r amt" style={{ color: 'var(--emerald)' }}>{eur0.format(n(item.amount))}</td>
      <td><div className="rowact"><button className="iconbtn danger" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>×</button></div></td>
    </tr>
  );
}

function AddExpenseForm({ ownerFilter, onAdd }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Logement');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter));

  function submit() {
    if (!name || !amount) return;
    onAdd({ id: uid(), name, category, amount, owner });
    setName(''); setAmount('');
  }

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
      <input className="inp" style={{ flex: '1 1 160px' }} placeholder="Nom (loyer, Netflix…)" value={name} onChange={(e) => setName(e.target.value)} />
      <select className="inp" style={{ flex: '0 0 160px' }} value={category} onChange={(e) => setCategory(e.target.value)}>
        {EXPENSE_CATS.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
      </select>
      <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
        {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <input className="inp num" style={{ flex: '1 1 140px' }} placeholder="Montant / mois" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn primary" onClick={submit}>Ajouter</button>
    </div>
  );
}

function ExpenseRow({ item, onSave, onDelete }) {
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
              {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
    <tr className="clickable" onClick={startEdit}>
      <td data-label="Dépense" style={{ fontWeight: 600 }}>{item.name || item.category}</td>
      <td data-label="Catégorie"><span className="pill" style={{ background: ci.color + '1a', color: ci.color }}><span className="dot" style={{ background: ci.color }} />{ci.key}</span></td>
      <td data-label="Montant / mois" className="r amt" style={{ color: 'var(--rose)' }}>{eur0.format(n(item.amount))}</td>
      <td><div className="rowact"><button className="iconbtn danger" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>×</button></div></td>
    </tr>
  );
}

function AddSavingForm({ accounts, ownerFilter, onAdd }) {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [owner, setOwner] = useState(newOwnerFor(ownerFilter));

  function submit() {
    if (!accountId || !amount) return;
    onAdd({ id: uid(), accountId, amount, owner });
    setAmount('');
  }

  return (
    <div className="toolbar" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
      <select className="inp" style={{ flex: '1 1 200px' }} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>{a.label || TYPES[a.type]?.label}{a.bank ? ` — ${BANKS[a.bank]?.name || a.bank}` : ''}</option>
        ))}
      </select>
      <select className="inp" style={{ flex: '0 0 120px' }} value={owner} onChange={(e) => setOwner(e.target.value)}>
        {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <input className="inp num" style={{ flex: '1 1 140px' }} placeholder="Montant / mois" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="btn primary" onClick={submit}>Ajouter</button>
    </div>
  );
}

function SavingRow({ item, accounts, onSave, onDelete }) {
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
              {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
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
    <tr className="clickable" onClick={startEdit}>
      <td data-label="Destination" style={{ fontWeight: 600 }}>
        <span className="cellbank">
          {acc?.bank && <BankLogo bankKey={acc.bank} size={20} />}
          {acc ? (acc.label || TYPES[acc.type]?.label) : 'Compte supprimé'}
        </span>
      </td>
      <td data-label="Montant / mois" className="r amt" style={{ color: 'var(--violet)' }}>{eur0.format(n(item.amount))}</td>
      <td><div className="rowact"><button className="iconbtn danger" onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>×</button></div></td>
    </tr>
  );
}

export default function Flow({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const incomes = activeSet(state.incomes, ownerFilter);
  const expenses = activeSet(state.expenses, ownerFilter);
  const savings = activeSet(state.savings, ownerFilter);

  function addIncome(rec) { updateState((prev) => ({ ...prev, incomes: [...prev.incomes, rec] })); }
  function saveIncome(rec) { updateState((prev) => ({ ...prev, incomes: prev.incomes.map((x) => (x.id === rec.id ? rec : x)) })); }
  function delIncome(id) { updateState((prev) => ({ ...prev, incomes: prev.incomes.filter((x) => x.id !== id) })); }

  function addExpense(rec) { updateState((prev) => ({ ...prev, expenses: [...prev.expenses, rec] })); }
  function saveExpense(rec) { updateState((prev) => ({ ...prev, expenses: prev.expenses.map((x) => (x.id === rec.id ? rec : x)) })); }
  function delExpense(id) { updateState((prev) => ({ ...prev, expenses: prev.expenses.filter((x) => x.id !== id) })); }

  function addSaving(rec) { updateState((prev) => ({ ...prev, savings: [...prev.savings, rec] })); }
  function saveSaving(rec) { updateState((prev) => ({ ...prev, savings: prev.savings.map((x) => (x.id === rec.id ? rec : x)) })); }
  function delSaving(id) { updateState((prev) => ({ ...prev, savings: prev.savings.filter((x) => x.id !== id) })); }

  const reste = m.capacity - m.savingsTotal;

  return (
    <>
      <div className="card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Revenus</h3>
        </div>
        <AddIncomeForm ownerFilter={ownerFilter} onAdd={addIncome} />
        {incomes.length ? (
          <table className="ledger">
            <thead><tr><th>Source</th><th className="r">Montant / mois</th><th /></tr></thead>
            <tbody>
              {incomes.map((it) => (
                <IncomeRow key={it.id} item={it} onSave={saveIncome} onDelete={delIncome} />
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
        <div className="toolbar"><h3 style={{ margin: 0 }}>Dépenses</h3></div>
        <AddExpenseForm ownerFilter={ownerFilter} onAdd={addExpense} />
        {expenses.length ? (
          <table className="ledger">
            <thead><tr><th>Dépense</th><th>Catégorie</th><th className="r">Montant / mois</th><th /></tr></thead>
            <tbody>
              {expenses.map((it) => (
                <ExpenseRow key={it.id} item={it} onSave={saveExpense} onDelete={delExpense} />
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
        <div className="toolbar"><h3 style={{ margin: 0 }}>Épargne (affectation)</h3></div>
        <p className="hint" style={{ margin: '4px 0 14px' }}>Répartissez le reste de votre revenu vers vos comptes d'épargne.</p>
        {state.accounts.length ? (
          <>
            <AddSavingForm accounts={state.accounts} ownerFilter={ownerFilter} onAdd={addSaving} />
            {savings.length ? (
              <table className="ledger">
                <thead><tr><th>Destination</th><th className="r">Montant / mois</th><th /></tr></thead>
                <tbody>
                  {savings.map((s) => (
                    <SavingRow key={s.id} item={s} accounts={state.accounts} onSave={saveSaving} onDelete={delSaving} />
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

      <div className="card summary-card" style={{ marginTop: 18 }}>
        <div className="blk">
          <div className="k">Capacité d'épargne</div>
          <div className="v" style={{ color: m.capacity >= 0 ? 'var(--violet)' : 'var(--rose)' }}>
            {eur0.format(m.capacity)} <span style={{ fontSize: 15, color: 'var(--muted)' }}>/ mois</span>
          </div>
        </div>
        <div className="blk" style={{ textAlign: 'right' }}>
          <div className="k">Taux d'épargne</div>
          <div className="v">{m.income > 0 ? pct(m.rate) : '—'}</div>
        </div>
      </div>
    </>
  );
}
