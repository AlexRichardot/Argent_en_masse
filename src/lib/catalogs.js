// Catalogues métier — identiques à la version précédente pour rester compatibles
// avec les données déjà enregistrées dans Supabase (mêmes clés de type, mêmes tickers).

export const TIERS={securise:{label:'Sécurisé',color:'#6366F1'},diversifie:{label:'Diversifié',color:'#F59E0B'},dynamique:{label:'Dynamique',color:'#F43F5E'},immobilier:{label:'Immobilier',color:'#0EA5E9'}};
export const TYPES={
  compte_courant:{label:'Compte courant',tier:'securise',liquid:true,rate:0,dispo:true},
  livret_a:{label:'Livret A',tier:'securise',liquid:true,rate:0.017,dispo:true},
  csl:{label:'Compte sur livret',tier:'securise',liquid:true,rate:0.02,dispo:true},
  ldds:{label:'LDDS',tier:'securise',liquid:true,rate:0.017,dispo:true},
  lep:{label:'LEP',tier:'securise',liquid:true,rate:0.027,dispo:true},
  pel_cel:{label:'PEL / CEL',tier:'securise',liquid:false,rate:0.0225,dispo:true},
  fonds_euro:{label:'Fonds euros (AV)',tier:'securise',liquid:false,rate:0.025,dispo:true},
  assurance_vie:{label:'Assurance-vie multisupport',tier:'diversifie',liquid:false,rate:0.03,dispo:true},
  scpi:{label:'SCPI',tier:'diversifie',liquid:false,rate:0.045,dispo:true},
  per:{label:'PER (retraite)',tier:'diversifie',liquid:false,rate:0.03,dispo:false},
  pee:{label:'Épargne salariale (PEE)',tier:'diversifie',liquid:false,rate:0.02,dispo:true},
  pea:{label:'PEA',tier:'dynamique',liquid:false,rate:0.05,dispo:true},
  cto:{label:'Compte-titres (CTO)',tier:'dynamique',liquid:false,rate:0.05,dispo:true},
  crypto:{label:'Cryptoactifs',tier:'dynamique',liquid:false,rate:0,dispo:true},
  immobilier:{label:'Immobilier (bien)',tier:'immobilier',liquid:false,rate:0,dispo:false},
  autre:{label:'Autre',tier:'diversifie',liquid:false,rate:0,dispo:true}
};
export function isPosType(t){return t==='pea'||t==='cto';}
export const defaultRate=t=>(TYPES[t]&&TYPES[t].rate)||0;
export const ASSET_GROUPS={
  immo:{label:'Immobilier',color:'#0EA5E9',icon:'building'},
  comptes:{label:'Comptes & livrets',color:'#6366F1',icon:'wallet'},
  av:{label:'Assurance-vie / fonds €',color:'#F59E0B',icon:'shield'},
  scpi:{label:'SCPI (pierre-papier)',color:'#F97316',icon:'landmark'},
  titres:{label:'Actions & ETF',color:'#F43F5E',icon:'flow'},
  retraite:{label:'Retraite (PER/PEE)',color:'#8B5CF6',icon:'target'},
  crypto:{label:'Cryptoactifs',color:'#EAB308',icon:'sparkles'},
  autre:{label:'Autre',color:'#94A3B8',icon:'tag'}
};
export function assetGroup(t){if(t==='immobilier')return'immo';if(['compte_courant','livret_a','csl','ldds','lep','pel_cel'].includes(t))return'comptes';if(['fonds_euro','assurance_vie'].includes(t))return'av';if(t==='scpi')return'scpi';if(isPosType(t))return'titres';if(['per','pee'].includes(t))return'retraite';if(t==='crypto')return'crypto';return'autre';}
export const EXPENSE_CATS=[
  {key:'Logement',color:'#6366F1',icon:'home'},{key:'Alimentation',color:'#10B981',icon:'cart'},
  {key:'Transport',color:'#3B82F6',icon:'car'},{key:'Loisirs',color:'#F59E0B',icon:'ticket'},
  {key:'Abonnements',color:'#EC4899',icon:'media'},{key:'Assurances',color:'#14B8A6',icon:'shield'},
  {key:'Santé',color:'#F43F5E',icon:'heart'},{key:'Impôts',color:'#8B5CF6',icon:'landmark'},{key:'Autres',color:'#94A3B8',icon:'tag'}
];
export const catInfo=k=>EXPENSE_CATS.find(c=>c.key===k)||EXPENSE_CATS[EXPENSE_CATS.length-1];
export const BANKS={
  lcl:{name:'LCL',domain:'lcl.fr',color:'#0F6FC6',login:'https://monespace.lcl.fr'},
  boursobank:{name:'BoursoBank',domain:'boursobank.com',color:'#EC0677',login:'https://clients.boursobank.com'},
  bnp:{name:'BNP Paribas',domain:'bnpparibas.fr',color:'#00915A',login:'https://mabanque.bnpparibas'},
  fidelity:{name:'Fidelity',domain:'fidelity.com',color:'#3E8C1F',login:'https://nb.fidelity.com/static/mybenefits/netbenefitslogin/#/login?ccview=logout'},
  morganstanley:{name:'Morgan Stanley',domain:'morganstanley.com',color:'#00263E',login:'https://atwork.morganstanley.com/solium/servlet/userLogin.do'},
  ca:{name:'Crédit Agricole',domain:'credit-agricole.fr',color:'#00794D',login:'https://www.credit-agricole.fr'},
  sg:{name:'Société Générale',domain:'societegenerale.fr',color:'#E60028',login:'https://particuliers.sg.fr'},
  cde:{name:"Caisse d'Épargne",domain:'caisse-epargne.fr',color:'#C4122E',login:'https://www.caisse-epargne.fr/particuliers/acceder-comptes'},
  bp:{name:'Banque Populaire',domain:'banquepopulaire.fr',color:'#005BAA',login:'https://www.banquepopulaire.fr'},
  lbp:{name:'La Banque Postale',domain:'labanquepostale.fr',color:'#003C71',login:'https://www.labanquepostale.fr'},
  cm:{name:'Crédit Mutuel',domain:'creditmutuel.fr',color:'#D0021B',login:'https://www.creditmutuel.fr'},
  cic:{name:'CIC',domain:'cic.fr',color:'#0A5BA9',login:'https://www.cic.fr'},
  hsbc:{name:'HSBC',domain:'hsbc.fr',color:'#DB0011',login:'https://www.hsbc.fr'},
  fortuneo:{name:'Fortuneo',domain:'fortuneo.fr',color:'#009EA0',login:'https://mabanque.fortuneo.fr'},
  hellobank:{name:'Hello bank!',domain:'hellobank.fr',color:'#FF6A13',login:'https://www.hellobank.fr'},
  revolut:{name:'Revolut',domain:'revolut.com',color:'#0666EB',login:'https://app.revolut.com'},
  n26:{name:'N26',domain:'n26.com',color:'#1C9E8B',login:'https://app.n26.com'},
  ing:{name:'ING',domain:'ing.com',color:'#FF6200',login:'https://www.ing.fr'},
  traderepublic:{name:'Trade Republic',domain:'traderepublic.com',color:'#111111',login:'https://app.traderepublic.com'},
  boursedirect:{name:'Bourse Direct',domain:'boursedirect.fr',color:'#E30613',login:'https://www.boursedirect.fr'},
  ibkr:{name:'Interactive Brokers',domain:'interactivebrokers.com',color:'#D91920',login:'https://www.interactivebrokers.com/sso/Login'},
  schwab:{name:'Charles Schwab',domain:'schwab.com',color:'#009BDA',login:'https://www.schwab.com'},
  degiro:{name:'DEGIRO',domain:'degiro.fr',color:'#12406B',login:'https://trader.degiro.nl'},
  saxo:{name:'Saxo',domain:'home.saxo',color:'#003E7E',login:'https://www.saxobank.com'},
  linxea:{name:'Linxea',domain:'linxea.com',color:'#E4002B',login:'https://www.linxea.com'},
  yomoni:{name:'Yomoni',domain:'yomoni.fr',color:'#5A5AF0',login:'https://app.yomoni.fr'},
  autre_b:{name:'Autre',domain:'',color:'#9A97B4',login:''}
};
export const SECURITIES=[
 {t:'MSFT',n:'Microsoft',k:'action',x:'NASDAQ',pea:false},{t:'AAPL',n:'Apple',k:'action',x:'NASDAQ',pea:false},
 {t:'AMZN',n:'Amazon',k:'action',x:'NASDAQ',pea:false},{t:'GOOGL',n:'Alphabet (Google)',k:'action',x:'NASDAQ',pea:false},
 {t:'META',n:'Meta Platforms',k:'action',x:'NASDAQ',pea:false},{t:'NVDA',n:'Nvidia',k:'action',x:'NASDAQ',pea:false},
 {t:'TSLA',n:'Tesla',k:'action',x:'NASDAQ',pea:false},{t:'NFLX',n:'Netflix',k:'action',x:'NASDAQ',pea:false},
 {t:'MC.PA',n:'LVMH',k:'action',x:'Euronext Paris',pea:true},{t:'OR.PA',n:"L'Oréal",k:'action',x:'Euronext Paris',pea:true},
 {t:'TTE.PA',n:'TotalEnergies',k:'action',x:'Euronext Paris',pea:true},{t:'AIR.PA',n:'Airbus',k:'action',x:'Euronext Paris',pea:true},
 {t:'SAN.PA',n:'Sanofi',k:'action',x:'Euronext Paris',pea:true},{t:'AI.PA',n:'Air Liquide',k:'action',x:'Euronext Paris',pea:true},
 {t:'SU.PA',n:'Schneider Electric',k:'action',x:'Euronext Paris',pea:true},{t:'BNP.PA',n:'BNP Paribas',k:'action',x:'Euronext Paris',pea:true},
 {t:'RMS.PA',n:'Hermès',k:'action',x:'Euronext Paris',pea:true},{t:'ASML.AS',n:'ASML',k:'action',x:'Euronext Amsterdam',pea:true},
 {t:'CW8.PA',n:'Amundi MSCI World UCITS',k:'etf',x:'Euronext Paris',pea:true},{t:'EWLD.PA',n:'Amundi PEA MSCI World',k:'etf',x:'Euronext Paris',pea:true},
 {t:'ESE.PA',n:'BNPP Easy S&P 500',k:'etf',x:'Euronext Paris',pea:true},{t:'PE500.PA',n:'Amundi PEA S&P 500',k:'etf',x:'Euronext Paris',pea:true},
 {t:'PUST.PA',n:'Amundi PEA Nasdaq-100',k:'etf',x:'Euronext Paris',pea:true},{t:'CAC.PA',n:'Amundi CAC 40 UCITS',k:'etf',x:'Euronext Paris',pea:true},
 {t:'IWDA.AS',n:'iShares Core MSCI World',k:'etf',x:'Euronext Amsterdam',pea:false},{t:'CSPX.AS',n:'iShares Core S&P 500',k:'etf',x:'Euronext Amsterdam',pea:false}
];

