import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, activeSet, uid, newOwnerFor } from '../../lib/metrics';
import { eur0, pct } from '../../lib/format';
import { EXPENSE_CATS, catInfo } from '../../lib/catalogs';

export default function Flow({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const incomes = activeSet(state.incomes, ownerFilter);
  const expenses = activeSet(state.expenses, ownerFilter);

  const [incLabel, setIncLabel] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [expName, setExpName] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCat, setExpCat] = useState('Logement');

  function addIncome() {
    if (!incLabel || !incAmount) return;
    updateState((prev) => ({
      ...prev,
      incomes: [...prev.incomes, { id: uid(), label: incLabel, amount: incAmount, owner: newOwnerFor(ownerFilter) }],
    }));
    setIncLabel(''); setIncAmount('');
  }
  function addExpense() {
    if (!expName || !expAmount) return;
    updateState((prev) => ({
      ...prev,
      expenses: [...prev.expenses, { id: uid(), name: expName, category: expCat, amount: expAmount, owner: newOwnerFor(ownerFilter) }],
    }));
    setExpName(''); setExpAmount('');
  }
  function delIncome(id) { updateState((prev) => ({ ...prev, incomes: prev.incomes.filter((x) => x.id !== id) })); }
  function delExpense(id) { updateState((prev) => ({ ...prev, expenses: prev.expenses.filter((x) => x.id !== id) })); }

  return (
    <>
      <div className="card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Revenus</h3>
        </div>
        <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 16 }}>
          <input className="inp" placeholder="Source (salaire…)" value={incLabel} onChange={(e) => setIncLabel(e.target.value)} />
          <input className="inp num" placeholder="Montant / mois" value={incAmount} onChange={(e) => setIncAmount(e.target.value)} />
          <button className="btn primary" onClick={addIncome}>Ajouter</button>
        </div>
        {incomes.length ? (
          <table className="ledger">
            <thead><tr><th>Source</th><th className="r">Montant / mois</th><th /></tr></thead>
            <tbody>
              {incomes.map((it) => (
                <tr key={it.id}>
                  <td style={{ fontWeight: 600 }}>{it.label}</td>
                  <td className="r amt" style={{ color: 'var(--emerald)' }}>{eur0.format(it.amount)}</td>
                  <td><div className="rowact"><button className="iconbtn danger" onClick={() => delIncome(it.id)}>×</button></div></td>
                </tr>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, marginBottom: 16 }}>
          <input className="inp" placeholder="Nom (loyer, Netflix…)" value={expName} onChange={(e) => setExpName(e.target.value)} />
          <select className="inp" value={expCat} onChange={(e) => setExpCat(e.target.value)}>
            {EXPENSE_CATS.map((c) => <option key={c.key} value={c.key}>{c.key}</option>)}
          </select>
          <input className="inp num" placeholder="Montant / mois" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} />
          <button className="btn primary" onClick={addExpense}>Ajouter</button>
        </div>
        {expenses.length ? (
          <table className="ledger">
            <thead><tr><th>Dépense</th><th>Catégorie</th><th className="r">Montant / mois</th><th /></tr></thead>
            <tbody>
              {expenses.map((it) => {
                const ci = catInfo(it.category);
                return (
                  <tr key={it.id}>
                    <td style={{ fontWeight: 600 }}>{it.name || it.category}</td>
                    <td><span className="pill" style={{ background: ci.color + '1a', color: ci.color }}><span className="dot" style={{ background: ci.color }} />{ci.key}</span></td>
                    <td className="r amt" style={{ color: 'var(--rose)' }}>{eur0.format(it.amount)}</td>
                    <td><div className="rowact"><button className="iconbtn danger" onClick={() => delExpense(it.id)}>×</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : <div className="empty-note">Aucune dépense pour le moment.</div>}
        <div className="section-total">
          <span className="lbl">Total mensuel</span>
          <span className="amt" style={{ color: 'var(--rose)' }}>{eur0.format(m.expense)}</span>
        </div>
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
