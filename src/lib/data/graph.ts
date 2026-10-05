import { PROJECTS } from './projects';
import { TIMELINE } from './timeline';
import { IDENTITY, SKILLS, DOMAINS, SITE_URL, TERM_IRIS, OCCUPATION } from './identity';

const PERSON_ID = `${SITE_URL}#me`;

const LANGUAGES = new Set(['Julia', 'Rust', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'R']);

/** A skill or domain label, upgraded to a DefinedTerm linked to authoritative
 *  vocabularies (Wikidata, ESCO) when TERM_IRIS has a match. */
function knowledgeTerm(label: string) {
	const sameAs = TERM_IRIS[label];
	return sameAs ? { '@type': 'DefinedTerm', name: label, sameAs } : label;
}

// Fail the build if a mapping outlives a renamed or removed label.
for (const label of Object.keys(TERM_IRIS)) {
	if (!SKILLS.includes(label) && !DOMAINS.includes(label)) {
		throw new Error(`TERM_IRIS has no matching skill or domain: ${label}`);
	}
}

/**
 * Assemble the site's schema.org graph (JSON-LD) from the same data files
 * that render the visible sections, so the two can never drift apart.
 */
export function buildGraph() {
	const person = {
		'@type': 'Person',
		'@id': PERSON_ID,
		name: IDENTITY.name,
		url: SITE_URL,
		jobTitle: IDENTITY.jobTitle,
		worksFor: {
			'@type': 'GovernmentOrganization',
			name: IDENTITY.employer.name,
			url: IDENTITY.employer.url
		},
		sameAs: IDENTITY.sameAs,
		hasOccupation: {
			'@type': 'Occupation',
			name: OCCUPATION.name,
			occupationalCategory: {
				'@type': 'CategoryCode',
				codeValue: OCCUPATION.onetSoc,
				url: `https://www.onetonline.org/link/summary/${OCCUPATION.onetSoc}`,
				inCodeSet: {
					'@type': 'CategoryCodeSet',
					name: 'O*NET-SOC 2019 Taxonomy',
					url: 'https://www.onetcenter.org/taxonomy.html'
				}
			},
			sameAs: OCCUPATION.sameAs
		},
		knowsAbout: [...DOMAINS, ...SKILLS.filter((s) => LANGUAGES.has(s))].map(knowledgeTerm),
		alumniOf: TIMELINE.filter((e) => e.type === 'education').map((e) => ({
			'@type': 'CollegeOrUniversity',
			name: e.organization
		}))
	};

	const website = {
		'@type': 'WebSite',
		'@id': `${SITE_URL}#website`,
		url: SITE_URL,
		name: 'Matt Helm — Data Scientist',
		author: { '@id': PERSON_ID }
	};

	const page = {
		'@type': 'ProfilePage',
		'@id': SITE_URL,
		url: SITE_URL,
		name: 'Matt Helm — Data Scientist',
		isPartOf: { '@id': `${SITE_URL}#website` },
		mainEntity: { '@id': PERSON_ID }
	};

	const projects = {
		'@type': 'ItemList',
		'@id': `${SITE_URL}#projects`,
		name: 'Projects',
		itemListElement: PROJECTS.map((p, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			item: {
				'@type': p.github ? 'SoftwareSourceCode' : 'CreativeWork',
				name: p.title,
				description: p.description,
				keywords: p.tech.join(', '),
				...(p.github
					? {
							codeRepository: p.github,
							...(p.tech.some((t) => LANGUAGES.has(t))
								? { programmingLanguage: p.tech.filter((t) => LANGUAGES.has(t)) }
								: {})
						}
					: {}),
				...(p.link ? { url: p.link } : {}),
				author: { '@id': PERSON_ID }
			}
		}))
	};

	return {
		'@context': 'https://schema.org',
		'@graph': [person, website, page, projects]
	};
}

/** JSON-LD serialized for embedding in a <script> tag ("<" escaped so user
 *  data can never close the tag early). */
export function graphJsonLd(): string {
	return JSON.stringify(buildGraph()).replace(/</g, '\\u003c');
}
