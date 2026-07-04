import type { CapabilityReport, Tier } from './capability';

/**
 * Global garden state (rune-based). Grows with the milestones —
 * camera target, active specimen, audio, visited set arrive in M2+.
 */
class GardenState {
	/** null until the capability probe finishes. */
	report = $state<CapabilityReport | null>(null);

	get tier(): Tier | null {
		return this.report?.tier ?? null;
	}
}

export const garden = new GardenState();
