const KONAMI = [
	'ArrowUp',
	'ArrowUp',
	'ArrowDown',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight',
	'ArrowLeft',
	'ArrowRight',
	'b',
	'a'
];

export function initKonami(onActivate: () => void): () => void {
	let pos = 0;

	const handler = (e: KeyboardEvent) => {
		if (e.key === KONAMI[pos]) {
			pos++;
			if (pos === KONAMI.length) {
				pos = 0;
				onActivate();
			}
		} else {
			pos = e.key === KONAMI[0] ? 1 : 0;
		}
	};

	window.addEventListener('keydown', handler);
	return () => window.removeEventListener('keydown', handler);
}
