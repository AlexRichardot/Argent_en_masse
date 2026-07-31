import { useData } from '../../context/DataContext';
import { computeMetrics, profileInfo } from '../../lib/metrics';
import { pct } from '../../lib/format';

function buildRecommendations(m) {
  const recs = [];
  const add = (prio, title, body) => recs.push({ prio, title, body });

  if (m.patrimoine === 0 && m.income === 0) {
    return [{ prio: 3, title: 'Commencez par renseigner vos données', body: "Ajoutez vos revenus, dépenses et comptes. Les recommandations s'ajusteront automatiquement." }];
  }
  if (m.expense > 0) {
    if (m.monthsCovered < 3) {
      add(1, "Renforcer l'épargne de précaution", `Votre épargne disponible couvre environ ${m.monthsCovered.toFixed(1).replace('.', ',')} mois de dépenses. La cible usuelle est de 3 à 6 mois sur des supports liquides et sûrs (Livret A, LDDS).`);
    } else if (m.monthsCovered > 9) {
      add(2, "Déployer l'excédent de liquidités", `Vous détenez environ ${m.monthsCovered.toFixed(0)} mois de dépenses en épargne liquide. Au-delà du matelas de sécurité, ce surplus perd de la valeur face à l'inflation.`);
    }
  }
  if (m.concentration > 0.35 && m.finPatri > 0) {
    add(1, 'Diversifier vos placements financiers', `Hors immobilier, « ${m.biggest.label} » pèse ${pct(m.concentration)} de votre patrimoine financier. Concentrer autant sur une seule ligne cotée est risqué : des cessions partielles régulières lissent le risque.`);
  }
  if (!m.hasType('pea')) {
    add(2, 'Ouvrir un PEA', "Enveloppe de référence pour actions et ETF diversifiés (ex. MSCI World), exonérée d'impôt sur les gains après 5 ans (hors prélèvements sociaux). L'ouvrir prend date fiscalement.");
  }
  if (!m.hasType('assurance_vie') && !m.hasType('fonds_euro')) {
    add(2, 'Ouvrir une assurance-vie multisupport', 'Diversification (fonds euros, UC, SCPI), fiscalité avantageuse après 8 ans, transmission facilitée.');
  }
  if (!m.hasType('per')) {
    add(3, 'Étudier un PER', 'Déduction des versements du revenu imposable, d\'autant plus intéressant que la tranche marginale est élevée ; fonds bloqués jusqu\'à la retraite.');
  }
  if (m.income > 0 && m.rate < 0.1) {
    add(2, "Augmenter votre taux d'épargne", `Votre taux d'épargne est d'environ ${pct(m.rate)}. Viser 15 à 20 % accélère nettement la constitution du patrimoine.`);
  }
  add(3, 'Faire le point avec un CGP indépendant', 'Pour une optimisation calibrée sur votre TMI, votre horizon et vos objectifs, un Conseiller en Gestion de Patrimoine indépendant apporte un regard personnalisé.');

  recs.sort((a, b) => a.prio - b.prio);
  return recs;
}

const PRIO_LABEL = { 1: 'Prioritaire', 2: 'À envisager', 3: 'Bon à savoir' };
const PRIO_COLOR = { 1: 'var(--rose)', 2: 'var(--amber)', 3: 'var(--blue)' };

export default function Reco({ ownerFilter }) {
  const { state } = useData();
  const m = computeMetrics(state, ownerFilter);
  const recs = buildRecommendations(m);

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Votre stratégie, en fonction de vos chiffres</h3>
        <p className="hint" style={{ margin: 0 }}>
          {ownerFilter !== 'all' ? `Vue : ${profileInfo(state.profiles, ownerFilter).name}. ` : ''}
          L'immobilier de résidence n'est pas considéré comme une sur-concentration.
        </p>
      </div>
      {recs.map((r, i) => (
        <div className="rec" key={i}>
          <div className="mk" style={{ background: PRIO_COLOR[r.prio] }} />
          <div className="b">
            <h4>{r.title}</h4>
            <p>{r.body}</p>
          </div>
          <span className={`prio p${r.prio}`}>{PRIO_LABEL[r.prio]}</span>
        </div>
      ))}
      <div className="disclaimer">
        Informations générales et éducatives sur la gestion de patrimoine en France. Ce n'est pas un conseil en
        investissement personnalisé : je ne suis pas conseiller financier. Cours et taux indicatifs ; vérifiez les
        chiffres en vigueur et rapprochez-vous d'un professionnel avant toute décision.
      </div>
    </>
  );
}
