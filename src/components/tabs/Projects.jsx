import { useState } from 'react';
import { useData } from '../../context/DataContext';
import { computeMetrics, sortedProjects, uid, newOwnerFor, profileInfo } from '../../lib/metrics';
import { eur0, fmtDate, whenLabel, n } from '../../lib/format';
import Icon from '../Icon';
import SwipeRow from '../SwipeRow';

function ProjectForm({ ownerFilter, profiles, editing, onSave, onCancel }) {
  const rec = editing || {};
  const [label, setLabel] = useState(rec.label || '');
  const [kind, setKind] = useState(rec.kind || 'echeance');
  const [amount, setAmount] = useState(rec.amount ?? '');
  const [date, setDate] = useState(rec.date || '');
  const [recur, setRecur] = useState(rec.recur || 'once');
  const [owner, setOwner] = useState(rec.owner || newOwnerFor(ownerFilter, profiles));

  function submit() {
    if (!label || !amount) return;
    const proj = { id: editing ? editing.id : uid(), label, kind, amount, owner };
    if (kind === 'echeance') { proj.date = date; proj.recur = recur; }
    onSave(proj);
  }

  return (
    <div className="card" style={{ marginBottom: 18, background: '#FBFAFF' }}>
      <h3>{editing ? 'Modifier le projet' : 'Ajouter un projet'}</h3>
      <p className="hint">Taxe foncière, achat voiture, bébé…</p>
      <div className="field" style={{ marginBottom: 12 }}>
        <label>Nom du projet / de l'échéance</label>
        <input className="inp" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Taxe foncière, achat voiture, bébé…" />
      </div>
      <div className="two">
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
        <div className="two">
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
          {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn primary" onClick={submit}>{editing ? 'Enregistrer' : 'Ajouter'}</button>
        <button className="btn ghost" onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

export default function Projects({ ownerFilter }) {
  const { state, updateState } = useData();
  const m = computeMetrics(state, ownerFilter);
  const arr = sortedProjects(state, ownerFilter, m.capacity);
  const [formMode, setFormMode] = useState(null); // null | 'new' | projectId

  function saveProject(proj) {
    updateState((prev) => {
      const exists = prev.projects.some((p) => p.id === proj.id);
      return { ...prev, projects: exists ? prev.projects.map((p) => (p.id === proj.id ? proj : p)) : [...prev.projects, proj] };
    });
    setFormMode(null);
  }
  function delProject(id) {
    updateState((prev) => ({ ...prev, projects: prev.projects.filter((p) => p.id !== id) }));
    if (formMode === id) setFormMode(null);
  }

  return (
    <>
      <div className="card">
        <div className="toolbar">
          <h3 style={{ margin: 0 }}>Projets & échéances à venir</h3>
          <div className="sp" />
          {!formMode && <button className="btn primary" onClick={() => setFormMode('new')}>+ Ajouter un projet</button>}
        </div>
        <p className="hint" style={{ margin: '4px 0 14px' }}>
          Un <b>objectif</b> voit sa date estimée selon votre capacité d'épargne ; une <b>échéance</b> a une date fixe (ponctuelle ou récurrente).
        </p>
        {formMode === 'new' && (
          <ProjectForm ownerFilter={ownerFilter} profiles={state.profiles} editing={null} onSave={saveProject} onCancel={() => setFormMode(null)} />
        )}
        {arr.length ? (
          <table className="ledger">
            <thead>
              <tr>
                <th>Projet</th><th>Type</th><th>Détenteur</th><th>Date estimée</th><th className="r">Montant</th><th>Échéance</th><th />
              </tr>
            </thead>
            <tbody>
              {arr.map(({ p, nd }) => {
                if (formMode === p.id) {
                  return (
                    <tr key={p.id}>
                      <td colSpan={7} style={{ padding: 0 }}>
                        <ProjectForm ownerFilter={ownerFilter} profiles={state.profiles} editing={p} onSave={saveProject} onCancel={() => setFormMode(null)} />
                      </td>
                    </tr>
                  );
                }
                const w = whenLabel(nd.date);
                const o = profileInfo(state.profiles, p.owner);
                const kindPill = (
                  <span className="pill sm" style={{ background: p.kind === 'objectif' ? '#EDE9FE' : '#E4F0FE', color: p.kind === 'objectif' ? '#7C3AED' : '#3B82F6' }}>
                    {p.kind === 'objectif' ? 'Objectif' : 'Échéance'}{p.recur && p.recur !== 'once' ? ' · récurrent' : ''}
                  </span>
                );
                return (
                  <tr key={p.id}>
                    <td className="d-cell" style={{ fontWeight: 600 }}>{p.label || 'Projet'}</td>
                    <td className="d-cell">{kindPill}</td>
                    <td className="d-cell">
                      <span className="owner-chip" style={{ background: o.color + '18', color: o.color }}>
                        <span className="dot" style={{ background: o.color }} />{o.name}
                      </span>
                    </td>
                    <td className="d-cell">{(nd.estimated ? '≈ ' : '') + fmtDate(nd.date)}</td>
                    <td className="d-cell r amt">{eur0.format(n(p.amount))}</td>
                    <td className="d-cell" style={{ color: w.color, fontWeight: 600, fontSize: 12.5 }}>{w.txt}</td>
                    <td className="d-cell">
                      <div className="rowact">
                        <button className="iconbtn" title="Modifier" onClick={() => setFormMode(p.id)}><Icon name="edit" size={14} /></button>
                        <button className="iconbtn danger" title="Supprimer" onClick={() => delProject(p.id)}><Icon name="trash" size={14} /></button>
                      </div>
                    </td>
                    <td className="m-cell" colSpan={7}>
                      <SwipeRow onEdit={() => setFormMode(p.id)} onDelete={() => delProject(p.id)}>
                        <div className="rline">
                          <span className="rline-text">{p.label || 'Projet'}</span>
                          <span className="rline-amt">{eur0.format(n(p.amount))}</span>
                        </div>
                        <div className="rline sub">
                          <span className="rline-meta">
                            {kindPill}
                            <span className="owner-chip sm" style={{ background: o.color + '18', color: o.color }}>
                              <span className="dot" style={{ background: o.color }} />{o.name}
                            </span>
                          </span>
                          <span className="rline-when" style={{ color: w.color }}>{w.txt}</span>
                        </div>
                      </SwipeRow>
                    </td>
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
