export const SITE_URL = 'https://matthelm.pro/';

export const SKILLS = ['Julia', 'Rust', 'Python', 'TypeScript', 'SQL', 'R', 'HTML / CSS', 'Svelte'];

export const DOMAINS = [
	'Agentic AI (MCP)',
	'Causal Inference',
	'Optimization & Simulation',
	'Labor Economics',
	'Geospatial Analytics',
	'Workforce Forecasting',
	'Statistical Modeling',
	'Regulatory Compliance'
];

export const IDENTITY = {
	name: 'Matt Helm',
	jobTitle: 'Data Scientist',
	employer: {
		name: 'U.S. Department of Labor',
		url: 'https://www.dol.gov/'
	},
	sameAs: ['https://github.com/mthelm85', 'https://discourse.julialang.org/u/mthelm85']
};

const WIKIDATA = 'http://www.wikidata.org/entity/';
const ESCO = 'http://data.europa.eu/esco/';

/**
 * Authoritative identifiers for skills and domains, emitted as schema:sameAs
 * in the structured data. Only exact or near-exact matches belong here — a
 * wrong sameAs asserts a false identity, so labels without a clean match
 * (compound or niche ones) stay plain literals.
 */
export const TERM_IRIS: Record<string, string[]> = {
	Julia: [`${WIKIDATA}Q2613697`],
	Rust: [`${WIKIDATA}Q575650`],
	Python: [`${WIKIDATA}Q28865`, `${ESCO}skill/ccd0a1d9-afda-43d9-b901-96344886e14d`],
	TypeScript: [`${WIKIDATA}Q978185`, `${ESCO}skill/867137fb-ff1b-4ca3-99f3-cb6969aa2c68`],
	SQL: [`${WIKIDATA}Q47607`, `${ESCO}skill/598de5b0-5b58-4ea7-8058-a4bc4d18c742`],
	R: [`${WIKIDATA}Q206904`, `${ESCO}skill/51586df8-1c46-4b47-8583-773cb63bf00b`],
	'Causal Inference': [`${WIKIDATA}Q5054566`],
	'Labor Economics': [`${WIKIDATA}Q28161`],
	'Statistical Modeling': [`${WIKIDATA}Q3284399`],
	'Geospatial Analytics': [`${WIKIDATA}Q1938983`],
	'Regulatory Compliance': [`${WIKIDATA}Q626741`]
};

export const OCCUPATION = {
	name: 'Data Scientist',
	onetSoc: '15-2051.00',
	sameAs: [`${ESCO}occupation/258e46f9-0075-4a2e-adae-1ff0477e0f30`, `${WIKIDATA}Q29169143`]
};
