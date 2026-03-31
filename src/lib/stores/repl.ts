import { writable } from 'svelte/store';

export type ReplMode = 'default' | 'flowfield' | 'mandelbrot' | 'conway' | 'euler' | 'lorenz';

export const replOpen = writable<boolean>(false);
export const currentEquation = writable<string>('');
export const replMode = writable<ReplMode>('default');

/** LaTeX labels for each section's current visual (populated by AttractorCanvas on mount) */
export const sectionLabels = writable<Record<string, string>>({});
