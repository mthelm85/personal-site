export type PerformanceTier = 'high' | 'low';

export function getPerformanceTier(): PerformanceTier {
	if (typeof navigator === 'undefined') return 'high';
	const cores = navigator.hardwareConcurrency ?? 2;
	const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	if (isMobile || cores <= 2) return 'low';
	return 'high';
}

export function getIterationsPerFrame(tier: PerformanceTier): number {
	return tier === 'high' ? 1500 : 400;
}
