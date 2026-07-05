import { writable } from 'svelte/store';

export type ReplMode = 'default' | 'flowfield';

export const replOpen = writable<boolean>(false);
export const currentEquation = writable<string>('');
export const replMode = writable<ReplMode>('default');
