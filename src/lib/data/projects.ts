export interface Project {
	title: string;
	description: string;
	tech: string[];
	link?: string;
	github?: string;
}

export const PROJECTS: Project[] = [
	{
		title: 'PlutoDataTable.jl',
		description:
			'An interactive, sortable data-table component for the Pluto.jl reactive notebook ecosystem.',
		tech: ['Julia', 'Pluto.jl', 'HypertextLiteral.jl'],
		github: 'https://github.com/mthelm85/PlutoDataTable.jl'
	},
	{
		title: 'CheckMate.jl',
		description:
			'A robust data valiA lightweight data validation framework for Julia, designed to help you define, run, and manage data quality checks on tabular data.',
		tech: ['Julia', 'Data Validation', 'ETL'],
		github: 'https://github.com/mthelm85/CheckMate.jl'
	},
	{
		title: 'The Data Dispatch',
		description: 'A blog focusing on interesting and unique data sources.',
		tech: ['Vue.js', 'Nuxt.js', 'Julia', 'Chart.js'],
		link: 'https://www.thedatadispatch.com'
	},
	{
		title: 'Bayesian Regression With an Ordered Categorical Predictor Variable',
		description:
			'Bayesian regression analysis of the incremental effects of educational attainment on income.',
		tech: ['Julia', 'Turing.jl'],
		link: 'https://forem.julialang.org/mthelm85/bayesian-regression-with-an-ordered-categorical-predictor-variable-ejc'
	},
	{
		title: 'Kernel Density Estimation',
		description: 'A brief primer on Kernel Density Estimation.',
		tech: ['JavaScript', 'Observable'],
		link: 'https://observablehq.com/d/bf068f6a5c4da2ce'
	},
	{
		title: 'Homeward Bound',
		description:
			'A physics-based puzzle game challenging players to navigate a spacecraft through complex gravitational fields using realistic n-body gravitational simulations.',
		tech: ['Phaser.js', 'Vue.js', 'JavaScript'],
		link: 'https://homeward-bound-game.vercel.app/'
	},
	{
		title: 'Optimal Meatballs',
		description:
			'Learn about circle packing by optimizing the size of meatballs! A featured notebook on plutojl.org.',
		tech: ['Julia', 'Pluto.jl', 'Optimization'],
		link: 'https://featured.plutojl.org/puzzles-games/optimal%20meatballs'
	},
	{
		title: 'County Clustering',
		description:
			'Clusters U.S. counties within a state according to industrial similarities using k-medoids and fuzzy c-means clustering algorithms.',
		tech: ['Julia', 'Pluto.jl', 'Clustering'],
		link: 'https://www.matthelm.pro/clusteringStatic.html'
	},
	{
		title: 'Calculus',
		description:
			'An interactive notebook that clearly demonstrates the fundamental concepts of calculus. Learn and understand limits, continuity, derivatives and integrals in 30 minutes or less.',
		tech: ['Julia', 'Pluto.jl', 'Education'],
		link: 'https://www.matthelm.pro/calculusStatic.html'
	},
	{
		title: 'Linear Algebra Part I',
		description: 'Learn about vectors and scalars.',
		tech: ['Julia', 'Pluto.jl', 'Education'],
		link: 'https://www.matthelm.pro/linAlgStatic.html'
	},
	{
		title: 'Linear Algebra Part II',
		description: 'Learn about matrices.',
		tech: ['Julia', 'Pluto.jl', 'Education'],
		link: 'https://www.matthelm.pro/linAlg2Static.html'
	},
	{
		title: 'The Travelling Salesman Game',
		description:
			'The travelling salesman problem, as an arcade game. Each level is generated randomly and then solved with simulated annealing.',
		tech: ['JavaScript', 'Phaser.js', 'Simulated Annealing'],
		link: 'https://mthelm85.github.io/travelling-salesman-game/'
	},
	{
		title: 'TerraStat.jl',
		description:
			'Julia package for pulling BLS economic data based on custom geospatial shapes. Draw a region, get the data.',
		tech: ['Julia', 'BLS API', 'Geospatial'],
		github: 'https://github.com/mthelm85/TerraStat.jl'
	},
	{
		title: 'Fuzzy Joiner',
		description:
			'Perform fuzzy joins on two tables. The larger data set builds a Burkhard-Keller tree for efficient nearest neighbor searches using the Levenshtein edit distance. Core engine written in Rust, compiled to WebAssembly.',
		tech: ['Vue.js', 'Vuetify', 'Rust', 'WebAssembly'],
		link: 'https://fuzzy-joiner.vercel.app/'
	}
];
