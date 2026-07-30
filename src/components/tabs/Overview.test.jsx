import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Overview from './Overview';
import { normalizeState, uid } from '../../lib/metrics';

vi.mock('../../context/DataContext', () => ({
  useData: () => ({
    state: normalizeState({
      incomes: [{ id: uid(), label: 'Salaire', amount: 4000, owner: 'commun' }],
      expenses: [{ id: uid(), name: 'Loyer', category: 'Logement', amount: 900, owner: 'commun' }],
      accounts: [{ id: uid(), type: 'livret_a', label: 'Livret A', balance: 10000, owner: 'commun', ratePct: '1.7' }],
      projects: [],
    }),
  }),
}));

describe('Overview', () => {
  it('affiche les KPIs calculés à partir de données réelles', () => {
    render(<Overview ownerFilter="all" />);
    expect(screen.getByText('Patrimoine total')).toBeInTheDocument();
    expect(screen.getAllByText('10 000 €').length).toBeGreaterThan(0); // patrimoine = le livret A
    expect(screen.getByText('4 000 €')).toBeInTheDocument(); // revenu mensuel
  });
});
