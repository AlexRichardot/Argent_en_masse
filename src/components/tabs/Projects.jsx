import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, sortedProjects, uid, newOwnerFor } from '../../lib/metrics';
import { eur0, fmtDate, whenLabel, n } from '../../lib/format';
import { OWNERS } from '../../lib/catalogs';

function ProjectForm({ ownerFilter, editing, onSave, onCancel }) {
  const rec = editing || {};
  const [label, setLabel] = useState(rec.label || '');
  const [kind, setKind] = useState(rec.kind || 'echeance');
  const [amount, setAmount] = useState(rec.amount ?? '');
  const [date, setDate] = useState(rec.date || '');
  const [recur, setRecur] = useState(rec.recur || 'once');
  const [owner, setOwner] = useState(rec.owner || newOwnerFor(ownerFilter));

  function submit() {
    if (!label || !amount) return;
    const proj = { id: editing ? editing.id : uid(), label, kind, amount, owner };
    if (kind === 'echeance') { proj.date = date; proj.recur = recur; }
    onSave(proj);
    if (!editing) { setLabel(''); setAmount(''); setDate(''); }
  }

  return (
    <div className="card" style={{ marginBottom: 18 }}>
      <h3>{editing ? 'Modifier le projet' : 'Ajouter un projet'}</h3>
      <p className="hint">Taxe foncière, achat voiture, bébé…</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Nom du projet / de l'échéance</label>
        <input className="inp" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Taxe foncière, achat voiture, bébé…" />
      </div>
      <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        <div className="field">
          <label>Type</label>
          <select className="inp" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="echeance">Échéance (date connue)</option>
            <option value="objectif">Objectif d'épargne (date estimée)</option>
          </select>
        </div>
        <div className="field">
          <label>Montant</label>
          <div className="suffix"><input className="inp num" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" /><span className="u">€</span></div>
        </div>
      </div>
      {kind === 'echeance' ? (
        <div className="two" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div className="field">
            <label>Date</label>
            <input className="inp" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Récurrence</label>
            <select className="inp" value={recur} onChange={(e) => setRecur(e.target.value)}>
              <option value="once">Ponctuelle</option>
              <option value="monthly">Mensuelle</option>
              <option value="quarterly">Trimestrielle</option>
              <option value="yearly">Annuelle</option>
            </select>
          </div>
        </div>
      ) : (
        <p className="hint" style={{ margin: '0 0 12px' }}>La date sera estimée selon votre capacité d'épargne mensuelle.</p>
      )}
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Détenteur</label>
        <select className="inp" value={owner} onChange={(e) => setOwner(e.target.value)}>
          {Object.entries(OWNERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn primary" onClick={submit}>{editing ? 'Enregistrer' : 'Ajouter'}</button>
        {editing && <button className="btn ghost" onClick={onCancel}>Annuler</button>}
      </div>
    </div>
  );
}

export default function Projects({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const arr = sortedProjects(state, ownerFilter, m.capacity);
  const [editingId, setEditingId] = useState(null);

  function saveProject(proj) {
    updateState((prev) => {
      const exists = prev.projects.some((p) => p.id === proj.id);
      return { ...prev, projects: exists ? prev.projects.map((p) => (p.id === proj.id ? proj : p)) : [...prev.projects, proj] };
    });
    setEditingId(null);
  }
  function delProject(id) {
    updateState((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
    if (editingId === id) setEditingId(null);
  }

  const editingRecord = editingId ? arr.find((x) => x.p.id === editingId)?.p : null;

  return (
    <>
      <ProjectForm key={editingId || 'new'} ownerFilter={ownerFilter} editing={editingRecord}
        onSave={saveProject} onCancel={() => setEditingId(null)} />
      <div className="card">
        <div className="toolbar"><h3 style={{ margin: 0 }}>Projets & échéances à venir</h3></div>
        <p className="hint" style={{ margin: '4px 0 14px' }}>
          Cliquez une ligne pour la modifier. Un <b>objectif</b> voit sa date estimée selon votre capacité d'épargne ; une <b>échéance</b> a une date fixe (ponctuelle ou récurrente).
        </p>
        {arr.length ? (
          <table className="ledger">
            <thead>
              <tr>
                <th>Projet</th><th>Type</th><th>Détenteur</th><th>Date estimée</th><th className="r">Montant</th><th>Échéance</th><th />
              </tr>
            </thead>
            <tbody>
              {arr.map(({ p, nd }) => {
                const w = whenLabel(nd.date);
                const o = OWNERS[p.owner] || OWNERS.commun;
                return (
                  <tr key={p.id} className="clickable" onClick={() => setEditingId(p.id)}>
                    <td data-label="Projet" style={{ fontWeight: 600 }}>{p.label || 'Projet'}</td>
                    <td data-label="Type">
                      <span className="pill" style={{ background: p.kind === 'objectif' ? '#EDE9FE' : '#E4F0FE', color: p.kind === 'objectif' ? '#7C3AED' : '#3B82F6' }}>
                        {p.kind === 'objectif' ? 'Objectif' : 'Échéance'}{p.recur && p.recur !== 'once' ? ' · récurrent' : ''}
                      </span>
                    </td>
                    <td data-label="Détenteur">
                      <span className="owner-chip" style={{ background: o.color + '18', color: o.color }}>
                        <span className="dot" style={{ background: o.color }} />{o.label}
                      </span>
                    </td>
                    <td data-label="Date estimée">{(nd.estimated ? '≈ ' : '') + fmtDate(nd.date)}</td>
                    <td data-label="Montant" className="r amt">{eur0.format(n(p.amount))}</td>
                    <td data-label="Échéance" style={{ color: w.color, fontWeight: 600, fontSize: 12.5 }}>{w.txt}</td>
                    <td><div className="rowact"><button className="iconbtn danger" onClick={(e) => { e.stopPropagation(); delProject(p.id); }}>×</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-note">
            Aucun projet. Ajoutez une échéance (impôts, taxe foncière, charges de copro…) ou un objectif d'épargne (voiture, travaux, bébé…).
          </div>
        )}
      </div>
    </>
  );
}
