import { describe, it, expect } from 'vitest';
import { computeMetrics, accVal, normalizeState, blankState, uid } from './metrics';

function stateWith({ incomes = [], expenses = [], accounts = [], projects = [], savings = [] } = {}) {
  return normalizeState({ incomes, expenses, accounts, projects, savings });
}

describe('computeMetrics', () => {
  it('calcule revenu, dépense et capacité', () => {
    const s = stateWith({
      incomes: [{ id: uid(), amount: 4000, owner: 'alex' }],
      expenses: [{ id: uid(), amount: 1500, owner: 'commun' }],
    });
    const m = computeMetrics(s, 'all');
    expect(m.income).toBe(4000);
    expect(m.expense).toBe(1500);
    expect(m.capacity).toBe(2500);
  });

  it('exclut immobilier et retraite du montant disponible', () => {
    const s = stateWith({
      accounts: [
        { id: uid(), type: 'livret_a', balance: 10000, owner: 'commun', ratePct: '1.7' },
        { id: uid(), type: 'immobilier', balance: 300000, mortgage: 150000, shareOwn: 100, owner: 'commun' },
        { id: uid(), type: 'per', balance: 20000, owner: 'alex', ratePct: '3' },
      ],
    });
    const m = computeMetrics(s, 'all');
    expect(m.patrimoine).toBe(10000 + 150000 + 20000);
    expect(m.dispo).toBe(10000); // ni immobilier ni PER
  });

  it('filtre par détenteur, et Commun reste visible chez Alex', () => {
    const s = stateWith({
      incomes: [
        { id: uid(), amount: 1000, owner: 'alex' },
        { id: uid(), amount: 500, owner: 'commun' },
        { id: uid(), amount: 2000, owner: 'lea' },
      ],
    });
    const mAlex = computeMetrics(s, 'alex');
    expect(mAlex.income).toBe(1500); // 1000 (alex) + 500 (commun)
    const mLea = computeMetrics(s, 'lea');
    expect(mLea.income).toBe(2500); // 2000 (lea) + 500 (commun)
  });

  it('ne signale pas une sur-concentration sur un bien immobilier', () => {
    const s = stateWith({
      accounts: [
        { id: uid(), type: 'immobilier', balance: 300000, mortgage: 0, shareOwn: 100, owner: 'commun' },
        { id: uid(), type: 'livret_a', balance: 5000, owner: 'commun', ratePct: '1.7' },
      ],
    });
    const m = computeMetrics(s, 'all');
    // la concentration ne doit se calculer que sur le patrimoine financier (hors immo)
    expect(m.finPatri).toBe(5000);
    expect(m.concentration).toBe(1); // 100% du patrimoine FINANCIER (livret), pas de l'immobilier
  });
});

describe('accVal', () => {
  it('calcule la valeur nette d\'un bien immobilier avec quote-part', () => {
    const a = { type: 'immobilier', balance: 300000, mortgage: 200000, shareOwn: 50, shareDebt: 50 };
    expect(accVal(a)).toBe(300000 * 0.5 - 200000 * 0.5); // 50 000
  });

  it('calcule la valeur d\'un PEA à partir des positions', () => {
    const a = { type: 'pea', positions: [{ shares: 10, price: 100 }, { shares: 5, price: 20 }] };
    expect(accVal(a)).toBe(1100);
  });
});

describe('normalizeState / blankState', () => {
  it('un compte vierge a bien tous les tableaux attendus', () => {
    const s = blankState();
    expect(s.incomes).toEqual([]);
    expect(s.ui.ownerFilter).toBe('all');
  });

  it('migre les anciennes dépenses (label -> category/name)', () => {
    const s = normalizeState({ expenses: [{ id: '1', label: 'Logement', amount: 800 }] });
    expect(s.expenses[0].category).toBe('Logement');
  });
});
