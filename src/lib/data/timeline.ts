export interface TimelineEntry {
	year: string;
	title: string;
	organization: string;
	description: string;
	type: 'work' | 'education';
}

export const TIMELINE: TimelineEntry[] = [
	{
		year: '2026',
		title: 'Data Scientist (Detail)',
		organization: "U.S. Department of Labor, Chief Data & Analytics Office",
		description:
			'Leading the development of a department-wide data science and analytics platform, a unified, machine-readable data ecosystem for education and labor via RDF and semantic web technologies, and an MCP server to bridge AI systems with public federal labor data, enabling natural-language access to government datasets.',
		type: 'work'
	},
	{
		year: '2018',
		title: 'Staff Data Scientist',
		organization: 'U.S. Department of Labor, Wage & Hour Division',
		description:
			'Architect and deploy production-grade tools across the full data pipeline — from document retrieval systems in Rust (approved for DOL\'s Certified Software List) to constrained optimization models in JuMP.jl for national labor-allocation problems. Design and execute causal inference studies, Monte Carlo performance models, predictive models, time series modeling, and much more.',
		type: 'work'
	},
	{
		year: '2015',
		title: 'M.S. Finance / Economics',
		organization: 'West Texas A&M University',
		description:
			'Summa Cum Laude · GPA 4.0. Focused on econometric methods and quantitative finance.',
		type: 'education'
	},
	{
		year: '2009',
		title: 'B.S. Economics',
		organization: 'University of West Florida',
		description:
			'Cum Laude · GPA 3.6. Undergraduate degree in Economics with a focus on quantitative methods and econometrics.',
		type: 'education'
	}
];
