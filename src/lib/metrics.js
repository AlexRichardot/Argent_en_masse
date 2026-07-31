import { TYPES, TIERS, ASSET_GROUPS, EXPENSE_CATS, isPosType, assetGroup, defaultRate } from './catalogs';
import { n } from './format';

export const uid = () => Math.random().toString(36).slice(2, 9);

export const MAX_PROFILES = 6;
export const PROFILE_COLORS = ['#06B6D4', '#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#3B82F6'];

const ACCENTS = { à: 'a', â: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', ë: 'e', î: 'i', ï: 'i', ô: 'o', ö: 'o', ù: 'u', û: 'u', ü: 'u', ç: 'c', ñ: 'n' };

function slugify(name) {
  const stripped = String(name).trim().toLowerCase().split('').map((ch) => ACCENTS[ch] || ch).join('');
  return stripped.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'profil';
}

export function makeProfileId(name, existingProfiles) {
  const base = slugify(name);
  let id = base;
  let n = 2;
  while ((existingProfiles || []).some((p) => p.id === id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

export function nextProfileColor(existingProfiles) {
  const used = (existingProfiles || []).length;
  return PROFILE_COLORS[used % PROFILE_COLORS.length];
}

const FALLBACK_PROFILE = { id: '', name: '—', kind: 'shared', color: '#9A97B4' };
export function profileInfo(profiles, id) {
  return (profiles || []).find((p) => p.id === id) || FALLBACK_PROFILE;
}

export const blankState = () => ({
  incomes: [],
  expenses: [],
  accounts: [],
  projects: [],
  savings: [],
  profiles: [],
  ui: { ownerFilter: 'all', sortAcc: 'val', sortDetail: 'val', sortProj: 'date', sortInc: 'amount', sortExp: 'amount' },
});

// Migrations : garantit la compatibilité avec les données déjà enregistrées
// (comptes/dépenses créés avec d'anciennes versions du schéma).
export function normalizeState(raw) {
  const state = raw && typeof raw === 'object' ? { ...raw } : blankState();
  ['incomes', 'expenses', 'accounts', 'projects', 'savings', 'profiles'].forEach((k) => {
    if (!Array.isArray(state[k])) state[k] = [];
  });
  if (!state.ui) state.ui = {};
  const du = blankState().ui;
  Object.keys(du).forEach((k) => {
    if (state.ui[k] === undefined) state.ui[k] = du[k];
  });
  state.accounts = state.accounts.map((a) => {
    const acc = { ...a };
    if (acc.bank === undefined) acc.bank = '';
    if (acc.owner === undefined) acc.owner = 'commun';
    if (isPosType(acc.type) && !Array.isArray(acc.positions)) acc.positions = [];
    if (acc.ratePct === undefined) acc.ratePct = String((acc.rate ?? defaultRate(acc.type)) * 100);
    delete acc.rate;
    return acc;
  });
  const catKeys = EXPENSE_CATS.map((c) => c.key);
  state.expenses = state.expenses.map((e) => {
    const exp = { ...e };
    if (exp.owner === undefined) exp.owner = 'commun';
    if (exp.category === undefined) {
      exp.category = catKeys.includes(exp.label) ? exp.label : 'Autres';
      exp.name = exp.name || (catKeys.includes(exp.label) ? '' : exp.label || '');
    }
    if (exp.name === undefined) exp.name = '';
    return exp;
  });
  state.incomes = state.incomes.map((i) => ({ owner: 'commun', ...i }));
  state.savings = state.savings.map((s) => ({ owner: 'commun', ...s }));
  return state;
}

const isSharedId = (profiles, id) => (profiles || []).some((p) => p.id === id && p.kind === 'shared');

export function matchOwner(item, ownerFilter, profiles) {
  const o = item.owner;
  if (ownerFilter === 'all') return true;
  if (isSharedId(profiles, ownerFilter)) return o === ownerFilter;
  return o === ownerFilter || isSharedId(profiles, o);
}
export const activeSet = (arr, ownerFilter, profiles) => arr.filter((x) => matchOwner(x, ownerFilter, profiles));
export function newOwnerFor(ownerFilter, profiles) {
  if (ownerFilter !== 'all') return ownerFilter;
  const shared = (profiles || []).find((p) => p.kind === 'shared');
  if (shared) return shared.id;
  return profiles && profiles[0] ? profiles[0].id : '';
}

export const posValue = (a) => (a.positions || []).reduce((s, p) => s + n(p.shares) * n(p.price), 0);

export function accVal(a) {
  if (a.type === 'immobilier') {
    const own = (a.shareOwn != null ? n(a.shareOwn) : 100) / 100;
    const dsh = (a.shareDebt != null ? n(a.shareDebt) : a.shareOwn != null ? n(a.shareOwn) : 100) / 100;
    return n(a.balance) * own - n(a.mortgage) * dsh;
  }
  if (isPosType(a.type)) return posValue(a);
  return n(a.balance);
}
export const acctRate = (a) => n(a.ratePct) / 100;
export const classOf = (a) => {
  if (a.type === 'immobilier') return 'immobilier';
  if (isPosType(a.type)) return 'titres';
  return (TYPES[a.type] || {}).tier;
};

export function computeMetrics(state, ownerFilter) {
  const inc = activeSet(state.incomes, ownerFilter, state.profiles);
  const exp = activeSet(state.expenses, ownerFilter, state.profiles);
  const accs = activeSet(state.accounts, ownerFilter, state.profiles);
  const sav = activeSet(state.savings, ownerFilter, state.profiles);

  const income = inc.reduce((s, i) => s + n(i.amount), 0);
  const expense = exp.reduce((s, e) => s + n(e.amount), 0);
  const capacity = income - expense;
  const rate = income > 0 ? capacity / income : 0;

  let patrimoine = 0;
  let dispo = 0;
  const classTot = { securise: 0, diversifie: 0, dynamique: 0, immobilier: 0 };
  const assetTot = {};
  Object.keys(ASSET_GROUPS).forEach((k) => (assetTot[k] = 0));

  accs.forEach((a) => {
    const v = accVal(a);
    patrimoine += v;
    classTot[(TYPES[a.type] || {}).tier || 'diversifie'] += v;
    assetTot[assetGroup(a.type)] += v;
    if ((TYPES[a.type] || {}).dispo !== false) dispo += v;
  });

  const precaution = accs.filter((a) => (TYPES[a.type] || {}).liquid).reduce((s, a) => s + accVal(a), 0);
  const monthsCovered = expense > 0 ? precaution / expense : precaution > 0 ? Infinity : 0;

  let biggest = { label: '', val: 0 };
  let finPatri = 0;
  accs.forEach((a) => {
    if (a.type === 'immobilier') return;
    finPatri += accVal(a);
    if (isPosType(a.type)) {
      (a.positions || []).forEach((p) => {
        const v = n(p.shares) * n(p.price);
        if (v > biggest.val) biggest = { label: p.name || p.ticker, val: v };
      });
    } else {
      const v = accVal(a);
      if (v > biggest.val) biggest = { label: a.label || TYPES[a.type]?.label, val: v };
    }
  });
  const concentration = finPatri > 0 ? biggest.val / finPatri : 0;
  const hasType = (t) => accs.some((a) => a.type === t);
  const yieldTotal = accs.reduce((s, a) => s + (a.type === 'immobilier' ? 0 : accVal(a) * acctRate(a)), 0);

  const expByCat = {};
  EXPENSE_CATS.forEach((c) => (expByCat[c.key] = 0));
  exp.forEach((e) => {
    const c = e.category && expByCat[e.category] !== undefined ? e.category : 'Autres';
    expByCat[c] += n(e.amount);
  });

  const savingsTotal = sav.reduce((s, x) => s + n(x.amount), 0);

  return {
    income, expense, capacity, rate, patrimoine, dispo, classTot, assetTot,
    precaution, monthsCovered, biggest, concentration, finPatri, hasType,
    yieldTotal, expByCat, savingsTotal,
  };
}

export function monthsToGoal(amount, capacity) {
  if (amount <= 0) return 0;
  if (capacity <= 0) return Infinity;
  return Math.ceil(amount / capacity);
}

export function projNextDate(p, capacity) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (p.kind === 'objectif') {
    const mo = monthsToGoal(n(p.amount), capacity);
    if (!isFinite(mo)) return { date: null, estimated: true };
    const d = new Date(today);
    d.setMonth(d.getMonth() + mo);
    return { date: d, estimated: true };
  }
  if (!p.date) return { date: null, estimated: false };
  let d = new Date(p.date + 'T00:00:00');
  const anchor = new Date(p.date + 'T00:00:00');
  if (p.recur && p.recur !== 'once') {
    if (p.recur === 'yearly') {
      d = new Date(today.getFullYear(), anchor.getMonth(), Math.min(anchor.getDate(), 28));
      if (d < today) d.setFullYear(d.getFullYear() + 1);
    } else if (p.recur === 'monthly') {
      d = new Date(today.getFullYear(), today.getMonth(), Math.min(anchor.getDate(), 28));
      if (d < today) d.setMonth(d.getMonth() + 1);
    } else if (p.recur === 'quarterly') {
      d = new Date(anchor);
      while (d < today) d.setMonth(d.getMonth() + 3);
    }
  }
  return { date: d, estimated: false };
}

export function sortedProjects(state, ownerFilter, capacity) {
  const arr = activeSet(state.projects, ownerFilter, state.profiles).map((p) => ({ p, nd: projNextDate(p, capacity) }));
  const s = state.ui.sortProj;
  arr.sort((a, b) => {
    if (s === 'amount') return n(b.p.amount) - n(a.p.amount);
    if (s === 'label') return (a.p.label || '').localeCompare(b.p.label || '');
    const da = a.nd.date ? a.nd.date.getTime() : Infinity;
    const db = b.nd.date ? b.nd.date.getTime() : Infinity;
    return da - db;
  });
  return arr;
}

export function sortedAccounts(state, ownerFilter, key) {
  const arr = activeSet(state.accounts, ownerFilter, state.profiles).slice();
  const bankLabel = (k) => k || '';
  if (key === 'bank') arr.sort((a, b) => bankLabel(a.bank).localeCompare(bankLabel(b.bank)) || accVal(b) - accVal(a));
  else if (key === 'type') arr.sort((a, b) => (TYPES[a.type]?.label || '').localeCompare(TYPES[b.type]?.label || ''));
  else if (key === 'class') arr.sort((a, b) => classOf(a).localeCompare(classOf(b)) || accVal(b) - accVal(a));
  else if (key === 'label') arr.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
  else arr.sort((a, b) => accVal(b) - accVal(a));
  return arr;
}
