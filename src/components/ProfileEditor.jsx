import { useState } from 'react';
import { MAX_PROFILES, makeProfileId, nextProfileColor } from '../lib/metrics';
import Icon from './Icon';

export default function ProfileEditor({ initialProfiles, onSave, onCancel, cancelLabel = 'Annuler', saveLabel = 'Terminer' }) {
  const [rows, setRows] = useState(() =>
    (initialProfiles && initialProfiles.length ? initialProfiles : [{ key: Math.random(), name: '', kind: 'individual' }])
      .map((p) => ({ key: p.id || Math.random(), id: p.id, name: p.name || '', kind: p.kind || 'individual', color: p.color }))
  );

  function addRow() {
    if (rows.length >= MAX_PROFILES) return;
    setRows((prev) => [...prev, { key: Math.random(), name: '', kind: 'individual' }]);
  }
  function removeRow(key) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.key !== key) : prev));
  }
  function updateRow(key, patch) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const validRows = rows.filter((r) => r.name.trim());

  function submit() {
    if (!validRows.length) return;
    const profiles = [];
    validRows.forEach((r) => {
      const id = r.id || makeProfileId(r.name, profiles);
      const color = r.color || nextProfileColor(profiles);
      profiles.push({ id, name: r.name.trim(), kind: r.kind, color });
    });
    onSave(profiles);
  }

  return (
    <div>
      {rows.map((r) => (
        <div key={r.key} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <input className="inp" style={{ flex: '1 1 auto' }} placeholder="Prénom (ex. Alex)"
            value={r.name} onChange={(e) => updateRow(r.key, { name: e.target.value })} />
          <select className="inp" style={{ flex: '0 0 130px' }} value={r.kind} onChange={(e) => updateRow(r.key, { kind: e.target.value })}>
            <option value="individual">Individuel</option>
            <option value="shared">Commun</option>
          </select>
          {rows.length > 1 && (
            <button className="iconbtn danger" title="Retirer" onClick={() => removeRow(r.key)}><Icon name="trash" size={14} /></button>
          )}
        </div>
      ))}
      {rows.length < MAX_PROFILES && (
        <button className="btn soft tiny" type="button" onClick={addRow} style={{ marginBottom: 16 }}>+ Ajouter un profil</button>
      )}
      <p className="hint" style={{ margin: '0 0 14px' }}>{rows.length} / {MAX_PROFILES} profils.</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn primary" disabled={!validRows.length} onClick={submit}>{saveLabel}</button>
        {onCancel && <button className="btn ghost" onClick={onCancel}>{cancelLabel}</button>}
      </div>
    </div>
  );
}
